import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Elysia } from "elysia";
import { getUserConfig, updateUserConfig } from "./config";

export interface SoundEntry {
  name: string;
  url: string;
}

export function registerSoundboardAPI(app: Elysia) {
  // List local sound files
  app.get("/api/sounds", () => {
    try {
      const dir = join(process.cwd(), "server/public/sounds");
      console.log(dir)
      const files = readdirSync(dir).filter((f) =>
        /\.(mp3|wav|ogg|m4a|webm)$/i.test(f),
      );
      return files.map((f) => `/sounds/${f}`);
    } catch {
      return [];
    }
  });

  // Serve sound files
  app.get("/sounds/:file", ({ params }) =>
    Bun.file(join(process.cwd(), "server/public/sounds", params.file)),
  );

  // Get soundboard list
  app.get("/api/soundboard", async () => {
    const config = await getUserConfig();
    return { soundboard: config.soundboard ?? [] };
  });

  // Save soundboard list
  app.post("/api/soundboard", async ({ body }) => {
    const { soundboard } = body as { soundboard: SoundEntry[] };
    await updateUserConfig("soundboard", soundboard);
    return { success: true };
  });

  return app;
}