import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve(process.cwd(), "setup/public");
const HAS_DIST = existsSync(DIST);

const ENV_PATH = resolve(process.cwd(), ".env");
const PORT = 4000;

function parseEnv(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return result;
}

function writeEnv(values: Record<string, string>): void {
  // Never write masked placeholder values
  const safe = Object.fromEntries(
    Object.entries(values).filter(([, v]) => !v.includes("•"))
  );
  const existing = existsSync(ENV_PATH)
    ? parseEnv(readFileSync(ENV_PATH, "utf-8"))
    : {};
  const merged = { ...existing, ...safe };

  // Preserve .env.example structure + comments
  const template = existsSync(resolve(process.cwd(), ".env.example"))
    ? readFileSync(resolve(process.cwd(), ".env.example"), "utf-8")
    : "";

  if (template) {
    const lines = template.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      const eq = trimmed.indexOf("=");
      if (eq === -1) return line;
      const key = trimmed.slice(0, eq).trim();
      return key in merged ? `${key}=${merged[key]}` : line;
    });
    // Append keys not in template
    const templateKeys = new Set(
      template.split("\n")
      .filter(l => l.includes("=") && !l.startsWith("#"))
      .map(l => l.split("=")[0].trim())
    );
    for (const [k, v] of Object.entries(merged)) {
      if (!templateKeys.has(k)) lines.push(`${k}=${v}`);
    }
    writeFileSync(ENV_PATH, lines.join("\n"));
  } else {
    const content = Object.entries(merged).map(([k, v]) => `${k}=${v}`).join("\n");
    writeFileSync(ENV_PATH, content);
  }
}

function readEnv(): Record<string, string> {
  if (!existsSync(ENV_PATH)) return {};
  return parseEnv(readFileSync(ENV_PATH, "utf-8"));
}

function isSetupComplete(): boolean {
  const env = readEnv();
  // At least one platform must be enabled and configured
  const twitchOk = env.USE_TWITCH === "true" &&
    !!env.TWITCH_CLIENT_ID && !!env.TWITCH_BOT_ACCESS_TOKEN;
  const discordOk = env.USE_DISCORD === "true" && !!env.DISCORD_BOT_TOKEN;
  const kickOk = env.USE_KICK === "true" && !!env.KICK_ACCESS_TOKEN;
  return twitchOk || discordOk || kickOk;
}

