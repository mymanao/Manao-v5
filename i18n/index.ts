//#region English

const en = {
  //#region Command
  command: {
    notFound: (name: string, suggestion: string) =>
      `Command "${name}" not found, did you mean "${suggestion}"?`,
    notFoundNoSuggestion: (name: string) => `Command "${name}" not found`,
    moderatorOnly: "This command is for moderators only",
    broadcasterOnly: "This command is for the broadcaster only",
    argsRequired: (args: string) => `Please provide the required arguments: ${args}`,
    error: "An error occurred while executing the command. The bot may have stopped working.",
    permissionDenied: "You don't have permission to run this command",
  },
  //#endregion

  //#region Economy
  economy: {
    userNotFound: (user: string) => `User not found: ${user}`,
    accountNotFound: (user: string) => `Account not found for user: ${user}`,
    invalidAmount: "Invalid amount",
    insufficientFunds: "You have insufficient funds to perform this action",
    invalidTimes: "Invalid number of times, please enter a number between 1 and 100",
    selfTransfer: "You cannot transfer money to yourself",
    balance: (amount: number, currency: string) =>
      `Your current balance is: ${amount} ${currency}`,
    gambleWin: (amount: number, currency: string, remaining: number) =>
      `🎉 Won ${amount} ${currency} — Balance: ${remaining} ${currency}`,
    gambleLose: (amount: number, currency: string, remaining: number) =>
      `❌ Lost ${amount} ${currency} — Balance: ${remaining} ${currency}`,
    autobetResult: (times: number, won: number, lost: number, remaining: number, currency: string) =>
      `Autobet: ${times} round(s) — Won ${won} Lost ${lost} — Balance: ${remaining} ${currency}`,
    transferSuccess: (amount: number, currency: string, target: string) =>
      `Transferred ${amount} ${currency} to ${target}`,
    leaderboardTitle: "🏆 Top 5 Richest Users 🏆 | ",
    setBalance: (user: string, amount: number, currency: string) =>
      `Set ${user}'s balance to ${amount} ${currency}`,
  },
  //#endregion

  //#region Song
  song: {
    noPlaylist: "Can't add songs from a playlist",
    notFound: "Song not found, try using a URL instead",
    tooLong: "Song is too long (> 10 minutes)",
    invalidIndex: "Please enter a valid song index",
    isLive: "Can't play live videos",
    alreadyInQueue: (position: number) => `Song is already in queue (position ${position})`,
    noPermissionRemove: "You don't have permission to remove songs",
    invalidDefaultAction: "Invalid action, valid actions are: set, add",
    queueEmpty: "No songs in queue",
    queueLength: (count: number) => `${count} song(s) in queue`,
    queuePage: (page: number, total: number) => `[Page ${page} of ${total}]`,
    queueMore: (count: number) => `...and ${count} more song(s)`,
    queuePosition: (position: number) => `At position ${position}`,
    defaultSet: (count: number) => `Successfully set default songs (${count} default songs)`,
    defaultAdd: (count: number) => `Successfully added default songs (${count} default songs)`,
    nowPlaying: (title: string, author: string, user: string) =>
      `Now playing "${title}" by ${author} — requested by ${user}`,
    added: (title: string, author: string, user: string) =>
      `Added "${title}" by ${author} (requested by ${user})`,
    removed: (index: number, title: string, user: string) =>
      `Removed song #${index} "${title}" (${user})`,
    skipped: (index: number, title: string, user: string) =>
      `Skipped song #${index} "${title}" (${user})`,
    currentlyPlaying: "Currently playing",
  },
  //#endregion

  //#region Info
  info: {
    version: (botVersion: string, bunVersion: string) =>
      `ManaoBot v${botVersion} running on Bun v${bunVersion}`,
    uptime: (duration: string) => `This stream has been online for ${duration}`,
    offline: "Stream is offline",
    seconds: (n: number) => `${n} second(s)`,
    minutes: (n: number) => `${n} minute(s)`,
    hours: (n: number) => `${n} hour(s)`,
    help: (url: string) =>
      `📚 View all commands at ${url} — Type !help followed by a command to see its details.`,
  },
  //#endregion

  //#region Config
  config: {
    invalidLanguage: (available: string) => `Invalid language. Available languages: ${available}`,
    nicknameTooLong: "Nickname is too long",
    nicknameInvalidChars: "Nickname can only contain letters and numbers",
    gameNotFound: (game: string) => `Game not found: ${game}`,
    categoryNotSet: "Current game not found, or the broadcaster didn't specify a stream category",
    linkCodeExpired: "The provided code is invalid or has expired. Please generate a new code.",
    alreadyLinked: "This account is already linked to another user",
    linkSelf: "You cannot link an account to itself",
    currentLanguage: (lang: string) => `Your current language is: ${lang}`,
    languageChanged: (lang: string) => `Language changed to: ${lang}`,
    currentNickname: (nick: string) => `Your current nickname is: ${nick}`,
    nicknameChanged: (nick: string) => `Your nickname has been changed to: ${nick}`,
    nicknameRemoved: "Nickname removed",
    currentGame: (game: string) => `Your current game is: ${game}`,
    gameChanged: (game: string) => `Game changed to: ${game}`,
    currentCurrency: (currency: string) => `The channel's current currency is: ${currency}`,
    currencyChanged: (currency: string) => `Channel's currency changed to: ${currency}`,
    linkCodeGenerated: (code: string) => `Your link code is: ${code} (expires in 60 seconds)`,
    linkSuccess: "Account successfully linked",
  },
  //#endregion

  //#region Moderation
  moderation: {
    announceFailed: "An error occurred while trying to announce",
    shoutoutFailed: "Shoutout failed",
    userNotFound: (user: string) => `User not found: ${user}`,
    invalidEventAction: "Invalid action! Valid actions are: connect, disconnect",
    eventAlreadyConnected: "An event is already connected. Use !event disconnect first",
    urlRequired: "Please provide a URL to connect to",
    eventNotConnected: "No event is currently connected",
    streamTitleChanged: (title: string) => `Stream title changed to: ${title}`,
    shoutoutSuccess: (user: string) => `Everyone go follow @${user}!`,
    announced: "Announcement sent",
  },
  //#endregion

  //#region Social
  social: {
    eat: (food: string) => `🍲 You should eat ${food}`,
    love: (user: string, target: string, percent: number) =>
      `💕 ${user} loves ${target} ${percent}%`,
    hate: (user: string, target: string, percent: number) =>
      `💢 ${user} hates ${target} ${percent}%`,
    stomp: (user: string, target: string) => `👟 ${user} stomped ${target}!`,
  },
  //#endregion

  //#region Discord
  discord: {
    link: {
      notLinked: "Link your account using the `!link` command on Twitch or Kick first.",
      targetNotLinked: "The target user has not linked their account.",
      errorTitle: "Linking Failed",
      successTitle: "Account Linked",
      title: "Link your Discord account",
      description: "Run !link on Twitch or Kick followed by the code to link your account.",
      fieldName: "Code",
    },
    ping: {
      latency: (ms: number) => `Latency is: ${ms}ms`,
    },
    help: {
      pageTitle: (page: number, total: number, category: string) =>
        `(Page ${page} of ${total}) Category: ${category}`,
      footer: "Send `/help command` followed by a command name for more details.",
      backToAll: "Send `/help all` to see all commands.",
      descriptionField: "Description",
      categoryField: "Category",
      optionsField: "Options",
      noOptions: "None",
    },
    leaderboard: {
      title: "Top Richest Users",
      noUsers: "No users found.",
    },
  },
  //#endregion
};

