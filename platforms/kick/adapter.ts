import { logger } from "@/helpers/logger";
import { addBalance, initAccount } from "@/db";
import { runCommand } from "@/core/runner";
import { KICK } from "@/config";
import type { Configuration, CommandContext, MessageHandler, PlatformAdapter } from "@/core/types";
import type { CommandRegistry } from "@/core/registry";
import type { ChatMessageEvent } from "@manaobot/kick/types";
import { KickIt } from "@manaobot/kickit";
import { io } from "@/server/services/socket.io";

export class KickAdapter implements PlatformAdapter {
  readonly platform = "kick" as const;

  private bot!: KickIt;
  private messageHandler?: MessageHandler;
  private readonly cooldowns = new Map<string, number>();
  private readonly sequenceIndex = new Map<string, number>();

  constructor(
    private readonly registry: CommandRegistry,
    private readonly config: Configuration,
  ) {}

  async start(): Promise<void> {
    this.bot = new KickIt({
      prefix: this.config.prefix.kick,
      auth: {
        clientId: KICK.ID,
        clientSecret: KICK.SECRET,
        accessToken: KICK.ACCESS_TOKEN,
        refreshToken: KICK.REFRESH_TOKEN,
        expiresAt: parseInt(KICK.EXPIRES_AT, 10) || Date.now(),
        scopes: [
          "user:read",
          "channel:read",
          "channel:write",
          "channel:rewards:read",
          "channel:rewards:write",
          "chat:write",
          "streamkey:read",
          "events:subscribe",
          "moderation:ban",
          "moderation:chat_message:manage",
          "kicks:read",
        ],
        port: 3002,
      },
      ngrok: {
        authtoken: KICK.NGROK_AUTHTOKEN,
        domain: KICK.NGROK_DOMAIN,
        port: 8080,
      },
    });

    await this.bot.start();

    this.bot.kickClient.webhooks.on("chat.message.sent", async (event: ChatMessageEvent) => {
      await this.handleMessage(event);
    });

    logger.info("[Kick] Adapter started");
  }

  async stop(): Promise<void> {
    logger.info("[Kick] Adapter stopped");
  }

  async sendMessage(_channel: string, message: string): Promise<void> {
    await this.bot.kickClient.chat.send({ content: message });
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  private async handleMessage(event: ChatMessageEvent): Promise<void> {
    const userId = event.sender.user_id.toString();
    const user = event.sender.username;
    const message = event.content;
    const channel = event.broadcaster.username;

    if (event.sender.identity?.badges?.some((b: any) => b.type === "bot")) return;

    try {
      const prefix = this.config.prefix.kick;
      const id = initAccount(userId, "kick");

      if (message.startsWith(prefix)) {
        const lang = this.config.language;
        const isBroadcaster = event.sender.user_id === event.broadcaster.user_id;
        const isMod = event.sender.identity?.badges?.some((b: any) => b.type === "moderator") || isBroadcaster;

        const ctx: CommandContext = {
          user: {
            id,
            name: user,
            platform: "kick",
            platformID: userId,
            roles: {
              isFollower: false,
              isSubscriber: event.sender.identity?.badges?.some((b: any) => b.type === "subscriber") ?? false,
              isVIP: event.sender.identity?.badges?.some((b: any) => b.type === "vip") ?? false,
              isModerator: isMod,
              isBroadcaster,
            },
          },
          channel,
          language: lang,
          currency: this.config.currency,
          say: async (msg) => { await this.bot.kickClient.chat.send({ content: msg }); },
          reply: async (msg) => { await this.bot.kickClient.chat.send({ content: `@${user}, ${msg}` }); },
          whisper: async (msg) => { await this.bot.kickClient.chat.send({ content: `@${user}, ${msg}` }); }, // Kick has no whisper
          emit: (event, data) => io.emit(event, data),
        };

        await runCommand(message.slice(prefix.length), ctx, this.registry);
        await this.messageHandler?.(ctx, message);
      } else {
        await this.handleChatReward(id);
        await this.handleCustomReply(message);
      }
    } catch (err) {
      logger.error(`[Kick] Error handling message from ${user}: ${err}`);
    }
  }

  private async handleChatReward(id: string): Promise<void> {
    const reward = this.config.chatRewards.kick;
    const now = Date.now();
    const last = this.cooldowns.get(id) ?? 0;

    if (now - last > reward.cooldown * 1000) {
      if (Math.random() < reward.chance / 100) {
        const amount = Math.floor(Math.random() * (reward.maximum - reward.minimum + 1)) + reward.minimum;
        addBalance(id, amount);
      }
      this.cooldowns.set(id, now);
    }
  }

  private async handleCustomReply(message: string): Promise<void> {
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
          response = reply.responses[Math.floor(Math.random() * reply.responses.length)] ?? "";
        } else {
          const key = reply.keywords.join(",");
          const idx = this.sequenceIndex.get(key) ?? 0;
          response = reply.responses[idx] ?? "";
          this.sequenceIndex.set(key, (idx + 1) % reply.responses.length);
        }

        if (response) {
          await this.bot.kickClient.chat.send({ content: response });
          logger.info("[Kick] Custom reply sent");
        }
        return;
      }
    }
  }
}