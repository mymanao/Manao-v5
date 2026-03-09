import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "announce", th: "ประกาศ" },
  description: {
    en: "Announce a message to the channel",
    th: "ประกาศข้อความไปยังช่อง",
  },
  aliases: { en: ["a", "an"], th: ["ป", "แจ้ง"] },
  permission: "moderator",
  platforms: ["twitch"],
  arguments: [
    {
      name: { en: "message", th: "ข้อความ" },
      description: { en: "Message to announce", th: "ข้อความที่ต้องการประกาศ" },
      required: true,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const message = args.join(" ");
    // Twitch announcement requires API — emitted to adapter layer
    ctx.emit("announce", {
      channelID: ctx.channel,
      message,
      onError: async () => {
        await ctx.reply(t.moderation.errorCannotAnnounce());
      },
    });
  },
} satisfies Command;
