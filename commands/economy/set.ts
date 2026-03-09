import { initAccount, setBalance } from "@/db";
import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "set", th: "ตั้งค่าเงิน" },
  description: { en: "Set user's money", th: "ตั้งค่าเงินของผู้ใช้" },
  aliases: { en: ["s"], th: ["ตั้งเงิน"] },
  permission: "moderator",
  arguments: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: { en: "The user you want to set money", th: "ผู้ใช้ที่คุณต้องการตั้งค่าเงิน" },
      required: true,
    },
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: { en: "The amount of money you want to set", th: "จำนวนเงินที่คุณต้องการตั้งค่า" },
      required: true,
    },
  ],
  platforms: ["twitch"],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const [target, amountStr] = args;
    const amount = Math.trunc(parseInt(amountStr ?? "-999", 10));

    if (!target) return;

    if (Number.isNaN(amount) || amount < 0) {
      await ctx.reply(t.economy.errorInvalidAmount());
      return;
    }

    const targetName = target.replace(/^@/, "");

    ctx.emit("lookupUser", { platform: ctx.user.platform, name: targetName, callback: async (targetId: string | null) => {
      if (!targetId) {
        await ctx.reply(t.economy.errorUserNotFound(targetName));
        return;
      }
      initAccount(targetId, ctx.user.platform);
      setBalance(targetId, amount);
      ctx.emit("feed", { status: "normal", icon: "📩", name: `System ➡ ${targetName}`, action: `${amount} ${ctx.currency}` });
      await ctx.reply(t.economy.transactionSuccess(amount, ctx.currency, targetName));
    }});
  },
} satisfies Command;
