import type { Elysia } from "elysia";
import type { CommandRegistry } from "@/core/registry";
import type { Language } from "@/core/types";

export function registerCommandsAPI(app: Elysia, registry: CommandRegistry, lang: Language) {
  app.get("/api/commands", () => {
    return registry.all().map((command) => ({
      name: command.name[lang],
      description: command.description[lang],
      aliases: command.aliases?.[lang] ?? [],
      arguments: (command.arguments ?? []).map((arg) => ({
        name: arg.name[lang],
        description: arg.description[lang],
        required: arg.required ?? false,
      })),
      permission: command.permission ?? "everyone",
      platforms: command.platforms ?? [],
    }));
  });

  app.get("/api/commands/:name", ({ params: { name } }) => {
    const command = registry.find(decodeURIComponent(name));
    if (!command) return { error: "Command not found" };
    return {
      name: command.name[lang],
      description: command.description[lang],
      aliases: command.aliases?.[lang] ?? [],
      arguments: (command.arguments ?? []).map((arg) => ({
        name: arg.name[lang],
        description: arg.description[lang],
        required: arg.required ?? false,
      })),
      permission: command.permission ?? "everyone",
      platforms: command.platforms ?? [],
    };
  });

  return app;
}