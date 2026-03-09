import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  money: integer("money").notNull().default(0),
  nickname: text("nickname"),
  createdAt: integer("created_at")
  .notNull()
  .default(sql`(strftime('%s', 'now'))`),
});

export const linkedAccounts = sqliteTable("linked_accounts", {
  id: text("id").primaryKey(),
  twitchId: text("twitch_id").unique(),
  kickId: text("kick_id").unique(),
  discordId: text("discord_id").unique(),
  linkedAt: integer("linked_at")
  .notNull()
  .default(sql`(strftime('%s', 'now'))`),
});

export const customCommands = sqliteTable("custom_commands", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  aliases: text("aliases").notNull().default("{}"),
  arguments: text("arguments").notNull().default("[]"),
  permission: text("permission", {
    enum: ["everyone", "follower", "subscriber", "vip", "moderator", "broadcaster"],
  })
  .notNull()
  .default("everyone"),
  code: text("code").notNull(),
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at")
  .notNull()
  .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at")
  .notNull()
  .default(sql`(strftime('%s', 'now'))`),
});
