import { logger } from "@/helpers/logger";
import { addBalance, initAccount, getNickname } from "@/db";
import { runCommand } from "@/core/runner";
import { TWITCH } from "@/config";
import { initializeEventSub } from "./eventsub.ts";
import type { Configuration, MessageData } from "@/core/types";
import type {
  CommandContext,
  MessageHandler,
  PlatformAdapter,
} from "@/core/types";
import type { CommandRegistry } from "@/core/registry";
import { ApiClient } from "@twurple/api";
import {
  buildEmoteImageUrl,
  ChatClient,
  type ChatMessage,
  parseEmotePositions,
} from "@twurple/chat";
import { type AccessToken, RefreshingAuthProvider } from "@twurple/auth";
import { io } from "@/server/services/socket.io";

type UserType = "bot" | "broadcaster";

async function persistTokenToEnv(
  userType: UserType,
  token: AccessToken,
): Promise<void> {
  try {
    const envPath = `${process.cwd()}/.env`;
    const prefix = userType === "bot" ? "TWITCH_BOT" : "BROADCASTER";
    let envContent = await Bun.file(envPath).text();
    envContent = envContent
      .replace(
        new RegExp(`^${prefix}_ACCESS_TOKEN=.*$`, "m"),
        `${prefix}_ACCESS_TOKEN=${token.accessToken}`,
      )
      .replace(
        new RegExp(`^${prefix}_REFRESH_TOKEN=.*$`, "m"),
        `${prefix}_REFRESH_TOKEN=${token.refreshToken ?? ""}`,
      );
    await Bun.write(envPath, envContent);
    logger.info(`[Twitch] Persisted refreshed ${userType} token`);
  } catch (err) {
    logger.error(`[Twitch] Failed to persist token: ${err}`);
  }
}

function buildAuthProvider(): RefreshingAuthProvider {
  if (!TWITCH.CLIENT_ID || !TWITCH.CLIENT_SECRET) {
    throw new Error("Missing Twitch client ID or secret");
  }

  const authProvider = new RefreshingAuthProvider({
    clientId: TWITCH.CLIENT_ID,
    clientSecret: TWITCH.CLIENT_SECRET,
  });

  authProvider.onRefresh(async (userId, newToken) => {
    const userType: UserType = userId === TWITCH.BOT.ID ? "bot" : "broadcaster";
    switch (userType) {
      case "bot":
        TWITCH.BOT.ACCESS_TOKEN = newToken.accessToken;
        TWITCH.BOT.REFRESH_TOKEN = newToken.refreshToken ?? "";
        Bun.env.TWITCH_BOT_ACCESS_TOKEN = newToken.accessToken;
        Bun.env.TWITCH_BOT_REFRESH_TOKEN = newToken.refreshToken ?? "";
        break;
      case "broadcaster":
        TWITCH.BROADCASTER.ACCESS_TOKEN = newToken.accessToken;
        TWITCH.BROADCASTER.REFRESH_TOKEN = newToken.refreshToken ?? "";
        Bun.env.BROADCASTER_ACCESS_TOKEN = newToken.accessToken;
        Bun.env.BROADCASTER_REFRESH_TOKEN = newToken.refreshToken ?? "";
        break;
    }
    await persistTokenToEnv(userType, newToken);
    logger.info(`[Twitch] Refreshed ${userType} token`);
  });

  const buildTokens = (type: UserType): AccessToken => {
    const tokens = type === "bot" ? TWITCH.BOT : TWITCH.BROADCASTER;
    if (!tokens.ID) throw new Error(`Missing ${type} ID`);
    if (!tokens.ACCESS_TOKEN || !tokens.REFRESH_TOKEN) {
      throw new Error(`Missing ${type} Twitch tokens`);
    }
    return {
      accessToken: tokens.ACCESS_TOKEN,
      refreshToken: tokens.REFRESH_TOKEN,
      scope: TWITCH.SCOPES,
      expiresIn: 0,
      obtainmentTimestamp: Date.now(),
    };
  };

  authProvider.addUser(TWITCH.BOT.ID as string, buildTokens("bot"), ["chat"]);

  if (TWITCH.BROADCASTER.ACCESS_TOKEN && TWITCH.BROADCASTER.REFRESH_TOKEN) {
    authProvider.addUser(
      TWITCH.BROADCASTER.ID as string,
      buildTokens("broadcaster"),
    );
  }

  return authProvider;
}

