import { KickIt } from "../src";

const bot = new KickIt({
  prefix: "!",
  auth: {
    clientId: Bun.env.KICK_CLIENT_ID!,
    clientSecret: Bun.env.KICK_CLIENT_SECRET!,
    accessToken: Bun.env.KICK_ACCESS_TOKEN!,
    refreshToken: Bun.env.KICK_REFRESH_TOKEN!,
    expiresAt: parseInt(Bun.env.KICK_EXPIRES_AT!, 10) || Date.now(),
    scopes: [
      "chat:write",
      "events:subscribe",
      "moderation:ban",
      "channel:read",
    ],
  },
  ngrok: {
    authtoken: Bun.env.NGROK_AUTHTOKEN,
    domain: "topical-goshawk-leading.ngrok-free.app",
    port: 5000,
    path: "/kick/webhook",
  },
});

/**
 * Simple ping command
 */
bot.command("ping", async (ctx) => {
  await ctx.reply("pong 🏓");
});

/**
 * Example command with arguments
 */
bot.command("love", async (ctx) => {
  const target = ctx.args.join(" ") || ctx.event.sender.username;
  const percent = Math.floor(Math.random() * 101);

  await ctx.reply(`${ctx.event.sender.username} ❤️ ${target}: ${percent}%`);
});

/**
 * Start the bot
 */
await bot.start();
