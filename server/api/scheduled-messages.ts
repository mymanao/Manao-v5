import type { Elysia } from "elysia";
import { getUserConfig, updateUserConfig } from "@/server/api/config";
import { startOne, stopOne } from "@/core/scheduled-messages";
import type { ScheduledMessage } from "@/core/types";
import { randomUUID } from "node:crypto";

export function registerScheduledMessagesAPI(app: Elysia) {
  // Get all
  app.get("/api/scheduled-messages", async () => {
    const config = await getUserConfig();
    return config.scheduledMessages ?? [];
  });

  // Create
  app.post("/api/scheduled-messages", async ({ body }) => {
    try {
      const b = body as Omit<ScheduledMessage, "id">;
      const config = await getUserConfig();
      const list = config.scheduledMessages ?? [];
      const entry: ScheduledMessage = { ...b, id: randomUUID() };
      list.push(entry);
      await updateUserConfig("scheduledMessages", list);
      if (entry.isEnabled) startOne(entry);
      return { success: true, entry };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Update
  app.put("/api/scheduled-messages/:id", async ({ params, body }) => {
    try {
      const config = await getUserConfig();
      const list = config.scheduledMessages ?? [];
      const idx = list.findIndex((m) => m.id === params.id);
      if (idx === -1) return { success: false, error: "Not found" };
      const updated = {
        ...list[idx],
        ...(body as Partial<ScheduledMessage>),
        id: params.id,
      } as ScheduledMessage;
      list[idx] = updated;
      await updateUserConfig("scheduledMessages", list);
      stopOne(params.id);
      if (updated.isEnabled) startOne(updated);
      return { success: true, entry: updated };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Delete
  app.delete("/api/scheduled-messages/:id", async ({ params }) => {
    try {
      const config = await getUserConfig();
      const list = (config.scheduledMessages ?? []).filter(
        (m) => m.id !== params.id,
      );
      await updateUserConfig("scheduledMessages", list);
      stopOne(params.id);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  return app;
}
