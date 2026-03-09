import { getLinkedId, initAccount, linkPlatform } from "@/db";
import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

// In-memory link code store: code → { internalID, expires }
const linkCodes = new Map<string, { internalID: string; expires: number }>();
const CODE_TTL = 5 * 60 * 1000; // 5 minutes

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default {
  name: { en: "link", th: "เชื่อมบัญชี" },
  description: {
    en: "Link your account to another platform, or generate a code for others to use",
    th: "เชื่อมบัญชีกับแพลตฟอร์มอื่น หรือสร้างรหัสเพื่อให้แพลตฟอร์มอื่นเชื่อมมาหาคุณ",
  },
  aliases: { en: ["connect"], th: ["เชื่อม"] },
  arguments: [
    {
      name: { en: "code", th: "รหัสเชื่อมต่อ" },
      description: {
        en: "6-digit code from another platform, or leave blank to generate one",
        th: "รหัส 6 หลักจากแพลตฟอร์มอื่น หรือเว้นว่างเพื่อสร้างรหัส",
      },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const code = args[0]?.trim().toUpperCase();
    const internalID = getLinkedId(ctx.user.platformID, ctx.user.platform)
      ?? initAccount(ctx.user.platformID, ctx.user.platform);

    // Clean expired codes
    for (const [k, v] of linkCodes) {
      if (Date.now() > v.expires) linkCodes.delete(k);
    }

    if (!code) {
      const newCode = generateCode();
      linkCodes.set(newCode, { internalID, expires: Date.now() + CODE_TTL });
      await ctx.reply(`${t.configuration.linkCodeGenerated()}: ${newCode}`);
      return;
    }

    const entry = linkCodes.get(code);
    if (!entry || Date.now() > entry.expires) {
      await ctx.reply(t.configuration.errorCodeInvalidOrExpired());
      return;
    }

    if (entry.internalID === internalID) {
      await ctx.reply(t.configuration.errorLinkSelf());
      return;
    }

    try {
      linkPlatform(entry.internalID, ctx.user.platform, ctx.user.platformID);
    } catch {
      await ctx.reply(t.configuration.errorAlreadyLinked());
      return;
    }

    linkCodes.delete(code);
    await ctx.reply(t.configuration.linkSuccess());
  },
} satisfies Command;
