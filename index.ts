import { TWITCH, DISCORD, KICK } from "@/config";
import { logger } from "@/helpers/logger";
import { CommandRegistry } from "@/core/registry";
import { buildCustomCommand } from "@/core/custom-commands";
import { getUserConfig } from "@/server/api/config";
import { getCustomCommands } from "@/db";
import { startServer } from "@/server";
import { setRegistry } from "@/commands/info/help";

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

const config = await getUserConfig();

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

logger.info(`[Manao] Loaded ${registry.size()} commands (${customCommands.length} custom)`);

if (TWITCH.ENABLED) {
  const { TwitchAdapter } = await import("@/platforms/twitch/adapter");
  const adapter = new TwitchAdapter(registry, config);
  await adapter.start();
}

if (KICK.ENABLED) {
  const { KickAdapter } = await import("@/platforms/kick/adapter");
  const adapter = new KickAdapter(registry, config);
  await adapter.start();
}

if (DISCORD.ENABLED) {
  const { DiscordAdapter } = await import("@/platforms/discord/adapter");
  const adapter = new DiscordAdapter(registry, config);
  await adapter.start();
}

startServer(registry, config.language);

logger.info("[Manao] Bot started successfully");