async function processEmotes(
  message: string,
  msgObj: ChatMessage,
): Promise<string> {
  let processed = message;
  const emotes = parseEmotePositions(message, msgObj.emoteOffsets);
  for (const emote of emotes) {
    const url = buildEmoteImageUrl(emote.id, { size: "3.0" });
    processed = processed.replaceAll(
      emote.name,
      `<img src="${url}" alt="${emote.name}" /> `,
    );
  }
  return processed;
}

async function processBadges(
  badges: Map<string, string>,
  apiClient: ApiClient,
): Promise<string[]> {
  try {
    const globalBadges = await apiClient.chat.getGlobalBadges();
    const badgeList: string[] = [];
    for (const badge of badges.keys()) {
      const found = globalBadges.find(
        (b) =>
          b.getVersion("1")?.title?.toLowerCase().split(" ").join("-") ===
          badge,
      );
      const link = found?.getVersion("1")?.getImageUrl(4);
      if (link) badgeList.push(link);
    }
    return badgeList;
  } catch (err) {
    logger.error(`[Twitch] Failed to process badges: ${err}`);
    return [];
  }
}

export class TwitchAdapter implements PlatformAdapter {
  readonly platform = "twitch" as const;

  private chatClient!: ChatClient;
  private apiClient!: ApiClient;
  private messageHandler?: MessageHandler;
  private readonly cooldowns = new Map<string, number>();
  private readonly sequenceIndex = new Map<string, number>();

  constructor(
    private readonly registry: CommandRegistry,
    private readonly config: Configuration,
  ) {}

  async start(): Promise<void> {
    const authProvider = buildAuthProvider();
    this.apiClient = new ApiClient({ authProvider });

    const channel = TWITCH.BROADCASTER.CHANNEL;
    if (!channel) throw new Error("BROADCASTER_CHANNEL not set");

    this.chatClient = new ChatClient({ authProvider, channels: [channel] });

    this.chatClient.onConnect(() => {
      logger.info(`[Twitch] Connected to ${channel}`);
    });

    this.chatClient.onMessage(async (channelName, user, message, msgObj) => {
      const userId = msgObj.userInfo?.userId;
      const channelId = msgObj.channelId;
      if (!userId || !channelId) return;

      await this.handleMessage(
        channelName,
        user,
        userId,
        channelId,
        message,
        msgObj,
      );
    });

    this.chatClient.connect();
    await initializeEventSub(this.chatClient, this.apiClient);
    logger.info("[Twitch] Adapter started");
  }

  async stop(): Promise<void> {
    this.chatClient?.quit();
    logger.info("[Twitch] Adapter stopped");
  }

