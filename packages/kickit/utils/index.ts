import type { KickScopes, KickTokenResponse } from "@manaobot/kick/types";
import { KickClient } from "@manaobot/kick";
import open from "open";

const VALID_SCOPES: KickScopes[] = [
  "user:read",
  "channel:read",
  "channel:write",
  "channel:rewards:read",
  "channel:rewards:write",
  "chat:write",
  "streamkey:read",
  "events:subscribe",
  "moderation:ban",
  "moderation:chat_message:manage",
  "kicks:read",
];

export function isKickScope(value: string): value is KickScopes {
  return VALID_SCOPES.includes(value as KickScopes);
}
export interface KickAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes: KickScopes[];
  port?: number;
  showLog?: boolean;
  saveToEnv?: boolean;
  envPath?: string;
}

export async function saveEnv(path: string, entries: Record<string, string>) {
  const file = Bun.file(path);
  let envContent = (await file.exists()) ? await file.text() : "";

  for (const [key, value] of Object.entries(entries)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, line);
    } else {
      if (envContent.length && !envContent.endsWith("\n")) {
        envContent += "\n";
      }
      envContent += line + "\n";
    }
  }

  await Bun.write(path, envContent);
}

export async function authenticateKick(config: KickAuthConfig) {
  const {
    clientId,
    clientSecret,
    scopes,
    port = 3000,
    showLog = false,
    saveToEnv = false,
    envPath = ".env",
  } = config;

  return new Promise<KickTokenResponse>(async (resolve, reject) => {
    const kick = new KickClient({
      clientId,
      clientSecret,
      redirectUri: `http://localhost:${port}/callback`,
      scopes,
      showLog,
      auth: {
        onTokenUpdate: async (tokens) => {
          try {
            if (saveToEnv) {
              await saveEnv(envPath, {
                KICK_ACCESS_TOKEN: tokens.access_token,
                KICK_REFRESH_TOKEN: tokens.refresh_token,
                KICK_EXPIRES_AT: String(tokens.expires_at),
              });
            }

            resolve(tokens);
          } catch (err) {
            reject(err);
          }
        },
      },
    });

    kick.auth.createCallbackServer({ port });

    const url = kick.getAuthURL();
    await open(url);

    await kick.auth.waitForAuthorization()
  });
}
