import { password } from "@inquirer/prompts";
import { parseArgs } from "util";
import type { KickScopes } from "@manaobot/kick/types";
import { authenticateKick, isKickScope } from "../utils";

function parseCli() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      clientId: { type: "string", short: "i" },
      clientSecret: { type: "string", short: "s" },
      scopes: { type: "string" },
      "save-env": { type: "boolean" },
      port: { type: "string", short: "p" },
    },
    strict: true,
    allowPositionals: true,
  });

  return values;
}

const values = parseCli();

async function resolveConfig() {
  if (!values.scopes) {
    throw new Error(
      "Scopes are required. Provide them using --scopes (comma or space separated).",
    );
  }

  const clientId = values.clientId
    ? values.clientId.trim()
    : (await password({ message: "Enter your Client ID:" })).trim();

  const clientSecret = values.clientSecret
    ? values.clientSecret.trim()
    : (await password({ message: "Enter your Client Secret:" })).trim();

  const rawScopes = values.scopes
    .split(/[,\s]+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const scopes: KickScopes[] = [];
  const invalid: string[] = [];

  for (const scope of rawScopes) {
    if (isKickScope(scope)) scopes.push(scope);
    else invalid.push(scope);
  }

  if (!scopes.length) {
    throw new Error("No valid scopes provided.");
  }

  if (invalid.length) {
    console.warn("⚠ Invalid scopes ignored:", invalid.join(", "));
  }

  return {
    clientId,
    clientSecret,
    scopes,
    saveToEnv: Boolean(values["save-env"]),
  };
}

async function run(port: number) {
  const config = await resolveConfig();

  const c = await authenticateKick({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: config.scopes,
    port,
    saveToEnv: config.saveToEnv,
  });

  if (!config.saveToEnv) {
    console.log("\nAdd the following to your environment variables:");
    console.log(`KICK_ACCESS_TOKEN=${c.access_token}`);
    console.log(`KICK_REFRESH_TOKEN=${c.refresh_token}`);
    console.log(`KICK_EXPIRES_AT=${c.expires_at}`);
  }
  console.log(`==========> Scopes granted: ${config.scopes.join(", ")}`);

  console.log("\n✔ Authorization completed.");
}

const port = values.port ? parseInt(String(values.port), 10) : 3000;
await run(Number.isNaN(port) ? 3000 : port);
