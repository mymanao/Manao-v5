import { addBalance, getBalance, initAccount, subtractBalance } from "@/db";
import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "give", th: "ให้เงิน" },
  description: { en: "Give money to someone else", th: "ให้เงินผู้อื่น" },
  aliases: { en: ["transfer"], th: [] },
  arguments: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to give money",
        th: "ผู้ใช้ที่คุณต้องการให้เงิน",
      },
      required: true,
    },
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "The amount of money you want to give",
        th: "จำนวนเงินที่คุณต้องการให้",
      },
      required: true,
    },
  ],
  platforms: ["twitch"], // requires API lookup — Twitch only for now
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const [target, amountStr] = args;
    const amount = Math.trunc(parseInt(amountStr ?? "0", 10));

    if (!target) return;

    if (Number.isNaN(amount) || amount <= 0) {
      await ctx.reply(t.economy.errorInvalidAmount());
      return;
    }

    const id = initAccount(ctx.user.platformID, ctx.user.platform);
    const balance = getBalance(id);

    if (amount > balance) {
      await ctx.reply(t.economy.errorInsufficientFunds());
      return;
    }

    const targetName = target.replace(/^@/, "");
    if (targetName.toLowerCase() === ctx.user.name.toLowerCase()) {
      await ctx.reply(t.economy.errorSelfTransfer());
      return;
    }

    const targetId = await ctx.lookupUser(targetName);
    if (!targetId) {
      await ctx.reply(t.economy.errorUserNotFound(targetName));
      return;
    }

    subtractBalance(id, amount);
    addBalance(targetId, amount);
    ctx.emit("feed", {
      status: "normal",
      icon: "📩",
      name: `${ctx.user.name} ➡ ${targetName}`,
      action: `${amount} ${ctx.currency}`,
    });
    await ctx.reply(t.economy.transactionSuccess(amount, ctx.currency, targetName));
  },
} satisfies Command;