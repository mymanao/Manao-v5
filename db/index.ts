import { Database } from "bun:sqlite";
import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import type { Platform } from "@/core/types";
import * as schema from "./schema";

const sqlite = new Database("./bot-data.sqlite", { create: true });
export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: "./db/migrations" });

export function getLinkedId(
  platformId: string,
  platform: Platform,
): string | undefined {
  const column = platformToColumn(platform);
  const row = db
    .select({ id: schema.linkedAccounts.id })
    .from(schema.linkedAccounts)
    .where(eq(column, platformId))
    .get();
  return row?.id;
}

export function initAccount(platformId: string, platform: Platform): string {
  const existing = getLinkedId(platformId, platform);
  if (existing) return existing;

  const id = Bun.randomUUIDv7();
  const column = platformToColumn(platform);

  db.insert(schema.linkedAccounts)
    .values({ id, [column.name]: platformId })
    .run();
  db.insert(schema.users).values({ id }).run();

  return id;
}

export function linkPlatform(
  id: string,
  platformId: string,
  platform: Platform,
): void {
  const column = platformToColumn(platform);

  const existingOwner = db
    .select({ id: schema.linkedAccounts.id })
    .from(schema.linkedAccounts)
    .where(eq(column, platformId))
    .get();

  if (existingOwner) {
    if (existingOwner.id === id) return;
    mergeAccounts(id, existingOwner.id);
    return;
  }

  db.update(schema.linkedAccounts)
    .set({ [column.name]: platformId })
    .where(eq(schema.linkedAccounts.id, id))
    .run();
}

function mergeAccounts(targetId: string, orphanId: string): void {
  const orphan = db
    .select()
    .from(schema.linkedAccounts)
    .where(eq(schema.linkedAccounts.id, orphanId))
    .get();

  if (!orphan) return;

  const orphanBalance = db
    .select({ money: schema.users.money })
    .from(schema.users)
    .where(eq(schema.users.id, orphanId))
    .get();

  // Delete orphan first to release UNIQUE constraints
  db.delete(schema.linkedAccounts)
    .where(eq(schema.linkedAccounts.id, orphanId))
    .run();
  db.delete(schema.users).where(eq(schema.users.id, orphanId)).run();

  // Merge balance into target
  if (orphanBalance?.money) {
    db.update(schema.users)
      .set({ money: sql`${schema.users.money} + ${orphanBalance.money}` })
      .where(eq(schema.users.id, targetId))
      .run();
  }

  // Copy platform IDs from orphan to target
  const updates: Partial<typeof schema.linkedAccounts.$inferInsert> = {};
  if (orphan.twitchId) updates.twitchId = orphan.twitchId;
  if (orphan.kickId) updates.kickId = orphan.kickId;
  if (orphan.discordId) updates.discordId = orphan.discordId;
  if (orphan.youtubeId) updates.youtubeId = orphan.youtubeId;

  if (Object.keys(updates).length > 0) {
    db.update(schema.linkedAccounts)
      .set(updates)
      .where(eq(schema.linkedAccounts.id, targetId))
      .run();
  }
}

export function getBalance(id: string): number {
  const row = db
    .select({ money: schema.users.money })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .get();
  return row?.money ?? 0;
}

export function setBalance(id: string, amount: number): number {
  db.update(schema.users)
    .set({ money: amount })
    .where(eq(schema.users.id, id))
    .run();
  return amount;
}

export function addBalance(id: string, amount: number): number {
  db.update(schema.users)
    .set({ money: sql`${schema.users.money} + ${amount}` })
    .where(eq(schema.users.id, id))
    .run();
  return getBalance(id);
}

export function subtractBalance(id: string, amount: number): number {
  db.update(schema.users)
    .set({ money: sql`${schema.users.money} - ${amount}` })
    .where(eq(schema.users.id, id))
    .run();
  return getBalance(id);
}

export function getNickname(id: string): string | null {
  const row = db
    .select({ nickname: schema.users.nickname })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .get();
  return row?.nickname ?? null;
}

export function setNickname(id: string, nickname: string | null): void {
  db.update(schema.users)
    .set({ nickname })
    .where(eq(schema.users.id, id))
    .run();
}

export function getLeaderboard(limit = 5) {
  return db
    .select({
      id: schema.users.id,
      money: schema.users.money,
      nickname: schema.users.nickname,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.money))
    .limit(limit)
    .all();
}

export function getCustomCommands() {
  return db
    .select()
    .from(schema.customCommands)
    .where(eq(schema.customCommands.isEnabled, true))
    .all();
}

export function getCustomCommand(id: string) {
  return db
    .select()
    .from(schema.customCommands)
    .where(eq(schema.customCommands.id, id))
    .get();
}

export function createCustomCommand(
  command: Omit<
    typeof schema.customCommands.$inferInsert,
    "id" | "createdAt" | "updatedAt"
  >,
) {
  const id = Bun.randomUUIDv7();
  db.insert(schema.customCommands)
    .values({ ...command, id })
    .run();
  return id;
}

export function updateCustomCommand(
  id: string,
  data: Partial<typeof schema.customCommands.$inferInsert>,
) {
  db.update(schema.customCommands)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(schema.customCommands.id, id))
    .run();
}

export function deleteCustomCommand(id: string): void {
  db.delete(schema.customCommands)
    .where(eq(schema.customCommands.id, id))
    .run();
}

function platformToColumn(platform: Platform) {
  switch (platform) {
    case "twitch":
      return schema.linkedAccounts.twitchId;
    case "kick":
      return schema.linkedAccounts.kickId;
    case "discord":
      return schema.linkedAccounts.discordId;
    case "youtube":
      return schema.linkedAccounts.youtubeId;
  }
}
