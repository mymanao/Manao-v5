<p align="center">
  <a href="https://github.com/tinarskii/manao">
    <img src="https://raw.githubusercontent.com/tinarskii/manao/main/docs/manao.svg" height="64px" width="auto" />
    <h2 align="center">KickIt</h2>
  </a>
  <p align="center">
    Lightweight command framework for building Kick.com bots on top of <code>@manaobot/kick</code>.
    Designed for Bun. Built for simplicity.
  </p>
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
    <img src="https://img.shields.io/npm/v/@manaobot/kickit?color=00e701" alt="npm version">
    <img src="https://img.shields.io/github/license/tinarskii/manao" />
    <img src="https://img.shields.io/badge/Bun-%E2%9C%93-black?logo=bun" alt="Bun Compatible">
    <a href="https://discord.gg/vkW7YMyYaf"><img src="https://img.shields.io/discord/964718161624715304" /></a>
  </div>
</p>

---

## ⚡ About

**KickIt** is a minimal command framework built on top of `@manaobot/kick`.

It provides a clean abstraction for:

- Command handling
- Context-based message responses
- Webhook-driven bots
- Optional ngrok integration

KickIt does **not** replace the SDK — it extends it with a simple developer experience.

---

## 📦 Installation

```bash
bun add @manaobot/kickit
```

KickIt optionally supports ngrok for local development. To enable ngrok support, also install the ngrok package:

```bash
bun add @ngrok/ngrok
```

---

## 🚀 Quick Start

```ts
import {KickIt} from "../src";

const bot = new KickIt({
  prefix: "!",
  auth: {
    clientId: Bun.env.KICK_CLIENT_ID!,
    clientSecret: Bun.env.KICK_CLIENT_SECRET!,
    accessToken: Bun.env.KICK_ACCESS_TOKEN!,
    refreshToken: Bun.env.KICK_REFRESH_TOKEN!,
    expiresAt: parseInt(Bun.env.KICK_EXPIRES_AT!, 10) || Date.now(),
    scopes: ["chat:write", "events:subscribe", "moderation:ban", "channel:read"],
  },
  ngrok: {
    authtoken: Bun.env.NGROK_AUTHTOKEN,
    domain: "topical-goshawk-leading.ngrok-free.app",
    port: 5000,
    path: "/kick/webhook",
  },
});

bot.command("ping", async (ctx) => {
  await ctx.reply("pong 🏓");
});

bot.command("love", async (ctx) => {
  const target = ctx.args.join(" ") || ctx.event.sender.username;
  const percent = Math.floor(Math.random() * 101);

  await ctx.reply(
    `${ctx.event.sender.username} ❤️ ${target}: ${percent}%`
  );
});

await bot.start();
```

---

## ✨ Features

### ⚡ Command Framework

```ts
bot.command("hello", async (ctx) => {
  await ctx.reply("Hello chat!");
});
```

- Prefix-based commands
- Context-driven handlers
- Async support

---

### 🧠 Context API

Every command receives a structured context:

```ts
ctx.client   // KickClient instance
ctx.event    // Raw webhook event
ctx.args     // Command arguments
ctx.reply()  // Send chat message
```

This keeps KickIt lightweight while still giving full access to the SDK.

---

### 🔗 Built on @manaobot/kick

KickIt uses the official SDK internally:

- OAuth authentication
- Webhook subscriptions
- REST API access
- Chat messaging

You can still access the SDK directly:

```ts
ctx.client.api.users.get()
```

---

### 🌐 ngrok Support

Local development is easy:

```ts
ngrok: {
  authtoken: "...",
    domain: "your-domain.ngrok-free.app"
}
```

KickIt automatically:

- starts webhook server
- opens ngrok tunnel
- subscribes to events

---

## 🖥️ CLI

KickIt ships with a built-in CLI tool for authenticating with Kick and obtaining OAuth tokens. This is the fastest way to get your access token, refresh token, and expiry before wiring them into your bot config.

### Usage

```bash
bunx kickit --clientId <id> --clientSecret <secret> --scopes <scopes>
```

### Options

| Flag              | Short | Type    | Description                                                                 |
|-------------------|-------|---------|-----------------------------------------------------------------------------|
| `--clientId`      | `-i`  | string  | Your Kick application client ID. Prompted interactively if omitted.        |
| `--clientSecret`  | `-s`  | string  | Your Kick application client secret. Prompted interactively if omitted.    |
| `--scopes`        |       | string  | Comma or space separated list of OAuth scopes to request. **Required.**    |
| `--port`          | `-p`  | string  | Local port for the OAuth callback server. Defaults to `3000`.              |
| `--save-env`      |       | boolean | Automatically write tokens to a `.env` file instead of printing to stdout. |

### Scopes

Pass one or more valid `KickScopes` values separated by commas or spaces:

```bash
--scopes "chat:write,events:subscribe,channel:read"
# or
--scopes "chat:write events:subscribe channel:read"
```

Invalid scope values are ignored with a warning — the CLI will still proceed if at least one valid scope is provided.

### Examples

**Interactive credential entry (credentials prompted securely):**

```bash
bunx kickit --scopes "chat:write,events:subscribe"
```

**Fully non-interactive:**

```bash
bunx kickit -i your_client_id -s your_client_secret --scopes "chat:write,events:subscribe" --port 4000
```

**Save tokens directly to `.env`:**

```bash
bunx kickit -i your_client_id -s your_client_secret --scopes "chat:write" --save-env
```

### Output

Without `--save-env`, the CLI prints the tokens to stdout so you can copy them into your environment:

```
Add the following to your environment variables:
KICK_ACCESS_TOKEN=...
KICK_REFRESH_TOKEN=...
KICK_EXPIRES_AT=...
==========> Scopes granted: chat:write, events:subscribe

✔ Authorization completed.
```

With `--save-env`, tokens are written to your `.env` file automatically and the above output is skipped.

---

## 📚 Example

```ts
bot.command("love", async (ctx) => {
  const target = ctx.args.join(" ") || ctx.event.sender.username;
  const percent = Math.floor(Math.random() * 101);

  await ctx.reply(`${ctx.event.sender.username} ❤️ ${target}: ${percent}%`);
});
```

---

## 🧱 Philosophy

KickIt is intentionally minimal.

It focuses only on:

- Command handling
- Context abstraction
- Developer ergonomics

It does **not** attempt to replace the underlying SDK.

If you need low-level control, use:

```ts
ctx.client
```

---

## 🤝 Contributing

Pull requests are welcome.

You can help by:

- improving typings
- adding examples
- suggesting framework features

Join the Discord server:

https://discord.gg/vkW7YMyYaf

---

## 📜 License

GPL-3.0 License  
See LICENSE file for details.

---

## ❤️ Part of the Manao Ecosystem

KickIt works alongside:

- `@manaobot/kick` — Core SDK
- KickIt — Command framework