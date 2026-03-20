import { TWITCH, DISCORD, KICK, YOUTUBE } from "@/config";
import { logger } from "@/helpers/logger";
import { CommandRegistry } from "@/core/registry";
import { buildCustomCommand } from "@/core/custom-commands";
import { getUserConfig } from "@/server/api/config";
import { getCustomCommands } from "@/db";
import {startServer} from "@/server";
import { setRegistry } from "@/commands/info/help";
import { startScheduledMessages, setSendFn } from "@/core/scheduled-messages";

// Economy
import balance from "@/commands/economy/balance";
import gamble from "@/commands/economy/gamble";
import autobet from "@/commands/economy/autobet";
import give from "@/commands/economy/give";
import set from "@/commands/economy/set";

// Info
import version from "@/commands/info/version";
import help from "@/commands/info/help";
import uptime from "@/commands/info/uptime";

// Social
import love from "@/commands/social/love";
import hate from "@/commands/social/hate";
import stomp from "@/commands/social/stomp";
import eat from "@/commands/social/eat";

// Preferences
import nickname from "@/commands/preferences/nickname";
import language from "@/commands/preferences/language";
import currency from "@/commands/preferences/currency";
import link from "@/commands/preferences/link";

// Music
import songPlaying from "@/commands/music/song-playing";
import songQueue from "@/commands/music/song-queue";
import songSkip from "@/commands/music/song-skip";
import songRemove from "@/commands/music/song-remove";
import songRequest from "@/commands/music/song-request";
import songDefault from "@/commands/music/song-default";

// Moderation
import announce from "@/commands/moderation/announce";
import shoutout from "@/commands/moderation/shoutout";
import game from "@/commands/moderation/game";
import stream from "@/commands/moderation/stream";
import event from "@/commands/moderation/event";
import type {Configuration} from "@/core/types.ts";
import type { TwitchAdapter } from "@/platforms/twitch/adapter";
import type { KickAdapter } from "@/platforms/kick/adapter";
import type {DiscordAdapter} from "@/platforms/discord/adapter.ts";
import type {YoutubeAdapter} from "@/platforms/youtube/adapter.ts";

let config = await getUserConfig();

const registry = new CommandRegistry();
registry.registerAll([
  balance,
  gamble,
  autobet,
  give,
  set,
  version,
  help,
  uptime,
  love,
  hate,
  stomp,
  eat,
  nickname,
  language,
  currency,
  link,
  songPlaying,
  songQueue,
  songSkip,
  songRemove,
  songRequest,
  songDefault,
  announce,
  shoutout,
  game,
  stream,
  event,
]);

setRegistry(registry);

const customCommands = getCustomCommands();
for (const row of customCommands) {
  registry.register(buildCustomCommand(row));
}

logger.info(
  `[Manao] Loaded ${registry.size()} commands (${customCommands.length} custom)`,
);

let twitchSend: ((msg: string) => Promise<void>) | null = null;
let kickSend: ((msg: string) => Promise<void>) | null = null;

let twAdapter: TwitchAdapter, kickAdapter: KickAdapter, discordAdapter: DiscordAdapter, ytAdapter: YoutubeAdapter;

if (TWITCH.ENABLED) {
  const { TwitchAdapter } = await import("@/platforms/twitch/adapter");
  twAdapter = new TwitchAdapter(registry, config);
  await twAdapter.start();
  twitchSend = (msg) => twAdapter.sendMessage(TWITCH.BROADCASTER.CHANNEL, msg);
}

if (KICK.ENABLED) {
  const { KickAdapter } = await import("@/platforms/kick/adapter");
  kickAdapter = new KickAdapter(registry, config);
  await kickAdapter.start();
  kickSend = (msg) => kickAdapter.sendMessage("", msg);
}

if (DISCORD.ENABLED) {
  const { DiscordAdapter } = await import("@/platforms/discord/adapter");
  discordAdapter = new DiscordAdapter(registry, config);
  await discordAdapter.start();
}

if (YOUTUBE.ENABLED) {
  const { YoutubeAdapter } = await import("@/platforms/youtube/adapter");
  ytAdapter = new YoutubeAdapter(registry, config);
  await ytAdapter.start();
}

export async function updateConfig(newConfig: Configuration) {
  config = newConfig;
  logger.info("[Manao] ====================> Updating configuration...");

  if (TWITCH.ENABLED && twAdapter) {
    const { TwitchAdapter } = await import("@/platforms/twitch/adapter");
    await twAdapter.stop();
    twAdapter = new TwitchAdapter(registry, config);
    await twAdapter.start();
    twitchSend = (msg) => twAdapter.sendMessage(TWITCH.BROADCASTER.CHANNEL, msg);
  }

  if (KICK.ENABLED && kickAdapter) {
    const { KickAdapter } = await import("@/platforms/kick/adapter");
    await kickAdapter.stop();
    kickAdapter = new KickAdapter(registry, config);
    await kickAdapter.start();
    kickSend = (msg) => kickAdapter.sendMessage("", msg);
  }

  if (DISCORD.ENABLED && discordAdapter) {
    const { DiscordAdapter } = await import("@/platforms/discord/adapter");
    await discordAdapter.stop();
    discordAdapter = new DiscordAdapter(registry, config);
    await discordAdapter.start();
  }

  if (YOUTUBE.ENABLED && ytAdapter) {
    const { YoutubeAdapter } = await import("@/platforms/youtube/adapter");
    await ytAdapter.stop();
    ytAdapter = new YoutubeAdapter(registry, config);
    await ytAdapter.start();
  }

  logger.info("[Manao] Configuration updated <====================");
}

setSendFn(async (platform, message) => {
  if (platform === "twitch") await twitchSend?.(message);
  else if (platform === "kick") await kickSend?.(message);
});

await startScheduledMessages();

try {
  startServer(registry, config.language);
} catch {
  startServer(registry, config.language, 0);
}

logger.info("[Manao] Bot started successfully");
