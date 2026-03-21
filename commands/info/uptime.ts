import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "uptime", th: "เวลาสตรีม" },
  description: {
    en: "Get the current uptime of the stream",
    th: "ตรวจสอบระยะเวลาที่สตรีมเปิดอยู่",
  },
  platforms: ["twitch", "kick"],
  execute: async (ctx) => {
    const t = i18n[ctx.language];
    // Stream uptime requires Twitch API — emitted to adapter layer to resolve
    ctx.emit("getUptime", {
      callback: async (startDate: Date | null) => {
        if (!startDate) {
          await ctx.reply(t.info.offline());
          return;
        }

        const diff = Date.now() - startDate.getTime();
        const totalSeconds = Math.floor(diff / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / 86400);

        const parts = [
          days > 0 ? `${days} วัน` : "",
          hours > 0 ? `${hours} ${t.info.hours()}` : "",
          minutes > 0 ? `${minutes} ${t.info.minutes()}` : "",
          seconds > 0 ? `${seconds} ${t.info.seconds()}` : "",
        ].filter(Boolean);

        await ctx.reply(t.info.uptime(parts.join(" ")));
      },
    });
  },
} satisfies Command;
