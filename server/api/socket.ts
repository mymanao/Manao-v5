import type {Elysia} from "elysia";
import {SOCKET_PORT, SOCKET_URL} from "@/server/services/socket.io.ts";

export function registerSocketAPI(app: Elysia) {
  app.get("/api/socket", () => {
    return {
      url: SOCKET_URL,
      port: SOCKET_PORT,
    }
  })
}