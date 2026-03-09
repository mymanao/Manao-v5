import type { Command } from "@/core/types";

export default {
  name: { en: "hate", th: "เกลียด" },
  description: { en: "For whom do you hate?", th: "คุณเกลียดใคร?" },
  aliases: { en: [], th: ["เกลียด"] },
  arguments: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: { en: "The user you hate", th: "ผู้ใช้ที่คุณเกลียด" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const target = args[0] || ctx.user.name;
    const percent = Math.floor(Math.random() * 101);
    await ctx.say(`${ctx.user.name} 👿 ${target} ${percent}%`);
  },
} satisfies Command;
