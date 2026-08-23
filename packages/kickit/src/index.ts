import { KickClient } from "@manaobot/kick";
import type {ChatMessageEvent, KickTokenResponse} from "@manaobot/kick/types";
import type {
  CommandHandler,
  KickItContext,
  KickItOptions,
  NgrokOptions,
} from "../types";
import {saveEnv} from "../utils";

export class KickIt {
  private commands = new Map<string, CommandHandler>();
  private readonly prefix: string;
  private readonly ngrokOptions?: NgrokOptions;
  private started = false;

  public readonly kickClient: KickClient;

  constructor(options: KickItOptions) {
    this.prefix = options.prefix ?? "!";
    this.ngrokOptions = options.ngrok;

    this.kickClient = new KickClient({
      clientId: options.auth.clientId,
      clientSecret: options.auth.clientSecret,
      auth: {
        initialTokens: {
          access_token: options.auth.accessToken,
          refresh_token: options.auth.refreshToken,
          expires_at: options.auth.expiresAt,
        },
        onTokenUpdate: async (tokens: KickTokenResponse) => {
          options.auth.accessToken = tokens.access_token;
          options.auth.refreshToken = tokens.refresh_token;
          options.auth.expiresAt = tokens.expires_at;

          await saveEnv(options.envPath ?? ".env", {
            KICK_ACCESS_TOKEN: tokens.access_token,
            KICK_REFRESH_TOKEN: tokens.refresh_token,
            KICK_EXPIRES_AT: String(tokens.expires_at),
          });

          console.log(`[✔] Tokens updated. Access token expires at: ${new Date(tokens.expires_at).toLocaleString()}`);
        }
      },
      scopes: options.auth.scopes,
      redirectUri:
        options.auth.redirectUri ||
        `http://localhost:${options.auth.port || 3000}/callback`,
    });
  }

  /**
   * Register a command handler
   */
  command(name: string, handler: CommandHandler) {
    this.commands.set(name.toLowerCase(), handler);
  }

  /**
   * Ensure webhook server exists
   */
  private async initServer() {
    const port = this.ngrokOptions?.port ?? 5000;
    const path = this.ngrokOptions?.path ?? "/kick/webhook";

    if (this.ngrokOptions) {
      const { url } = await this.kickClient.webhooks.ngrok({
        port,
        path,
        domain: this.ngrokOptions.domain,
        authtoken: this.ngrokOptions.authtoken,
      });

      console.log(`[✔] ngrok tunnel established at: ${url}`);
    }

    this.kickClient.webhooks.createServer({ port, path });
  }

  /**
   * Start KickIt
   */
  async start(): Promise<void> {
    if (this.started) {
      console.warn("[KickIt] start() called more than once.");
      return;
    }
    this.started = true;

    await this.initServer();

    await this.kickClient.webhooks.subscribe({
      events: [{ name: "chat.message.sent" }],
    });

    this.kickClient.webhooks.on(
      "chat.message.sent",
      async (event: ChatMessageEvent) => {
        const message = event.content.trim();

        if (!message.startsWith(this.prefix)) return;

        const parts = message.slice(this.prefix.length).trim().split(/ +/);

        const commandName = parts.shift()?.toLowerCase();
        if (!commandName) return;

        const command = this.commands.get(commandName);
        if (!command) return;

        const ctx: KickItContext = {
          bot: this,
          client: this.kickClient,
          event,
          args: parts,
          reply: (content: string) => this.kickClient.chat.send({ content }),
        };

        try {
          await command(ctx);
        } catch (err) {
          console.error("[KickIt] Command error:", err);
        }
      },
    );

    console.log("[✔] KickIt client initialized.");
  }
}
