import { logger } from "@/helpers/logger";
import { addBalance, initAccount, getNickname } from "@/db";
import { runCommand } from "@/core/runner";
import { YOUTUBE } from "@/config";
import type {
  Configuration,
  CommandContext,
  MessageData,
  MessageHandler,
  PlatformAdapter,
} from "@/core/types";
import type { CommandRegistry } from "@/core/registry";
import { io } from "@/server/services/socket.io";
import { persistYoutubeTokens } from "./auth";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const MIN_POLL_INTERVAL_MS = 5_000;

interface LiveChatMessage {
  id: string;
  snippet: {
    type: string;
    authorChannelId: string;
    publishedAt: string;
    hasDisplayContent: boolean;
    displayMessage: string;
    textMessageDetails?: { messageText: string };
  };
  authorDetails: {
    channelId: string;
    displayName: string;
    profileImageUrl: string;
    isVerified: boolean;
    isChatOwner: boolean;
    isChatSponsor: boolean;
    isChatModerator: boolean;
  };
}

interface MessagesListResponse {
  nextPageToken: string;
  pollingIntervalMillis: number;
  items: LiveChatMessage[];
}

export class YoutubeAdapter implements PlatformAdapter {
  readonly platform = "youtube" as const;

  private accessToken = YOUTUBE.ACCESS_TOKEN;
  private refreshToken = YOUTUBE.REFRESH_TOKEN;
  private liveChatId: string | null = null;
  private nextPageToken: string | null = null;
  private pollTimer: Timer | null = null;
  private messageHandler?: MessageHandler;
  private readonly cooldowns = new Map<string, number>();
  private readonly sequenceIndex = new Map<string, number>();
  private readonly seenIds = new Set<string>();

  constructor(
    private readonly registry: CommandRegistry,
    private readonly config: Configuration,
  ) {}

  async start(): Promise<void> {
    this.liveChatId = await this.fetchActiveLiveChatId();
    if (!this.liveChatId) {
      logger.warn(
        "[YouTube] Live chat not found, retrying in 60 seconds.",
      );
      this.pollTimer = setTimeout(() => this.start(), 60_000);
      return;
    }

    logger.info(`[YouTube] Found live chat: ${this.liveChatId}`);

    // Warm up: fetch current messages to seed seenIds so we don't replay history
    await this.poll(true);
    logger.info("[YouTube] Adapter started");
  }

  async stop(): Promise<void> {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    logger.info("[YouTube] Adapter stopped");
  }

