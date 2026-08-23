import type { ChatMessageEvent, KickScopes } from "@mymanao/kick/types";
import { KickClient } from "@mymanao/kick";
import type { KickIt } from "./src";

export * from "@mymanao/kick/types";

export interface NgrokOptions {
  authtoken?: string;
  domain?: string;
  port?: number;
  path?: string;
}

export interface AuthOptions {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: KickScopes[];
  port?: number;
  redirectUri?: string;
}

export interface KickItOptions {
  prefix?: string;
  auth: AuthOptions;
  ngrok?: NgrokOptions;
  envPath?: string;
}

export interface KickItContext {
  bot: KickIt;
  client: KickClient;
  event: ChatMessageEvent;
  args: string[];
  reply: (content: string) => Promise<any>;
}

export type CommandHandler = (ctx: KickItContext) => Promise<void> | void;
