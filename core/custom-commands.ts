import type { Command, CommandContext, Permission } from "./types";
import { logger } from "@/helpers/logger";

interface CustomCommandRow {
  id: string;
  name: string;
  description: string;
  aliases: string;
  arguments: string;
  permission: string;
  code: string;
  isEnabled: boolean;
}

export function buildCustomCommand(row: CustomCommandRow): Command {
  const aliases = (() => {
    try { return JSON.parse(row.aliases) as string[]; } catch { return []; }
  })();

  const args = (() => {
    try { return JSON.parse(row.arguments); } catch { return []; }
  })();

  return {
    name: { en: row.name, th: row.name },
    description: { en: row.description, th: row.description },
    aliases: aliases.length ? { en: aliases, th: aliases } : undefined,
    arguments: args,
    permission: row.permission as Permission,
    isCustom: true,
    execute: async (context: CommandContext, cmdArgs: string[]) => {
      try {
        const fn = new Function("context", "args", `"use strict";\n${row.code}`);
        await fn(context, cmdArgs);
      } catch (err) {
        logger.error(`[CustomCommand] "${row.name}" error: ${err}`);
        await context.reply(`Error running command "${row.name}"`);
      }
    },
  };
}