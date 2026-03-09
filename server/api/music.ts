import type { Elysia } from "elysia";
import { songQueue } from "@/server/services/socket.io";

export function registerMusicAPI(app: Elysia) {
  app.get("/api/queue", () => songQueue);

  return app;
}