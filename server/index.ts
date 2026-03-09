import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { PORT } from "@/config";
import { logger } from "@/helpers/logger";
import { registerCommandsAPI } from "./api/commands";
import { registerConfigAPI } from "./api/config";
import { registerCustomCommandsAPI } from "./api/custom-commands";
import { registerMusicAPI } from "./api/music";
import type { CommandRegistry } from "@/core/registry";
import type { Language } from "@/core/types";

export { io } from "./services/socket.io";

export function createServer(registry: CommandRegistry, lang: Language) {
  const app = new Elysia();

  app.use(staticPlugin({ prefix: "/", assets: "./server/public" }));

  app.get("/scripts/socket.io/socket.io.js", () =>
    Bun.file("./node_modules/socket.io/client-dist/socket.io.js"),
  );

  registerCommandsAPI(app, registry, lang);
  registerConfigAPI(app);
  registerCustomCommandsAPI(app);
  registerMusicAPI(app);

  app.get("/*", () => Bun.file("./server/public/index.html"));

  return app;
}

export function startServer(registry: CommandRegistry, lang: Language): void {
  const app = createServer(registry, lang);
  app.listen({ port: PORT, hostname: "0.0.0.0" }, ({ hostname, port }) => {
    logger.info(`[Server] Running on http://${hostname}:${port}`);
  });
}