  async sendMessage(_channel: string, message: string): Promise<void> {
    if (!this.liveChatId) return;
    await this.apiFetch(`${BASE_URL}/liveChat/messages?part=snippet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        snippet: {
          liveChatId: this.liveChatId,
          type: "textMessageEvent",
          textMessageDetails: { messageText: message },
        },
      }),
    });
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  private async fetchActiveLiveChatId(): Promise<string | null> {
    try {
      const data = await this.apiFetch<{
        items: { snippet: { liveChatId: string } }[];
      }>(
        `${BASE_URL}/liveBroadcasts?part=snippet&broadcastStatus=active&broadcastType=all`,
      );
      return data?.items?.[0]?.snippet?.liveChatId ?? null;
    } catch (err) {
      logger.error(`[YouTube] Failed to fetch live broadcast: ${err}`);
      return null;
    }
  }

  private async poll(seedOnly = false): Promise<void> {
    if (!this.liveChatId) return;

    try {
      const params = new URLSearchParams({
        part: "snippet,authorDetails",
        liveChatId: this.liveChatId,
        maxResults: "200",
      });
      if (this.nextPageToken) params.set("pageToken", this.nextPageToken);

      const data = await this.apiFetch<MessagesListResponse>(
        `${BASE_URL}/liveChat/messages?${params}`,
      );

      if (!data) return;

      this.nextPageToken = data.nextPageToken ?? null;

      if (!seedOnly) {
        for (const item of data.items) {
          if (this.seenIds.has(item.id)) continue;
          if (item.snippet.type !== "textMessageEvent") continue;
          if (!item.snippet.hasDisplayContent) continue;
          this.seenIds.add(item.id);
          await this.handleMessage(item);
        }
        // Prevent seenIds from growing unboundedly
        if (this.seenIds.size > 5_000) {
          const arr = [...this.seenIds];
          arr.slice(0, 2_500).forEach((id) => this.seenIds.delete(id));
        }
      } else {
        // Seed phase: just mark all current messages as seen
        for (const item of data.items) this.seenIds.add(item.id);
      }

      const interval = Math.max(
        data.pollingIntervalMillis ?? MIN_POLL_INTERVAL_MS,
        MIN_POLL_INTERVAL_MS,
      );
      this.pollTimer = setTimeout(() => this.poll(), interval);
    } catch (err) {
      logger.error(`[YouTube] Poll error: ${err}`);
      // Back off on error
      this.pollTimer = setTimeout(() => this.poll(), 15_000);
    }
  }

  private async handleMessage(item: LiveChatMessage): Promise<void> {
    const { authorDetails, snippet } = item;
    const userId = authorDetails.channelId;
    const user = authorDetails.displayName.replace(/^@/, "");
    const message =
      snippet.textMessageDetails?.messageText ?? snippet.displayMessage;

    try {
      const prefix = this.config.prefix.youtube;
      const id = initAccount(userId, "youtube");

      if (message.startsWith(prefix)) {
        const ctx: CommandContext = {
          user: {
            id,
            name: user,
            platform: "youtube",
            platformID: userId,
            roles: {
              isFollower: false,
              isSubscriber: authorDetails.isChatSponsor,
              isVIP: false,
              isModerator: authorDetails.isChatModerator,
              isBroadcaster: authorDetails.isChatOwner,
            },
          },
          channel: this.liveChatId!,
          language: this.config.language,
          currency: this.config.currency,
          say: (msg) => this.sendMessage("", msg),
          reply: (msg) => this.sendMessage("", `@${user} ${msg}`),
          whisper: (msg) => this.sendMessage("", `@${user} ${msg}`), // YouTube has no whisper
          emit: (event, data) => io.emit(event, data),
          lookupUser: async (_name) => null, // YouTube API has no lookup by display name
        };

        await runCommand(
          message.slice(prefix.length),
          ctx,
          this.registry,
          this.config.disabledCommands,
        );
        await this.messageHandler?.(ctx, message);
      } else {
        await this.handleChatReward(id);
        await this.handleCustomReplies(message);
        this.emitChatMessage(item, id);
      }
    } catch (err) {
      logger.error(`[YouTube] Error handling message from ${user}: ${err}`);
    }
  }

  private emitChatMessage(item: LiveChatMessage, id: string): void {
    const { authorDetails, snippet } = item;
    const nickname = getNickname(id);

    const messageData: MessageData = {
      from: "youtube",
      user: nickname
        ? `${authorDetails.displayName} (${nickname})`
        : authorDetails.displayName,
      message:
        snippet.textMessageDetails?.messageText ?? snippet.displayMessage,
      id: item.id,
      roles: {
        isFollower: false,
        isSubscriber: authorDetails.isChatSponsor,
        isVIP: false,
        isModerator: authorDetails.isChatModerator,
        isBroadcaster: authorDetails.isChatOwner,
      },
      color: "#FF0000",
      badges: [],
    };

    io.emit("message", messageData);
  }

  private async handleChatReward(id: string): Promise<void> {
    const reward = this.config.chatRewards.youtube;
    const now = Date.now();
    const last = this.cooldowns.get(id) ?? 0;

    if (now - last > reward.cooldown * 1000) {
      if (Math.random() < reward.chance / 100) {
        const amount =
          Math.floor(Math.random() * (reward.maximum - reward.minimum + 1)) +
          reward.minimum;
        addBalance(id, amount);
      }
      this.cooldowns.set(id, now);
    }
  }

  private async handleCustomReplies(message: string): Promise<void> {
    const lowerMsg = message.toLowerCase();

    for (const reply of this.config.customReplies) {
      for (const keyword of reply.keywords) {
        const lowerKey = keyword.toLowerCase();
        const matched =
          reply.keywordType === "exact"
            ? lowerMsg === lowerKey
            : lowerMsg.includes(lowerKey);

        if (!matched) continue;

        let response = "";
        if (reply.responseType === "random") {
          response =
            reply.responses[
              Math.floor(Math.random() * reply.responses.length)
            ] ?? "";
        } else {
          const key = reply.keywords.join(",");
          const idx = this.sequenceIndex.get(key) ?? 0;
          response = reply.responses[idx] ?? "";
          this.sequenceIndex.set(key, (idx + 1) % reply.responses.length);
        }

        if (response) {
          await this.sendMessage("", response);
          logger.info("[YouTube] Custom reply sent");
        }
        return;
      }
    }
  }

  // ── OAuth fetch helper ────────────────────────────────────────────────────

  private async apiFetch<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T | null> {
    const doRequest = async (token: string): Promise<Response> => {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${token}`);
      return fetch(url, { ...options, headers });
    };

    let res = await doRequest(this.accessToken);

    if (res.status === 401) {
      // Token expired — refresh and retry once
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
      res = await doRequest(this.accessToken);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`YouTube API ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: YOUTUBE.CLIENT_ID,
          client_secret: YOUTUBE.CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!res.ok) {
        logger.error(`[YouTube] Token refresh failed: ${res.status}`);
        return false;
      }

      const data = (await res.json()) as { access_token: string };
      this.accessToken = data.access_token;
      YOUTUBE.ACCESS_TOKEN = data.access_token;
      await persistYoutubeTokens(data.access_token, this.refreshToken);
      logger.info("[YouTube] Refreshed access token");
      return true;
    } catch (err) {
      logger.error(`[YouTube] Token refresh error: ${err}`);
      return false;
    }
  }
}
