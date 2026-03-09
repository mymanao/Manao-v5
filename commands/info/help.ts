import { i18n } from "@/i18n";
import type { Command } from "@/core/types";
import type { CommandRegistry } from "@/core/registry";

let registry: CommandRegistry | undefined;
export function setRegistry(r: CommandRegistry) {
  registry = r;
}

export default {
  name: { en: "help", th: "ช่วยเหลือ" },
  description: { en: "View all available commands", th: "ดูคำสั่งทั้งหมดที่ใช้ได้" },
  aliases: { en: ["h", "commands", "command"], th: ["คำสั่ง"] },
  arguments: [
    {
      name: { en: "command", th: "คำสั่ง" },
      description: { en: "Command name", th: "ชื่อคำสั่ง" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const lang = ctx.language;

    if (!registry) {
      await ctx.reply(t.command.error);
      return;
    }

    if (args[0]) {
      const cmd = registry?.find(args[0]);
      if (!cmd) {
        await ctx.reply(t.info.errorCommandNotFound(args[0]));
        return;
      }

      const argsList = (cmd.arguments ?? [])
      .map((arg) =>
        arg.required
          ? ` | <${arg.name[lang]}> - ${arg.description[lang]}`
          : ` | [${arg.name[lang]}] - ${arg.description[lang]}`,
      )
      .join("");

      const aliases = cmd.aliases?.[lang]?.join(", ");
      const aliasStr = aliases ? ` (${aliases})` : "";

      await ctx.say(
        `📚 ${cmd.name[lang]}${aliasStr}: ${cmd.description[lang]}${argsList}`,
      );
    } else {
      await ctx.reply(t.info.help());
    }
  },
} satisfies Command;