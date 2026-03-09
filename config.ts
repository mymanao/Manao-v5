import { z } from "zod";

const twitchSchema = z.object({
  USE_TWITCH: z.coerce.boolean().default(false),
  TWITCH_CLIENT_ID: z.string().min(1),
  TWITCH_CLIENT_SECRET: z.string().min(1),
  TWITCH_BOT_ID: z.string().min(1),
  TWITCH_BOT_ACCESS_TOKEN: z.string().default(""),
  TWITCH_BOT_REFRESH_TOKEN: z.string().default(""),
  BROADCASTER_ID: z.string().min(1),
  BROADCASTER_CHANNEL: z.string().min(1),
  BROADCASTER_ACCESS_TOKEN: z.string().default(""),
  BROADCASTER_REFRESH_TOKEN: z.string().default(""),
});

const discordSchema = z.object({
  USE_DISCORD: z.coerce.boolean().default(false),
  DISCORD_BOT_TOKEN: z.string().min(1),
});

const kickSchema = z.object({
  USE_KICK: z.coerce.boolean().default(false),
  KICK_CLIENT_ID: z.string().min(1),
  KICK_CLIENT_SECRET: z.string().min(1),
  KICK_ACCESS_TOKEN: z.string().min(1),
  KICK_REFRESH_TOKEN: z.string().min(1),
  KICK_EXPIRES_AT: z.string().min(1),
});

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  SOCKET_PORT: z.coerce.number().default(5000),
  NGROK_AUTHTOKEN: z.string().default(""),
  NGROK_DOMAIN: z.string().default(""),
});

const base = baseSchema.parse(Bun.env);
const useTwitch = Bun.env.USE_TWITCH === "true";
const useDiscord = Bun.env.USE_DISCORD === "true";
const useKick = Bun.env.USE_KICK === "true";

const twitch = useTwitch
  ? twitchSchema.parse(Bun.env)
  : twitchSchema.partial().parse(Bun.env);
const discord = useDiscord
  ? discordSchema.parse(Bun.env)
  : discordSchema.partial().parse(Bun.env);
const kick = useKick
  ? kickSchema.parse(Bun.env)
  : kickSchema.partial().parse(Bun.env);

export const IS_PRODUCTION = base.NODE_ENV === "production";
export const PORT = base.PORT;
export const SOCKET_PORT = base.SOCKET_PORT;

export const TWITCH = {
  ENABLED: useTwitch,
  CLIENT_ID: twitch.TWITCH_CLIENT_ID ?? "",
  CLIENT_SECRET: twitch.TWITCH_CLIENT_SECRET ?? "",
  BOT: {
    ID: twitch.TWITCH_BOT_ID ?? "",
    ACCESS_TOKEN: twitch.TWITCH_BOT_ACCESS_TOKEN ?? "",
    REFRESH_TOKEN: twitch.TWITCH_BOT_REFRESH_TOKEN ?? "",
  },
  BROADCASTER: {
    ID: twitch.BROADCASTER_ID ?? "",
    CHANNEL: twitch.BROADCASTER_CHANNEL ?? "",
    ACCESS_TOKEN: twitch.BROADCASTER_ACCESS_TOKEN ?? "",
    REFRESH_TOKEN: twitch.BROADCASTER_REFRESH_TOKEN ?? "",
  },
  SCOPES: [
    "user:edit",
    "user:manage:whispers",
    "user:read:email",
    "chat:read",
    "chat:edit",
    "channel:moderate",
    "moderation:read",
    "moderator:manage:shoutouts",
    "moderator:manage:announcements",
    "channel:manage:moderators",
    "channel:manage:broadcast",
    "channel:read:vips",
    "channel:read:subscriptions",
    "channel:manage:vips",
    "channel:read:redemptions",
    "channel:manage:redemptions",
    "moderator:read:followers",
    "bits:read",
  ],
};

export const DISCORD = {
  ENABLED: useDiscord,
  BOT_TOKEN: discord.DISCORD_BOT_TOKEN ?? "",
};

export const KICK = {
  ENABLED: useKick,
  ID: kick.KICK_CLIENT_ID ?? "",
  SECRET: kick.KICK_CLIENT_SECRET ?? "",
  ACCESS_TOKEN: kick.KICK_ACCESS_TOKEN ?? "",
  REFRESH_TOKEN: kick.KICK_REFRESH_TOKEN ?? "",
  EXPIRES_AT: kick.KICK_EXPIRES_AT ?? "",
  NGROK_AUTHTOKEN: base.NGROK_AUTHTOKEN,
  NGROK_DOMAIN: base.NGROK_DOMAIN,
};
