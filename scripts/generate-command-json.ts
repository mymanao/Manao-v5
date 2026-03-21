/**
 * generate-commands-json.ts
 *
 * Generates docs/data/commands.generated.json from the v5 command source files.
 * Run with: bun run scripts/generate-commands-json.ts
 *
 * Output schema (compatible with Manao Wiki command pages):
 * {
 *   key: string          // filename without extension, e.g. "balance"
 *   category: string     // directory name, e.g. "economy"
 *   name: { en, th }
 *   description: { en, th }
 *   aliases?: { en: string[], th: string[] }
 *   permission: "everyone" | "follower" | "subscriber" | "vip" | "moderator" | "broadcaster"
 *   platforms: string[]  // ["twitch","kick","discord","youtube"] if not specified
 *   arguments?: { name: {en,th}, description: {en,th}, required?: boolean }[]
 * }
 */

import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, basename, dirname } from "node:path";

const COMMANDS_DIR = join(import.meta.dir, "../commands");
const OUT_DIR = join(import.meta.dir, "../docs/data");
const OUT_FILE = join(OUT_DIR, "commands.generated.json");

const ALL_PLATFORMS = ["twitch", "kick", "discord", "youtube"];

// ── Regex helpers ──────────────────────────────────────────────────────────────

function extractLocalized(
  src: string,
  field: string,
): { en: string; th: string } | null {
  // Matches: field: { en: "...", th: "..." } — double-quoted values (may contain apostrophes)
  const re = new RegExp(
    `${field}:\\s*\\{\\s*en:\\s*"([^"]*)"[^}]*?th:\\s*"([^"]*)"`,
    "s",
  );
  const m = src.match(re);
  if (!m) return null;
  return { en: m[1].trim(), th: m[2].trim() };
}

function extractAliases(src: string): { en: string[]; th: string[] } {
  const re = /aliases:\s*\{([^}]*)\}/s;
  const m = src.match(re);
  if (!m) return { en: [], th: [] };

  const block = m[1];

  const enM = block.match(/en:\s*\[([^\]]*)\]/);
  const thM = block.match(/th:\s*\[([^\]]*)\]/);

  const parseArr = (s: string | undefined): string[] => {
    if (!s) return [];
    return [...s.matchAll(/["'\`]([^"'\`]+)["'\`]/g)].map((x) => x[1]);
  };

  return { en: parseArr(enM?.[1]), th: parseArr(thM?.[1]) };
}

function extractPermission(src: string): string {
  const m = src.match(/permission:\s*["'\`]([^"'\`]+)["'\`]/);
  return m ? m[1] : "everyone";
}

function extractPlatforms(src: string): string[] {
  const m = src.match(/platforms:\s*\[([^\]]*)\]/);
  if (!m) return ALL_PLATFORMS;
  return [...m[1].matchAll(/["'\`]([^"'\`]+)["'\`]/g)].map((x) => x[1]);
}

function extractArguments(src: string): {
  name: { en: string; th: string };
  description: { en: string; th: string };
  required?: boolean;
}[] {
  // Find the arguments array block
  const argsM = src.match(/arguments:\s*\[(.+?)^\s*\],/ms);
  if (!argsM) return [];

  const block = argsM[1];
  const args: {
    name: { en: string; th: string };
    description: { en: string; th: string };
    required?: boolean;
  }[] = [];

  // Split into individual argument objects by finding { ... } blocks
  const objRe = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/gs;
  for (const objM of block.matchAll(objRe)) {
    const obj = objM[0];
    const name = extractLocalized(obj, "name");
    const description = extractLocalized(obj, "description");
    if (!name || !description) continue;

    const reqM = obj.match(/required:\s*(true|false)/);
    const required = reqM ? reqM[1] === "true" : undefined;

    args.push({
      name,
      description,
      ...(required !== undefined ? { required } : {}),
    });
  }

  return args;
}

// ── Main ───────────────────────────────────────────────────────────────────────

const commands: unknown[] = [];

for (const category of readdirSync(COMMANDS_DIR)) {
  const categoryDir = join(COMMANDS_DIR, category);
  const stat = Bun.file(categoryDir);
  // Skip if not a directory (simple check via try/catch on readdir)
  let files: string[];
  try {
    files = readdirSync(categoryDir).filter((f) => f.endsWith(".ts"));
  } catch {
    continue;
  }

  for (const file of files) {
    const filePath = join(categoryDir, file);
    const src = await Bun.file(filePath).text();
    const key = basename(file, ".ts");

    const name = extractLocalized(src, "name");
    const description = extractLocalized(src, "description");

    if (!name || !description) {
      console.warn(`[skip] ${category}/${key}: missing name or description`);
      continue;
    }

    const aliases = extractAliases(src);
    const permission = extractPermission(src);
    const platforms = extractPlatforms(src);
    const args = extractArguments(src);

    commands.push({
      key,
      category,
      name,
      description,
      ...(aliases.en.length || aliases.th.length ? { aliases } : {}),
      permission,
      platforms,
      ...(args.length ? { arguments: args } : {}),
    });
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(commands, null, 2));

console.log(`✅ Generated ${commands.length} commands → ${OUT_FILE}`);