  async sendMessage(channel: string, message: string): Promise<void> {
    await this.chatClient.say(channel, message);
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  private async handleMessage(
    channel: string,
    user: string,
    userId: string,
    channelId: string,
    message: string,
    msgObj: ChatMessage,
  ): Promise<void> {
    try {
      const prefix = this.config.prefix.twitch;

      if (message.startsWith(prefix)) {
        const id = initAccount(userId, "twitch");
        const lang = this.config.language;

        const isMod = msgObj.userInfo.isMod;
        const isBroadcaster = userId === channelId;

        const ctx: CommandContext = {
          user: {
            id,
            name: user,
            platform: "twitch",
            platformID: userId,
            roles: {
              isFollower: !!(await this.apiClient.channels.getChannelFollowers(
                TWITCH.BROADCASTER.ID,
                userId,
              )),
              isSubscriber: msgObj.userInfo.isSubscriber,
              isVIP: msgObj.userInfo.isVip,
              isModerator: isMod,
              isBroadcaster,
            },
          },
          channel,
          language: lang,
          currency: this.config.currency,
          say: (msg) => this.chatClient.say(channel, msg),
          reply: (msg) => this.chatClient.say(channel, `@${user}, ${msg}`),
          whisper: async (msg) => {
            if (TWITCH.BOT.ID === userId) {
              await this.chatClient.say(channel, `@${user}, ${msg}`);
            } else {
              await this.apiClient.whispers.sendWhisper(
                TWITCH.BOT.ID,
                userId,
                msg,
              );
            }
          },
          emit: (event, data) => io.emit(event, data),
          lookupUser: async (name) => {
            const twitchUser = await this.apiClient.users.getUserByName(name);
            if (!twitchUser) return null;
            return initAccount(twitchUser.id, "twitch");
          },
          setGame: async (gameName) => {
            if (!gameName) {
              const channelInfo =
                await this.apiClient.channels.getChannelInfoById(
                  TWITCH.BROADCASTER.ID,
                );
              return channelInfo?.gameName ?? null;
            }
            const game = await this.apiClient.games.getGameByName(gameName);
            if (!game) return null;
            await this.apiClient.channels.updateChannelInfo(
              TWITCH.BROADCASTER.ID,
              { gameId: game.id },
            );
            return game.name;
          },
          setTitle: async (title) => {
            await this.apiClient.channels.updateChannelInfo(
              TWITCH.BROADCASTER.ID,
              { title },
            );
          },
          announce: async (message) => {
            await this.apiClient.chat.sendAnnouncement(TWITCH.BROADCASTER.ID, {
              message,
            });
          },
          shoutout: async (targetName) => {
            const target = await this.apiClient.users.getUserByName(targetName);
            if (!target) return false;
            await this.apiClient.chat.shoutoutUser(
              TWITCH.BROADCASTER.ID,
              target.id,
            );
            return true;
          },
          getUptime: async () => {
            try {
              const stream = await this.apiClient.streams.getStreamByUserId(
                TWITCH.BROADCASTER.ID,
              );
              return stream?.startDate ?? null;
            } catch (err) {
              logger.error(`[Twitch] Failed to get uptime: ${err}`);
              return null;
            }
          },
          followage: async (targetID) => {
            if (targetID === TWITCH.BROADCASTER.ID) {
              const channelInfo = await this.apiClient.users.getUserById(TWITCH.BROADCASTER.ID);
              return channelInfo?.creationDate ?? null;
            }
            let follow = await this.apiClient.channels.getChannelFollowers(TWITCH.BROADCASTER.ID, targetID);
            if (follow && follow.data.length > 0) {
              return follow.data[0]!.followDate ?? null;
            } else {
              return null;
            }
          }
        };

        await runCommand(
          message.slice(prefix.length),
          ctx,
          this.registry,
          this.config.disabledCommands,
        );
        await this.messageHandler?.(ctx, message);
      } else {
        await this.handleChatReward(userId, message, msgObj);
        await this.handleCustomReplies(channel, message);
      }
    } catch (err) {
      logger.error(`[Twitch] Error handling message from ${user}: ${err}`);
    }
  }

  private async handleChatReward(
    userId: string,
    message: string,
    msgObj: ChatMessage,
  ): Promise<void> {
    const id = initAccount(userId, "twitch");
    const { chatRewards } = this.config;
    const reward = chatRewards.twitch;
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

    const nickname = getNickname(id);
    const processedMessage = await processEmotes(message, msgObj);
    const badges = await processBadges(msgObj.userInfo.badges, this.apiClient);

    const messageData: MessageData = {
      from: "twitch",
      user: nickname
        ? `${msgObj.userInfo.displayName} (${nickname})`
        : msgObj.userInfo.displayName,
      message: processedMessage,
      id: msgObj.id,
      roles: {
        isFollower: false,
        isSubscriber: msgObj.userInfo.isSubscriber,
        isVIP: msgObj.userInfo.isVip,
        isModerator: msgObj.userInfo.isMod,
        isBroadcaster: msgObj.userInfo.isBroadcaster,
      },
      color: msgObj.userInfo.color ?? "#FFFFFF",
      badges,
    };

    io.emit("message", messageData);
  }

  private async handleCustomReplies(
    channel: string,
    message: string,
  ): Promise<void> {
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
          await this.chatClient.say(channel, response);
          logger.info(`[Twitch] Custom reply sent`);
        }
        return;
      }
    }
  }
}
