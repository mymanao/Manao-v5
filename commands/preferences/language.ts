import { i18n } from "@/i18n";
import { getUserConfig, updateUserConfig } from "@/server/api/config";
import type { Command } from "@/core/types";

export default {
  name: { en: "language", th: "ภาษา" },
  description: { en: "Set your preferred language", th: "ตั้งค่าภาษาที่คุณต้องการ" },
  aliases: { en: ["lang"], th: [] },
  permission: "broadcaster",
  arguments: [
    {
      name: { en: "language", th: "ภาษา" },
      description: { en: "Language code (en/th)", th: "รหัสภาษา (en/th)" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const [lang] = args;

    if (!lang) {
      const langName = ctx.language === "en" ? "English" : "ไทย";
      await ctx.reply(t.configuration.currentLanguage(langName));
      return;
    }

    const requested = lang.toLowerCase();
    if (requested !== "en" && requested !== "th") {
      await ctx.reply(t.configuration.errorInvalidLanguage("en, th"));
      return;
    }

    await updateUserConfig("language", requested);
    const langName = requested === "en" ? "English" : "ไทย";
    await ctx.reply(i18n[requested].configuration.currentLanguageChanged(langName));
  },
} satisfies Command;
