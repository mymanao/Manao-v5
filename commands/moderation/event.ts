import { i18n } from "@/i18n";
import { isEventConnected, initializeConnection, disconnectConnection } from "@/helpers/event";
import type { Command } from "@/core/types";

export default {
  name: { en: "event", th: "อีเวนต์" },
  description: { en: "Initiate a new event", th: "เริ่มต้นอีเวนต์ใหม่" },
  aliases: { en: ["e", "ev"], th: ["อ"] },
  permission: "moderator",
  arguments: [
    {
      name: { en: "action", th: "คำสั่ง" },
      description: { en: "Action to perform (connect, disconnect)", th: "คำสั่งที่ต้องการ (connect, disconnect)" },
      required: true,
    },
    {
      name: { en: "url", th: "url" },
      description: { en: "URL to connect to", th: "URL ที่ต้องการเชื่อมต่อ" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const action = args[0]?.toLowerCase();

    if (action !== "connect" && action !== "disconnect") {
      await ctx.reply(t.moderation.errorInvalidAction());
      return;
    }

    if (action === "connect") {
      if (isEventConnected()) {
        await ctx.reply(t.moderation.errorEventAlreadyConnected());
        return;
      }

      const url = args[1];
      if (!url) {
        await ctx.reply(t.moderation.errorUrlRequired());
        return;
      }

      initializeConnection(url, (msg) => ctx.say(msg));
    } else {
      if (!isEventConnected()) {
        await ctx.reply(t.moderation.errorEventNotConnected());
        return;
      }

      disconnectConnection();
    }
  },
} satisfies Command;