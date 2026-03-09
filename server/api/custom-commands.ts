import type { Elysia } from "elysia";
import { z } from "zod";
import {
  getCustomCommands,
  getCustomCommand,
  createCustomCommand,
  updateCustomCommand,
  deleteCustomCommand,
} from "@/db";

const permissionSchema = z.enum([
  "everyone",
  "follower",
  "subscriber",
  "vip",
  "moderator",
  "broadcaster",
]);

const createCommandSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().min(1).max(255),
  aliases: z.string().default("{}"),
  arguments: z.string().default("[]"),
  permission: permissionSchema.default("everyone"),
  code: z.string().min(1),
  isEnabled: z.boolean().default(true),
});

const updateCommandSchema = createCommandSchema.partial();

export function registerCustomCommandsAPI(app: Elysia) {
  app.get("/api/custom-commands", () => {
    return getCustomCommands();
  });

  app.get("/api/custom-commands/:id", ({ params: { id } }) => {
    const command = getCustomCommand(id);
    if (!command) return { error: "Command not found" };
    return command;
  });

  app.post("/api/custom-commands", ({ body }) => {
    const parsed = createCommandSchema.safeParse(body);
    if (!parsed.success) {
      return { success: false, error: z.treeifyError(parsed.error) };
    }
    try {
      const id = createCustomCommand(parsed.data);
      return { success: true, id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  app.put("/api/custom-commands/:id", ({ params: { id }, body }) => {
    const command = getCustomCommand(id);
    if (!command) return { error: "Command not found" };

    const parsed = updateCommandSchema.safeParse(body);
    if (!parsed.success) {
      return { success: false, error: z.treeifyError(parsed.error) };
    }
    try {
      updateCustomCommand(id, parsed.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  app.delete("/api/custom-commands/:id", ({ params: { id } }) => {
    const command = getCustomCommand(id);
    if (!command) return { error: "Command not found" };
    deleteCustomCommand(id);
    return { success: true };
  });

  return app;
}
