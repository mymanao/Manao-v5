import { getBalance, initAccount } from "@/db";
import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "balance", th: "ยอดเงิน" },
  description: { en: "Check your balance", th: "ตรวจสอบยอดเงินของคุณ" },
  aliases: { en: ["bal", "money"], th: [] },
  arguments: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "User to check balance",
        th: "ผู้ใช้ที่ต้องการตรวจสอบยอดเงิน",
      },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];

    if (args[0]) {
      // Looking up another user — requires platform API, defer to adapter
      const targetName = args[0].replace(/^@/, "");
      ctx.emit("lookupUser", {
        platform: ctx.user.platform,
        name: targetName,
        callback: async (targetId: string | null) => {
          if (!targetId) {
            await ctx.reply(t.economy.errorUserNotFound(targetName));
            return;
          }
          const balance = getBalance(targetId);
          ctx.emit("feed", { status: "normal", icon: "👛", name: targetName, action: `${balance} ${ctx.currency}` });
          await ctx.reply(t.economy.currentBalance(balance, ctx.currency));
        },
      });
    } else {
      const id = initAccount(ctx.user.platformID, ctx.user.platform);
      const balance = getBalance(id);
      ctx.emit("feed", { status: "normal", icon: "👛", name: ctx.user.name, action: `${balance} ${ctx.currency}` });
      await ctx.reply(t.economy.currentBalance(balance, ctx.currency));
    }
  },
} satisfies Command;