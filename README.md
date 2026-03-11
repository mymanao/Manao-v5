<div align="center">
  <img src="/assets/manao-banner.png" width="100%" alt="Manao v5" />

  <img src="https://img.shields.io/badge/version-5.0.0--alpha.0-blueviolet?style=flat-square" alt="version" />
  <img src="https://img.shields.io/github/license/tinarskii/Manao-v5?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/runtime-Bun-f9f1e1?style=flat-square&logo=bun" alt="bun" />
  <img src="https://img.shields.io/badge/platforms-Twitch%20%7C%20Kick%20%7C%20Discord-9147ff?style=flat-square" alt="platforms" />
  <a href="https://discord.gg/vkW7YMyYaf"><img src="https://img.shields.io/discord/964718161624715304?style=flat-square&logo=discord&label=discord" alt="discord" /></a>
</div>

---

## Table of Contents

- [🤔 About](#-about)
- [📖 Wiki & Documentation](#-wiki--documentation)
- [📍 Features](#-features)
- [🚀 Getting Started](#-getting-started)
- [👋 Contributing & Community](#-contributing--community)
- [🙋 FAQ & Troubleshooting](#-faq--troubleshooting)
- [📜 License](#-license)

---

<img src="/assets/about-banner.png" width="100%" alt="About" />

## 🤔 About

Manao is an all-in-one streaming toolkit that packs an essential set of features and utilities, reducing
the need for multiple third-party services. Manao supports multiple streaming platforms (i.e. Twitch, and Kick) and
Discord. It has a built-in chat overlay, music request system, soundboard, and a powerful custom command system that
can be executed by multiple platforms with a single codebase. 

With the release of Manao v5, Manao has been completely rewritten from the ground up, to allow for future expansion to more platforms.
Not only that, the web dashboard and setup wizard has been rebuilt using React (SPA) with Vite. Along with a new Go-based installer that makes setup 
a lot easier.

---

<img src="/assets/wiki-and-docs-banner.png" width="100%" alt="Wiki & Docs" />

## 📖 Wiki & Documentation

Manao has its own dedicated wiki that provides an easy guide for streamers and users. The webpage
is built using Astro with Starlight and has support for multiple language (English and Thai). 
Contributions to the wiki are welcome.

- **Documentation:** [ManaoWiki](https://manaobot.netlify.app/)
- **Wiki Source:** [mymanao/manao-wiki](https://github.com/mymanao/manao-wiki)


---

## 📍 Features

### Chat Commands

| Category        | Command         | Description                                            |
|-:---------------|-:---------------|-:------------------------------------------------------|
| **Moderation**  | `announce`      | Broadcast an announcement to chat.                     |
|                 | `game`          | Update the stream's current category.                  |
|                 | `shoutout`      | Trigger a native Twitch shoutout.                      |
|                 | `stream`        | Update the stream title.                               |
| **Economy**     | `balance`       | Check user wallet balance.                             |
|                 | `gamble`        | Wager currency.                                        |
|                 | `give`          | Transfer currency to another user.                     |
|                 | `autobet`       | Execute multiple automated wagers.                     |
|                 | `leaderboard`   | Display top balances.                                  |
| **Social**      | `eat`           | RNG food selection.                                    |
|                 | `hate` / `love` | RNG affinity calculators.                              |
|                 | `stomp`         | Chat interaction command.                              |
| **Info**        | `help`          | Display available commands.                            |
|                 | `uptime`        | Show current stream duration.                          |
|                 | `version`       | Show current bot version.                              |
| **Preferences** | `nickname`      | Set local alias (syncs with chat overlay).             |
|                 | `language`      | Toggle bot response language (EN/TH).                  |
| **Music**       | `song-*`        | Queue management (`sq`, `sd`, `rm`, `sk`, `sr`, `np`). |

### Custom Commands

Manao supports custom commands, which can be configured via the dashboard.
Command's script is written in JavaScript, this is the available context:

```ts
// Info of the user who triggered the command
context.user.name                // Name of the user   
context.user.id                  // Internal Manao UserID (For linking account) 
context.user.platform            // Platform of the user (e.g. "twitch","kick", "discord") 
context.user.platformID          // User ID (depends on the platform)    
context.user.roles.isFollower    // true if the user is a follower of the channel
context.user.roles.isSubscriber  // true if the user is a subscriber of the channel  
context.user.roles.isVIP         // true if the user is a VIP of the channel
context.user.roles.isModerator   // true if the user is a moderator of the channel      
context.user.roles.isBroadcaster // true if the user is a broadcaster         

// Information
context.channel            // Channel name
context.language           // Current language of the bot (e.g. "en", "th")
context.currency           // Currency name (default: "COIN")

// Functions to interact with chat
await context.say("...")        // Send a message in chat
await context.reply("...")      // Reply to the user in chat (mentioning them)
await context.whisper("...")    // Send a private message to the user (if supported by the platform)

// Other
await context.lookupUser("ชื่อ")  // Lookup user by name, returns an object with the same structure as context.user
context.emit("event", data)     // Emit a custom event that can be listened to by other commands or overlays
```

### Overlays (OBS Browser Sources)

Add these URLs as Browser Sources in OBS, Streamlabs, or any broadcast software:

| Overlay      | URL                                   |
|--:-----------|--:------------------------------------|
| Chat Overlay | `http://localhost:3000/overlay/chat`  |
| Event Feed   | `http://localhost:3000/overlay/feed`  |
| Music Player | `http://localhost:3000/overlay/music` |
| Sound Player | `http://localhost:3000/overlay/sound` |


### Soundboard & Channel Points

Map Twitch Channel Point redemptions to local audio files. Manage triggers and sounds from the dashboard.

### Custom Chat Replies

Define keyword or RegEx triggers that automatically fire a response in chat. Configure from the Replies section in the dashboard.

### Dashboard

A full React web dashboard for managing everything whether it's commands, soundboard, channel points, overlays, or bot settings.
Manage everything in one place at `http://localhost:3000`.

---

## 🚀 Getting Started

### Option A: Installer (Recommended)

Download the latest installer for your platform from the [Releases page](https://gitlab.com/mymanao/installer/-/releases).

Run the installer and follow the on-screen setup wizard. It will:
1. Install Bun automatically if not present
2. Clone the Manao repository
3. Build the dashboard and setup wizard
4. Create desktop shortcuts

### Option B: Manual Install

Prerequisites: [Git](https://git-scm.com/), [Bun](https://bun.sh/)

```bash
git clone https://github.com/tinarskii/Manao-v5.git
cd Manao-v5
bun install
bun run dashboard:build
bun run setup:build
```

Then run the setup wizard:

```bash
bun run setup
```

Open `http://localhost:4000` in your browser and follow the steps to configure your platforms.

Once setup is complete, start the bot:

```bash
bun start
```

---

<img src="/assets/contributing-banner.png" width="100%" alt="Contributing" />

## 👋 Contributing & Community

We welcome contributions from the community! Whether it's adding a new feature, fixing a bug, or expanding our multilingual support, please review our [CONTRIBUTING.md](/.github/CONTRIBUTING.md) guidelines before opening a Pull Request.

If you have questions about the codebase or want to discuss a feature request, feel free to drop into our [Discord server](https://discord.gg/vkW7YMyYaf).

---

<img src="/assets/faq-banner.png" width="100%" alt="FAQ" />

## 🙋 FAQ & Troubleshooting

### How do I set up Twitch credentials?

Run the setup wizard (`bun run setup`) and navigate to the Twitch page. Enter your Client ID and Client Secret from the [Twitch Developer Portal](https://dev.twitch.tv/), then click **Authorize** to complete OAuth for both your bot account and broadcaster account.

### How do I set up Kick?

Create an app at [kick.com/settings/developer](https://kick.com/settings/developer), enter your credentials in the setup wizard, then click **Authorize Kick Account**. Kick EventSub webhooks require [ngrok](https://ngrok.com/), add your auth token in the wizard as well.

### Is Windows supported?

Yes. The Go installer handles setup on Windows, macOS, and Linux. Bun v1.0+ has native Windows support.

### The dashboard shows no data, what do I do?

Make sure the bot is running (`bun start`) before opening the dashboard. The dashboard connects via WebSocket and requires the bot process to be active.

### How do I report a security vulnerability?

Do not open a public issue. Join the [Discord server](https://discord.gg/vkW7YMyYaf) and DM `@acsp` (Tin) directly.

---

<img src="/assets/license-banner.png" width="100%" alt="License" />

## 📜 License

Licensed under the [GNU General Public License v3.0](/LICENSE). See the [GNU Official Website](https://www.gnu.org/licenses/gpl-3.0.en.html) for full details.