export function createSetupServer() {
  const app = new Elysia();

  // Pending OAuth sessions: state → { role, clientId, clientSecret }
  const pendingAuth = new Map<string, { role: "bot" | "broadcaster"; clientId: string; clientSecret: string }>();

  // Twitch OAuth — step 1: start flow
  app.post("/setup/api/twitch/authorize", ({ body }) => {
    const b = body as Record<string, string>;
    if (!b.clientId || !b.clientSecret || !b.role) {
      return { success: false, error: "Missing clientId, clientSecret or role" };
    }
    const state = crypto.randomUUID();
    pendingAuth.set(state, {
      role: b.role as "bot" | "broadcaster",
      clientId: b.clientId,
      clientSecret: b.clientSecret,
    });
    const SCOPES = [
      "user:edit", "user:manage:whispers", "user:read:email",
      "chat:read", "chat:edit", "channel:moderate", "moderation:read",
      "moderator:manage:shoutouts", "moderator:manage:announcements",
      "channel:manage:moderators", "channel:manage:broadcast",
      "channel:read:vips", "channel:read:subscriptions", "channel:manage:vips",
      "channel:read:redemptions", "channel:manage:redemptions",
      "moderator:read:followers", "bits:read",
    ].join(" ");
    const url = new URL("https://id.twitch.tv/oauth2/authorize");
    url.searchParams.set("client_id", b.clientId);
    url.searchParams.set("redirect_uri", "http://localhost:4000/setup/callback/twitch");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPES);
    url.searchParams.set("state", state);
    url.searchParams.set("force_verify", "true");
    return { success: true, url: url.toString() };
  });

  // Twitch OAuth — step 2: callback
  app.get("/setup/callback/twitch", async ({ query }) => {
    const { code, state, error } = query as Record<string, string>;
    if (error || !code || !state) {
      return new Response(`<script>window.close()</script>OAuth failed: ${error ?? "missing code"}`,
        { headers: { "Content-Type": "text/html" } });
    }
    const session = pendingAuth.get(state);
    if (!session) {
      return new Response(`<script>window.close()</script>Invalid state`,
        { headers: { "Content-Type": "text/html" } });
    }
    pendingAuth.delete(state);

    try {
      // Exchange code for tokens
      const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: session.clientId,
          client_secret: session.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: "http://localhost:4000/setup/callback/twitch",
        }),
      });
      const tokens = await tokenRes.json() as { access_token: string; refresh_token: string };

      // Fetch user info
      const userRes = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
          "Authorization": `Bearer ${tokens.access_token}`,
          "Client-Id": session.clientId,
        },
      });
      const userData = await userRes.json() as { data: { id: string; login: string }[] };
      const user = userData.data[0];

      if (session.role === "bot") {
        writeEnv({
          TWITCH_BOT_ACCESS_TOKEN: tokens.access_token,
          TWITCH_BOT_REFRESH_TOKEN: tokens.refresh_token,
          TWITCH_BOT_ID: user.id,
          TWITCH_CLIENT_ID: session.clientId,
          TWITCH_CLIENT_SECRET: session.clientSecret,
        });
      } else {
        writeEnv({
          BROADCASTER_ACCESS_TOKEN: tokens.access_token,
          BROADCASTER_REFRESH_TOKEN: tokens.refresh_token,
          BROADCASTER_ID: user.id,
          BROADCASTER_CHANNEL: user.login,
        });
      }

      return new Response(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center">
        <h2>✅ ${session.role === "bot" ? "Bot" : "Broadcaster"} account authorized!</h2>
        <p><strong>${user.login}</strong> (ID: ${user.id})</p>
        <p>You can close this window.</p>
        <script>window.close()</script>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    } catch (err) {
      return new Response(`<script>window.close()</script>Error: ${err}`,
        { headers: { "Content-Type": "text/html" } });
    }
  });

  // API routes first — must be before static plugin
  app.get("/setup/api/config", () => {
    const env = readEnv();
    return {
      complete: isSetupComplete(),
      twitch: {
        enabled: env.USE_TWITCH === "true",
        clientId: env.TWITCH_CLIENT_ID ?? "",
        clientSecret: env.TWITCH_CLIENT_SECRET ?? "",
        botId: env.TWITCH_BOT_ID ?? "",
        broadcasterId: env.BROADCASTER_ID ?? "",
        broadcasterChannel: env.BROADCASTER_CHANNEL ?? "",
        hasTokens: !!env.TWITCH_BOT_ACCESS_TOKEN,
      },
      discord: {
        enabled: env.USE_DISCORD === "true",
        token: env.DISCORD_BOT_TOKEN ?? "",
        hasToken: !!env.DISCORD_BOT_TOKEN,
      },
      kick: {
        enabled: env.USE_KICK === "true",
        clientId: env.KICK_CLIENT_ID ?? "",
        clientSecret: env.KICK_CLIENT_SECRET ?? "",
        hasTokens: !!env.KICK_ACCESS_TOKEN,
        ngrokAuthtoken: env.NGROK_AUTHTOKEN ?? "",
        ngrokDomain: env.NGROK_DOMAIN ?? "",
      },
    };
  });

  // Save Twitch config
  app.post("/setup/api/twitch", ({ body }) => {
    const b = body as Record<string, string>;
    const values: Record<string, string> = {
      USE_TWITCH: b.enabled === "true" ? "true" : "false",
    };
    if (b.clientId) values.TWITCH_CLIENT_ID = b.clientId;
    if (b.clientSecret && !b.clientSecret.includes("•")) values.TWITCH_CLIENT_SECRET = b.clientSecret;
    if (b.botId) values.TWITCH_BOT_ID = b.botId;
    if (b.broadcasterId) values.BROADCASTER_ID = b.broadcasterId;
    if (b.broadcasterChannel) values.BROADCASTER_CHANNEL = b.broadcasterChannel;
    if (b.botAccessToken && !b.botAccessToken.includes("•")) values.TWITCH_BOT_ACCESS_TOKEN = b.botAccessToken;
    if (b.botRefreshToken && !b.botRefreshToken.includes("•")) values.TWITCH_BOT_REFRESH_TOKEN = b.botRefreshToken;
    if (b.broadcasterAccessToken && !b.broadcasterAccessToken.includes("•")) values.BROADCASTER_ACCESS_TOKEN = b.broadcasterAccessToken;
    if (b.broadcasterRefreshToken && !b.broadcasterRefreshToken.includes("•")) values.BROADCASTER_REFRESH_TOKEN = b.broadcasterRefreshToken;
    writeEnv(values);
    return { success: true };
  });

  // Save Discord config
  app.post("/setup/api/discord", ({ body }) => {
    const b = body as Record<string, string>;
    const values: Record<string, string> = {
      USE_DISCORD: b.enabled === "true" ? "true" : "false",
    };
    if (b.botToken && !b.botToken.includes("•")) values.DISCORD_BOT_TOKEN = b.botToken;
    writeEnv(values);
    return { success: true };
  });

  // Kick OAuth flow — calls authenticateKick() from @manaobot/kickit/utils
  app.post("/setup/api/kick/authorize", async ({ body }) => {
    const b = body as Record<string, string>;
    if (!b.clientId || !b.clientSecret) {
      return { success: false, error: "Client ID and Secret required" };
    }
    try {
      const { authenticateKick } = await import("@manaobot/kickit/utils");
      const { access_token, refresh_token, expires_at } = await authenticateKick({
        clientId: b.clientId,
        clientSecret: b.clientSecret,
        scopes: [
          "user:read", "channel:read", "channel:write",
          "channel:rewards:read", "channel:rewards:write",
          "chat:write", "streamkey:read", "events:subscribe",
          "moderation:ban", "moderation:chat_message:manage", "kicks:read",
        ],
        port: 3002,
      });
      writeEnv({
        KICK_CLIENT_ID: b.clientId,
        KICK_CLIENT_SECRET: b.clientSecret,
        KICK_ACCESS_TOKEN: access_token,
        KICK_REFRESH_TOKEN: refresh_token,
        KICK_EXPIRES_AT: (expires_at ?? Date.now()).toString(),
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Save Kick config
  app.post("/setup/api/kick", ({ body }) => {
    const b = body as Record<string, string>;
    const values: Record<string, string> = {
      USE_KICK: b.enabled === "true" ? "true" : "false",
    };
    if (b.clientId) values.KICK_CLIENT_ID = b.clientId;
    if (b.clientSecret && !b.clientSecret.includes("•")) values.KICK_CLIENT_SECRET = b.clientSecret;
    if (b.accessToken) values.KICK_ACCESS_TOKEN = b.accessToken;
    if (b.refreshToken) values.KICK_REFRESH_TOKEN = b.refreshToken;
    if (b.expiresAt) values.KICK_EXPIRES_AT = b.expiresAt;
    if (b.ngrokAuthtoken) values.NGROK_AUTHTOKEN = b.ngrokAuthtoken;
    if (b.ngrokDomain) values.NGROK_DOMAIN = b.ngrokDomain;
    writeEnv(values);
    return { success: true };
  });

  // Static file serving — same pattern as server/index.ts
  if (HAS_DIST) {
    app.use(staticPlugin({ prefix: "/assets", assets: `${DIST}/assets` }));
    app.get("/*", () => Bun.file(`${DIST}/index.html`));
  } else {
    app.get("/", () =>
      new Response(
        `<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem">
        <h2>⚠️ Setup UI not built yet</h2>
        <p>Run: <code>bun run setup:build</code></p>
        <p>Then restart: <code>bun run setup</code></p>
        <hr/><p>API: <a href="/setup/api/config">/setup/api/config</a></p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      )
    );
    app.get("/*", () =>
      new Response(
        `<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem">
        <h2>⚠️ Setup UI not built yet</h2>
        <p>Run: <code>bun run setup:build</code></p>
        <p>Then restart: <code>bun run setup</code></p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      )
    );
  }

  return app;
}

export function startSetupServer() {
  const app = createSetupServer();
  app.listen({ port: PORT, hostname: "0.0.0.0" }, ({ hostname, port }) => {
    console.log(`\n🔧 Manao Setup: http://${hostname}:${port}\n`);
  });
}