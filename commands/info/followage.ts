import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "followage", th: "อายุฟอล" },
  description: {
    en: "Get how long you've been following the channel",
    th: "ตรวจสอบระยะเวลาที่คุณติดตามช่องนี้",
  },
  platforms: ["twitch"],
  execute: async (ctx) => {
    const t = i18n[ctx.language];

    if (!ctx.followage) {
      return await ctx.reply(t.moderation.errorPlatformUnsupported());
    }

    const followDate = await ctx.followage(ctx.user.platformID);

    if (!followDate) {
      await ctx.reply(t.command.error);
      return;
    }

    const diff = Date.now() - followDate.getTime();
    const totalSeconds = Math.floor(diff / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / 86400) % 365;
    const years = Math.floor(totalSeconds / 31536000);

    const parts = [
      years > 0 ? `${years} ${t.info.years()}` : "",
      days > 0 ? `${days} ${t.info.days()}` : "",
      hours > 0 ? `${hours} ${t.info.hours()}` : "",
      minutes > 0 ? `${minutes} ${t.info.minutes()}` : "",
      seconds > 0 ? `${seconds} ${t.info.seconds()}` : "",
    ].filter(Boolean);

    await ctx.reply(t.info.followage(parts.join(" ")));
  },
} satisfies Command;
