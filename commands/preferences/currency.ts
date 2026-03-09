import { i18n } from "@/i18n";
import { updateUserConfig } from "@/server/api/config";
import type { Command } from "@/core/types";

export default {
  name: { en: "currency", th: "สกุลเงิน" },
  description: { en: "Change the channel's currency", th: "เปลี่ยนสกุลเงินของช่อง" },
  permission: "broadcaster",
  arguments: [
    {
      name: { en: "currency", th: "สกุลเงิน" },
      description: { en: "Currency to set", th: "สกุลเงินที่ต้องการตั้งค่า" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const [currency] = args;

    if (!currency) {
      await ctx.say(t.configuration.currentCurrency(ctx.currency));
      return;
    }

    await updateUserConfig("currency", currency);
    await ctx.say(t.configuration.currentCurrencyChanged(currency));
  },
} satisfies Command;
