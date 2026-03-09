import type { Elysia } from "elysia";
import {
  getCustomCommands,
  getCustomCommand,
  createCustomCommand,
  updateCustomCommand,
  deleteCustomCommand,
} from "@/db";

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
    try {
      const data = body as Parameters<typeof createCustomCommand>[0];
      const id = createCustomCommand(data);
      return { success: true, id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  app.put("/api/custom-commands/:id", ({ params: { id }, body }) => {
    const command = getCustomCommand(id);
    if (!command) return { error: "Command not found" };
    try {
      updateCustomCommand(id, body as Parameters<typeof updateCustomCommand>[1]);
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