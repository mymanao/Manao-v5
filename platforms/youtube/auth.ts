import { logger } from "@/helpers/logger";
import { YOUTUBE } from "@/config";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

// Desktop app flow uses a dynamic localhost port — no redirect URI registration needed
export const DESKTOP_REDIRECT_URI = "http://localhost";

export async function persistYoutubeTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  try {
    const envPath = `${process.cwd()}/.env`;
    let envContent = await Bun.file(envPath).text();
    envContent = envContent
    .replace(
      /^YOUTUBE_ACCESS_TOKEN=.*$/m,
      `YOUTUBE_ACCESS_TOKEN=${accessToken}`,
    )
    .replace(
      /^YOUTUBE_REFRESH_TOKEN=.*$/m,
      `YOUTUBE_REFRESH_TOKEN=${refreshToken}`,
    );
    await Bun.write(envPath, envContent);
    logger.info("[YouTube] Persisted tokens to .env");
  } catch (err) {
    logger.error(`[YouTube] Failed to persist tokens: ${err}`);
  }
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: YOUTUBE.CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: YOUTUBE.SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params}`;
}

export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!res.ok) {
      logger.error(`[YouTube] Token exchange failed: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
    };
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (err) {
    logger.error(`[YouTube] Token exchange error: ${err}`);
    return null;
  }
}