import { closest } from "@/helpers/levenshtein";
import { logger } from "@/helpers/logger";
import { i18n } from "@/i18n";
import type { CommandContext } from "./types";
import type { CommandRegistry } from "./registry";

export async function runCommand(
  input: string,
  context: CommandContext,
  registry: CommandRegistry,
): Promise<void> {
  const { language } = context;
  const t = i18n[language];

  const parts = input.trim().split(/\s+/);
  const commandName = parts[0] ?? "";
  const args = parts.slice(1);

  try {
    const command = registry.find(commandName);

    if (!command) {
      const suggestion = closest(commandName, registry.allNames());
      const msg = suggestion
        ? t.command.notFound(commandName, suggestion)
        : t.command.notFoundNoSuggestion(commandName);
      await context.reply(msg);
      return;
    }

    // Platform filter
    if (command.platforms && !command.platforms.includes(context.user.platform as never)) {
      return;
    }

    // Permission check
    const permission = command.permission ?? "everyone";
    const { roles } = context.user;

    if (permission === "broadcaster" && !roles.isBroadcaster) {
      await context.reply(t.command.broadcasterOnly);
      return;
    }

    if (permission === "moderator" && !roles.isModerator && !roles.isBroadcaster) {
      await context.reply(t.command.moderatorOnly);
      return;
    }

    // Required args check
    if (command.arguments) {
      const missing = command.arguments.filter((arg, i) => arg.required && !args[i]);
      if (missing.length > 0) {
        const names = missing.map((arg) => arg.name[language]).join(", ");
        await context.reply(t.command.argsRequired(names));
        return;
      }
    }

    await command.execute(context, args);
    logger.info(`[Runner] ${context.user.platform} | ${commandName} by ${context.user.name}`);
  } catch (error) {
    await context.reply(t.command.error);
    logger.error(`[Runner] Error executing "${commandName}": ${error}`);
  }
}