import type { Elysia } from "elysia";
import type { Configuration } from "@/core/types";
import {DEFAULT_OVERLAY_SETTINGS} from "@/helpers/overlayTheme.ts";

const CONFIG_PATH = `${process.cwd()}/userConfig.json`;

export async function getUserConfig(): Promise<Configuration> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) return getDefaultConfig();
  return file.json();
}

export async function updateUserConfig<K extends keyof Configuration>(
  key: K,
  value: Configuration[K],
): Promise<void> {
  const config = await getUserConfig();
  config[key] = value;
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getDefaultConfig(): Configuration {
  return {
    prefix: { twitch: "!", kick: "!", discord: "!" },
    defaultSongs: [],
    disabledCommands: [],
    language: "en",
    currency: "COIN",
    customMessages: {
      onFollow: { en: "[user] just followed!", th: "[user] ติดตามแล้ว!" },
      onSubscribe: {
        en: "[user] just subscribed!",
        th: "[user] สมัครสมาชิกแล้ว!",
      },
      onGiftSubscribe: { en: "[user] gifted a sub!", th: "[user] ของขวัญซับ!" },
      onRaid: {
        en: "[user] raided with [viewers] viewers!",
        th: "[user] บุกมาพร้อม [viewers] คน!",
      },
      onCheer: {
        en: "[user] cheered [amount] bits!",
        th: "[user] เชียร์ [amount] บิต!",
      },
    },
    customReplies: [],
    soundRewards: [],
    soundboard: [],
    chatRewards: {
      twitch: { minimum: 1, maximum: 4, chance: 75, cooldown: 60 },
      kick: { minimum: 1, maximum: 4, chance: 75, cooldown: 60 },
      discord: { minimum: 1, maximum: 4, chance: 75, cooldown: 60 },
    },
    scheduledMessages: [],
    overlaySettings: DEFAULT_OVERLAY_SETTINGS
  };
}

export function registerConfigAPI(app: Elysia) {
  app.get("/api/config", async () => {
    return await getUserConfig();
  });

  app.post("/api/config", async ({ body }) => {
    try {
      const data = body as Partial<Configuration>;
      const config = await getUserConfig();
      Object.assign(config, data);
      await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  return app;
}