//#endregion

//#region Thai

const th: typeof en = {
  //#region Command
  command: {
    notFound: (name, suggestion) =>
      `ไม่พบคำสั่ง "${name}" คุณหมายถึง "${suggestion}" หรือเปล่า?`,
    notFoundNoSuggestion: (name) => `ไม่พบคำสั่ง "${name}"`,
    moderatorOnly: "คำสั่งนี้สำหรับผู้ดูแลเท่านั้น",
    broadcasterOnly: "คำสั่งนี้สำหรับผู้ถือสิทธิ์เท่านั้น",
    argsRequired: (args) => `กรุณาใส่พารามิเตอร์ที่จำเป็น: ${args}`,
    error: "เกิดข้อผิดพลาดขณะเรียกใช้คำสั่ง บอทอาจหยุดทำงาน",
    permissionDenied: "คุณไม่มีสิทธิ์สั่งคำสั่งนี้",
  },
  //#endregion

  //#region Economy
  economy: {
    userNotFound: (user) => `ไม่พบผู้ใช้: ${user}`,
    accountNotFound: (user) => `ไม่พบบัญชีของผู้ใช้: ${user}`,
    invalidAmount: "จำนวนเงินไม่ถูกต้อง",
    insufficientFunds: "คุณมีเงินไม่เพียงพอในการทำรายการนี้",
    invalidTimes: "จำนวนครั้งไม่ถูกต้อง กรุณาใส่ตัวเลขระหว่าง 1 ถึง 100",
    selfTransfer: "ไม่สามารถโอนเงินให้ตัวเองได้",
    balance: (amount, currency) => `ยอดเงินปัจจุบันของคุณคือ: ${amount} ${currency}`,
    gambleWin: (amount, currency, remaining) =>
      `🎉 ชนะ ${amount} ${currency} — ยอดเงิน: ${remaining} ${currency}`,
    gambleLose: (amount, currency, remaining) =>
      `❌ แพ้ ${amount} ${currency} — ยอดเงิน: ${remaining} ${currency}`,
    autobetResult: (times, won, lost, remaining, currency) =>
      `ผลการเล่นอัตโนมัติ: ${times} ครั้ง — ได้ ${won} เสีย ${lost} — เหลือ ${remaining} ${currency}`,
    transferSuccess: (amount, currency, target) =>
      `โอน ${amount} ${currency} ให้กับ ${target}`,
    leaderboardTitle: "🏆 5 อันดับผู้ใช้ที่รวยที่สุด 🏆 | ",
    setBalance: (user, amount, currency) =>
      `ตั้งยอดเงินของ ${user} เป็น ${amount} ${currency}`,
  },
  //#endregion

  //#region Song
  song: {
    noPlaylist: "ไม่สามารถเพิ่มเพลงจาก Playlist ได้",
    notFound: "ไม่เจอเพลง ลองใช้ URL แทน",
    tooLong: "เพลงยาวเกินไป (> 10 นาที)",
    invalidIndex: "กรุณาใส่หมายเลขเพลงที่ถูกต้อง",
    isLive: "ไม่สามารถเล่นวิดิโอถ่ายทอดสดได้",
    alreadyInQueue: (position) => `เพลงนี้อยู่ในคิวแล้ว (ตำแหน่งที่ ${position})`,
    noPermissionRemove: "คุณไม่มีสิทธิ์ลบเพลงนี้",
    invalidDefaultAction: "คำสั่งไม่ถูกต้อง คำสั่งที่ถูกต้องคือ: set, add",
    queueEmpty: "ไม่มีเพลงในคิว",
    queueLength: (count) => `${count} เพลงในคิว`,
    queuePage: (page, total) => `[หน้า ${page} จาก ${total}]`,
    queueMore: (count) => `...และอีก ${count} เพลง`,
    queuePosition: (position) => `อยู่ที่ตำแหน่ง ${position}`,
    defaultSet: (count) => `ตั้งค่าเพลงเริ่มต้นสำเร็จ (มีเพลง ${count} เพลง)`,
    defaultAdd: (count) => `เพิ่มเพลงเริ่มต้นสำเร็จ (มีเพลง ${count} เพลง)`,
    nowPlaying: (title, author, user) =>
      `กำลังเล่น "${title}" โดย ${author} — ${user} ขอเพลงนี้`,
    added: (title, author, user) => `เพิ่มเพลง "${title}" โดย ${author} (${user} ขอ)`,
    removed: (index, title, user) => `ลบเพลง #${index} "${title}" (${user})`,
    skipped: (index, title, user) => `ข้ามเพลง #${index} "${title}" (${user})`,
    currentlyPlaying: "กำลังเล่นอยู่",
  },
  //#endregion

  //#region Info
  info: {
    version: (botVersion, bunVersion) =>
      `ManaoBot v${botVersion} รันบน Bun v${bunVersion}`,
    uptime: (duration) => `สตรีมนี้ออนไลน์มาแล้ว ${duration}`,
    offline: "สตรีมออฟไลน์",
    seconds: (n) => `${n} วินาที`,
    minutes: (n) => `${n} นาที`,
    hours: (n) => `${n} ชั่วโมง`,
    help: (url) =>
      `📚 ดูคำสั่งทั้งหมดได้ที่ ${url} — พิมพ์ !help ตามด้วยคำสั่ง เพื่อดูรายละเอียด`,
  },
  //#endregion

  //#region Config
  config: {
    invalidLanguage: (available) => `ภาษาไม่ถูกต้อง ภาษาที่รองรับ: ${available}`,
    nicknameTooLong: "ชื่อเล่นยาวเกินไป",
    nicknameInvalidChars: "ชื่อเล่นสามารถมีได้เฉพาะตัวอักษรและตัวเลขเท่านั้น",
    gameNotFound: (game) => `ไม่พบเกม: ${game}`,
    categoryNotSet: "ไม่พบเกมของสตรีม หรือผู้ดำเนินรายการไม่ได้ระบุหมวดหมู่ของสตรีม",
    linkCodeExpired: "รหัสไม่ถูกต้องหรือหมดอายุแล้ว กรุณาสร้างรหัสใหม่",
    alreadyLinked: "บัญชีนี้ถูกเชื่อมต่อกับผู้ใช้อื่นอยู่แล้ว",
    linkSelf: "ไม่สามารถเชื่อมต่อบัญชีกับตัวเองได้",
    currentLanguage: (lang) => `ภาษาปัจจุบันของคุณคือ: ${lang}`,
    languageChanged: (lang) => `เปลี่ยนภาษาเป็น: ${lang}`,
    currentNickname: (nick) => `ชื่อเล่นปัจจุบันของคุณคือ: ${nick}`,
    nicknameChanged: (nick) => `ชื่อเล่นของคุณถูกเปลี่ยนเป็น: ${nick}`,
    nicknameRemoved: "ชื่อเล่นถูกลบแล้ว",
    currentGame: (game) => `เกมปัจจุบันของคุณคือ: ${game}`,
    gameChanged: (game) => `เกมถูกเปลี่ยนเป็น: ${game}`,
    currentCurrency: (currency) => `สกุลเงินปัจจุบันของช่องคือ: ${currency}`,
    currencyChanged: (currency) => `สกุลเงินของช่องถูกเปลี่ยนเป็น: ${currency}`,
    linkCodeGenerated: (code) => `รหัสเชื่อมต่อของคุณคือ: ${code} (หมดอายุใน 60 วินาที)`,
    linkSuccess: "บัญชีถูกเชื่อมต่อเรียบร้อยแล้ว",
  },
  //#endregion

  //#region Moderation
  moderation: {
    announceFailed: "เกิดข้อผิดพลาดขณะพยายามประกาศ",
    shoutoutFailed: "ไม่สามารถ Shoutout ได้",
    userNotFound: (user) => `ไม่พบผู้ใช้: ${user}`,
    invalidEventAction: "คำสั่งไม่ถูกต้อง! คำสั่งที่ถูกต้อง: connect, disconnect",
    eventAlreadyConnected: "อีเวนต์เชื่อมต่ออยู่แล้ว ใช้ !event disconnect ก่อน",
    urlRequired: "กรุณาใส่ URL ที่ต้องการเชื่อมต่อ",
    eventNotConnected: "ไม่มีอีเวนต์ที่เชื่อมต่ออยู่ในขณะนี้",
    streamTitleChanged: (title) => `เปลี่ยนชื่อสตรีมเป็น: ${title}`,
    shoutoutSuccess: (user) => `ทุกคนไปกดฟอลให้ @${user} กันนะ!`,
    announced: "ส่งประกาศแล้ว",
  },
  //#endregion

  //#region Social
  social: {
    eat: (food) => `🍲 กิน ${food} ละกัน`,
    love: (user, target, percent) => `💕 ${user} รัก ${target} ${percent}%`,
    hate: (user, target, percent) => `💢 ${user} เกลียด ${target} ${percent}%`,
    stomp: (user, target) => `👟 ${user} เหยียบ ${target}!`,
  },
  //#endregion

  //#region Discord
  discord: {
    link: {
      notLinked: "เชื่อมต่อบัญชีโดยใช้คำสั่ง `!link` บน Twitch หรือ Kick ก่อน",
      targetNotLinked: "ผู้ใช้อีกคนยังไม่ได้เชื่อมต่อบัญชี",
      errorTitle: "การเชื่อมต่อล้มเหลว",
      successTitle: "เชื่อมต่อบัญชีสำเร็จ",
      title: "เชื่อมต่อด้วยบัญชีดิสคอร์ด",
      description: "พิมพ์ !link บน Twitch หรือ Kick แล้วตามด้วยรหัสเพื่อเชื่อมต่อบัญชี",
      fieldName: "รหัส",
    },
    ping: {
      latency: (ms) => `ความหน่วงอยู่ที่: ${ms}ms`,
    },
    help: {
      pageTitle: (page, total, category) => `(หน้า ${page} จาก ${total}) หมวด: ${category}`,
      footer: "พิมพ์ `/help command` ตามด้วยชื่อคำสั่งเพื่อดูรายละเอียดเพิ่มเติม",
      backToAll: "พิมพ์ `/help all` เพื่อดูรายการคำสั่งทั้งหมด",
      descriptionField: "คำอธิบาย",
      categoryField: "หมวดหมู่",
      optionsField: "ตัวเลือก",
      noOptions: "ไม่มี",
    },
    leaderboard: {
      title: "อันดับผู้ใช้ที่รวยที่สุด",
      noUsers: "ไม่พบผู้ใช้",
    },
  },
  //#endregion
};

//#endregion

export const i18n = { en, th } as const;
export type I18n = typeof en