import { logger } from "@/helpers/logger";
import { addBalance, initAccount } from "@/db";
import { DISCORD } from "@/config";
import type { Configuration, CommandContext, MessageHandler, PlatformAdapter } from "@/core/types";
import type { CommandRegistry } from "@/core/registry";
import { dirname, importx } from "@discordx/importer";
import {BaseGuildTextChannel, Events, IntentsBitField, type Interaction, type Message} from "discord.js";
import { Client } from "discordx";
import { io } from "@/server/services/socket.io";

export class DiscordAdapter implements PlatformAdapter {
  readonly platform = "discord" as const;

  private bot!: Client;
  private messageHandler?: MessageHandler;
  private readonly cooldowns = new Map<string, number>();

  constructor(
    private readonly registry: CommandRegistry,
    private readonly config: Configuration,
  ) {}

  async start(): Promise<void> {
    if (!DISCORD.BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN not set");

    this.bot = new Client({
      botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
      ],
      silent: true,
    });

    this.bot.once(Events.ClientReady, async () => {
      await this.bot.guilds.fetch();
      void this.bot.initApplicationCommands();
      logger.info("[Discord] Adapter started");
    });

    this.bot.on("interactionCreate", (interaction: Interaction) => {
      this.bot.executeInteraction(interaction);
    });

    this.bot.on("messageCreate", async (message: Message) => {
      if (message.author.bot) return;
      await this.handleMessage(message);
    });

    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
    await this.bot.login(DISCORD.BOT_TOKEN);
  }

  async stop(): Promise<void> {
    await this.bot?.destroy();
    logger.info("[Discord] Adapter stopped");
  }

  async sendMessage(channel: string, message: string): Promise<void> {
    const ch = await this.bot.channels.fetch(channel);
    if (ch instanceof BaseGuildTextChannel) await ch.send(message);
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  //#region Private

  private async handleMessage(message: Message): Promise<void> {
    const discordId = message.author.id;
    const id = initAccount(discordId, "discord");

    try {
      await this.handleChatReward(id);

      const lang = this.config.language;
      const member = message.member;

      const ctx: CommandContext = {
        user: {
          id,
          name: message.author.username,
          platform: "discord",
          platformID: discordId,
          roles: {
            isFollower: false,
            isSubscriber: false,
            isVIP: false,
            isModerator: member?.permissions.has("ModerateMembers") ?? false,
            isBroadcaster: member?.permissions.has("Administrator") ?? false,
          },
        },
        channel: message.channelId,
        language: lang,
        currency: this.config.currency,
        say: async (msg) => {
          if (message.channel instanceof BaseGuildTextChannel) {
            await message.channel.send(msg);
          }
        },
        reply: async (msg) => { await message.reply(msg); },
        whisper: async (msg) => { await message.author.send(msg); },
        emit: (event, data) => io.emit(event, data),
      };

      await this.messageHandler?.(ctx, message.content);
      void this.bot.executeCommand(message);
    } catch (err) {
      logger.error(`[Discord] Error handling message: ${err}`);
    }
  }

  private async handleChatReward(id: string): Promise<void> {
    const reward = this.config.chatRewards.discord;
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

  //#endregion
}