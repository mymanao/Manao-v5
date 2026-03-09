import type { Command } from "@/core/types";

export default {
  name: { en: "love", th: "รัก" },
  description: { en: "How deep is your love?", th: "ความรักของคุณลึกแค่ไหน?" },
  arguments: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: { en: "The user you love", th: "ผู้ใช้ที่คุณรัก" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const target = args[0] || ctx.user.name;
    const royalNames = [
      "ในหลวง",
      "พ่อหลวง",
      "พ่อ",
      "ร.๙",
      "รัชกาลที่ ๙",
      "king rama ix",
      "rama ix",
      "king",
    ];
    const percent = royalNames.includes(target.toLowerCase())
      ? "๙๙"
      : String(Math.floor(Math.random() * 101));

    ctx.emit("feed", {
      status: "neutral",
      icon: "💘",
      name: `${ctx.user.name} ➡ ${target}`,
      action: `${percent}%`,
    });
    await ctx.say(`${ctx.user.name} 💘 ${target} ${percent}%`);
  },
} satisfies Command;
