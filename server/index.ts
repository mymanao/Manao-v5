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
import { registerSoundboardAPI } from "@/server/api/soundboard.ts";
import { registerSocketAPI } from "@/server/api/socket.ts";
import open from "open";
import { internalIpV4 } from "internal-ip";
import { registerScheduledMessagesAPI } from "@/server/api/scheduled-messages.ts";

export { io } from "./services/socket.io";

export function createServer(registry: CommandRegistry, lang: Language) {
  const app = new Elysia();

  app.use(
    staticPlugin({ prefix: "/assets", assets: "./server/public/assets" }),
  );

  app.get("/favicon.ico", () => Bun.file("./server/public/favicon.ico"));
  app.get("/manao_mini.png", () => Bun.file("./server/public/manao_mini.png"));
  app.get("/scripts/socket.io/socket.io.js", () =>
    Bun.file("./node_modules/socket.io/client-dist/socket.io.js"),
  );

  registerCommandsAPI(app, registry, lang);
  registerConfigAPI(app);
  registerCustomCommandsAPI(app, registry);
  registerMusicAPI(app);
  registerSoundboardAPI(app);
  registerSocketAPI(app);
  registerScheduledMessagesAPI(app);

  app.get("/*", () => Bun.file("./server/public/index.html"));

  return app;
}

export function startServer(
  registry: CommandRegistry,
  lang: Language,
  webPort: number = PORT,
): void {
  const app = createServer(registry, lang);
  app.listen({ port: webPort, hostname: "0.0.0.0" }, async ({ port }) => {
    logger.info(`[Server] Running on http://${await internalIpV4()}:${port} <==========================`);
    await open(`http://localhost:${port}`);
  });
}
