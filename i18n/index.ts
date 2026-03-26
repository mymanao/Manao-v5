const en = {
  command: {
    notFound: (name: string, suggestion: string) =>
      `Command "${name}" not found, did you mean "${suggestion}"?`,
    notFoundNoSuggestion: (name: string) => `Command "${name}" not found`,
    permissionDenied: "You don't have permission to run this command",
    argsRequired: (args: string) =>
      `Please provide the required arguments: ${args}`,
    error: "An error occurred while executing the command",
  },

  economy: {
    currentBalance: (amount: number, currency: string) =>
      `Your current balance is: ${amount} ${currency}`,
    errorUserNotFound: (user: string) => `User not found: ${user}`,
    errorInvalidAmount: () => "Invalid amount",
    errorInsufficientFunds: () => "You have insufficient funds",
    errorInvalidTimes: () =>
      "Invalid number of times, please enter a number between 1 and 100",
    errorSelfTransfer: () => "You cannot transfer money to yourself",
    gambleWin: (
      amount: number,
      currency: string,
      remaining: number,
      remainingCurrency: string,
    ) =>
      `Won ${amount} ${currency} — Balance: ${remaining} ${remainingCurrency}`,
    gambleLose: (
      amount: number,
      currency: string,
      remaining: number,
      remainingCurrency: string,
    ) =>
      `Lost ${amount} ${currency} — Balance: ${remaining} ${remainingCurrency}`,
    autobetResult: (
      times: number,
      won: number,
      lost: number,
      remaining: number,
      currency: string,
    ) =>
      `${times} round(s) — Won ${won} Lost ${lost} — Balance: ${remaining} ${currency}`,
    transactionSuccess: (amount: number, currency: string, target: string) =>
      `Transferred ${amount} ${currency} to ${target}`,
  },

  song: {
    queueEmpty: () => "No songs in queue",
    queueLength: (count: number) => `${count} song(s) in queue`,
    queuePageTitle: (page: number, total: number) =>
      `[Page ${page} of ${total}]`,
    queuePageFooter: (count: number) => `...and ${count} more`,
    queueAt: (position: number) => `Queue position: ${position}`,
    songCurrentlyPlaying: () => "Currently playing",
    songPlaying: (title: string, author: string, user: string) =>
      `Now playing "${title}" by ${author} — requested by ${user}`,
    songAdded: (title: string, author: string, position: string) =>
      `Added "${title}" by ${author} — ${position}`,
    songRemoved: (index: number, title: string, queueStatus: string) =>
      `Removed song #${index} "${title}" — ${queueStatus}`,
    songSkipped: (count: number, title: string, queueStatus: string) =>
      `Skipped ${count} song(s): "${title}" — ${queueStatus}`,
    songDefaultSet: (count: number) => `Default songs set (${count} song(s))`,
    songDefaultAdd: (count: number) =>
      `Default songs updated (${count} song(s) total)`,
    errorSongNotFound: () => "Song not found, try using a URL instead",
    errorSongRequestPlaylist: () => "Can't add songs from a playlist",
    errorSongAlreadyInQueue: (position: number) =>
      `Song is already in queue at position ${position}`,
    errorSongIndex: () => "Please enter a valid song index",
    errorSongRemovedNoPermission: () =>
      "You don't have permission to remove this song",
    errorSongInvalidAction: () => "Invalid action, valid actions are: set, add",
  },

  info: {
    version: (botVersion: string, bunVersion: string) =>
      `ManaoBot v${botVersion} running on Bun v${bunVersion}`,
    uptime: (duration: string) => `Stream has been online for ${duration}`,
    followage: (duration: string) => `You've been following for ${duration}`,
    offline: () => "Stream is offline",
    years: () => "year(s)",
    days: () => "day(s)",
    hours: () => "hour(s)",
    minutes: () => "minute(s)",
    seconds: () => "second(s)",
    help: () => "Type !help followed by a command name to see its details",
    errorCommandNotFound: (name: string) => `Command "${name}" not found`,
  },

  configuration: {
    currentLanguage: (lang: string) => `Current language: ${lang}`,
    currentLanguageChanged: (lang: string) => `Language changed to: ${lang}`,
    errorInvalidLanguage: (available: string) =>
      `Invalid language. Available: ${available}`,
    currentNickname: (nick: string) => `Your nickname: ${nick}`,
    currentNicknameChanged: (nick: string) => `Nickname changed to: ${nick}`,
    currentNicknameRemoved: () => "Nickname removed",
    errorNicknameTooLong: () => "Nickname is too long (max 32 characters)",
    errorNicknameContainsSpecialChars: () =>
      "Nickname can only contain letters, numbers, and spaces",
    currentCurrency: (currency: string) => `Current currency: ${currency}`,
    currentCurrencyChanged: (currency: string) =>
      `Currency changed to: ${currency}`,
    currentGame: (game: string) => `Current game: ${game}`,
    currentGameChanged: (game: string) => `Game changed to: ${game}`,
    errorGameNotFound: (game: string) => `Game not found: ${game}`,
    linkCodeGenerated: () => "Your link code is",
    linkSuccess: () => "Account successfully linked",
    errorCodeInvalidOrExpired: () =>
      "Code is invalid or has expired, please generate a new one",
    errorAlreadyLinked: () => "This account is already linked to another user",
    errorLinkSelf: () => "You cannot link an account to itself",
  },

  moderation: {
    errorCannotAnnounce: () => "Failed to send announcement",
    errorCannotShoutout: () => "Shoutout failed",
    errorUserNotFound: (user: string) => `User not found: ${user}`,
    errorInvalidAction: (actions: string[]) =>
      `Invalid action, valid actions are: ${actions.join(", ")}`,
    errorEventAlreadyConnected: () =>
      "An event is already connected, use !event disconnect first",
    errorUrlRequired: () => "Please provide a URL to connect to",
    errorEventNotConnected: () => "No event is currently connected",
    shoutoutSuccess: (user: string) => `Go follow @${user}!`,
    streamTitleChanged: (title: string) => `Stream title changed to: ${title}`,
    errorPlatformUnsupported: () =>
      "This command is not supported on this platform.",
  },

  misc: {
    eat: (food: string) => `🍲 You should eat ${food}`,
    times: () => "time(s)",
  },

  discord: {
    link: {
      notLinked: "Link your account using `!link` on Twitch or Kick first",
      targetNotLinked: "That user has not linked their account",
      errorTitle: "Linking Failed",
      successTitle: "Account Linked",
      title: "Link your Discord account",
      description: "Run !link on Twitch or Kick, then use the code here",
      fieldName: "Code",
    },
    ping: {
      latency: (ms: number) => `Latency: ${ms}ms`,
    },
    help: {
      pageTitle: (page: number, total: number, category: string) =>
        `(Page ${page} of ${total}) Category: ${category}`,
      footer: "Use /help command followed by a command name for details",
      backToAll: "Use /help all to see all commands",
      descriptionField: "Description",
      categoryField: "Category",
      optionsField: "Options",
      noOptions: "None",
    },
    leaderboard: {
      title: "Top Richest Users",
      noUsers: "No users found",
    },
  },
};

const th: typeof en = {
  command: {
    notFound: (name, suggestion) =>
      `ไม่พบคำสั่ง "${name}" คุณหมายถึง "${suggestion}" หรือเปล่า?`,
    notFoundNoSuggestion: (name) => `ไม่พบคำสั่ง "${name}"`,
    permissionDenied: "คุณไม่มีสิทธิ์ใช้คำสั่งนี้",
    argsRequired: (args) => `กรุณาใส่พารามิเตอร์ที่จำเป็น: ${args}`,
    error: "เกิดข้อผิดพลาดขณะเรียกใช้คำสั่ง",
  },

  economy: {
    currentBalance: (amount, currency) => `ยอดเงินของคุณ: ${amount} ${currency}`,
    errorUserNotFound: (user) => `ไม่พบผู้ใช้: ${user}`,
    errorInvalidAmount: () => "จำนวนเงินไม่ถูกต้อง",
    errorInsufficientFunds: () => "คุณมีเงินไม่เพียงพอ",
    errorInvalidTimes: () => "จำนวนครั้งไม่ถูกต้อง กรุณาใส่ตัวเลข 1 ถึง 100",
    errorSelfTransfer: () => "ไม่สามารถโอนเงินให้ตัวเองได้",
    gambleWin: (amount, currency, remaining, remainingCurrency) =>
      `ชนะ ${amount} ${currency} — ยอดเงิน: ${remaining} ${remainingCurrency}`,
    gambleLose: (amount, currency, remaining, remainingCurrency) =>
      `แพ้ ${amount} ${currency} — ยอดเงิน: ${remaining} ${remainingCurrency}`,
    autobetResult: (times, won, lost, remaining, currency) =>
      `${times} ครั้ง — ได้ ${won} เสีย ${lost} — เหลือ ${remaining} ${currency}`,
    transactionSuccess: (amount, currency, target) =>
      `โอน ${amount} ${currency} ให้ ${target} สำเร็จ`,
  },

  song: {
    queueEmpty: () => "ไม่มีเพลงในคิว",
    queueLength: (count) => `${count} เพลงในคิว`,
    queuePageTitle: (page, total) => `[หน้า ${page} จาก ${total}]`,
    queuePageFooter: (count) => `...และอีก ${count} เพลง`,
    queueAt: (position) => `ตำแหน่งในคิว: ${position}`,
    songCurrentlyPlaying: () => "กำลังเล่นอยู่",
    songPlaying: (title, author, user) =>
      `กำลังเล่น "${title}" โดย ${author} — ${user} ขอ`,
    songAdded: (title, author, position) =>
      `เพิ่ม "${title}" โดย ${author} — ${position}`,
    songRemoved: (index, title, queueStatus) =>
      `ลบเพลง #${index} "${title}" — ${queueStatus}`,
    songSkipped: (count, title, queueStatus) =>
      `ข้าม ${count} เพลง: "${title}" — ${queueStatus}`,
    songDefaultSet: (count) => `ตั้งเพลงเริ่มต้นสำเร็จ (${count} เพลง)`,
    songDefaultAdd: (count) => `เพิ่มเพลงเริ่มต้นสำเร็จ (รวม ${count} เพลง)`,
    errorSongNotFound: () => "ไม่พบเพลง ลองใช้ URL แทน",
    errorSongRequestPlaylist: () => "ไม่สามารถเพิ่มเพลงจาก Playlist ได้",
    errorSongAlreadyInQueue: (position) => `เพลงนี้อยู่ในคิวแล้ว ตำแหน่งที่ ${position}`,
    errorSongIndex: () => "กรุณาใส่หมายเลขเพลงที่ถูกต้อง",
    errorSongRemovedNoPermission: () => "คุณไม่มีสิทธิ์ลบเพลงนี้",
    errorSongInvalidAction: () => "คำสั่งไม่ถูกต้อง คำสั่งที่ถูกต้อง: set, add",
  },

  info: {
    version: (botVersion, bunVersion) =>
      `ManaoBot v${botVersion} รันบน Bun v${bunVersion}`,
    uptime: (duration) => `สตรีมออนไลน์มาแล้ว ${duration}`,
    followage: (duration) => `คุณติดตามมาแล้ว ${duration}`,
    offline: () => "สตรีมออฟไลน์",
    hours: () => "ชั่วโมง",
    minutes: () => "นาที",
    seconds: () => "วินาที",
    help: () => "พิมพ์ !help ตามด้วยชื่อคำสั่ง เพื่อดูรายละเอียด",
    errorCommandNotFound: (name) => `ไม่พบคำสั่ง "${name}"`,
  },

  configuration: {
    currentLanguage: (lang) => `ภาษาปัจจุบัน: ${lang}`,
    currentLanguageChanged: (lang) => `เปลี่ยนภาษาเป็น: ${lang}`,
    errorInvalidLanguage: (available) => `ภาษาไม่ถูกต้อง ภาษาที่รองรับ: ${available}`,
    currentNickname: (nick) => `ชื่อเล่นของคุณ: ${nick}`,
    currentNicknameChanged: (nick) => `เปลี่ยนชื่อเล่นเป็น: ${nick}`,
    currentNicknameRemoved: () => "ลบชื่อเล่นแล้ว",
    errorNicknameTooLong: () => "ชื่อเล่นยาวเกินไป (สูงสุด 32 ตัวอักษร)",
    errorNicknameContainsSpecialChars: () =>
      "ชื่อเล่นใช้ได้เฉพาะตัวอักษร ตัวเลข และช่องว่าง",
    currentCurrency: (currency) => `สกุลเงินปัจจุบัน: ${currency}`,
    currentCurrencyChanged: (currency) => `เปลี่ยนสกุลเงินเป็น: ${currency}`,
    currentGame: (game) => `เกมปัจจุบัน: ${game}`,
    currentGameChanged: (game) => `เปลี่ยนเกมเป็น: ${game}`,
    errorGameNotFound: (game) => `ไม่พบเกม: ${game}`,
    linkCodeGenerated: () => "รหัสเชื่อมต่อของคุณคือ",
    linkSuccess: () => "เชื่อมต่อบัญชีสำเร็จ",
    errorCodeInvalidOrExpired: () => "รหัสไม่ถูกต้องหรือหมดอายุแล้ว กรุณาสร้างรหัสใหม่",
    errorAlreadyLinked: () => "บัญชีนี้ถูกเชื่อมต่อกับผู้ใช้อื่นอยู่แล้ว",
    errorLinkSelf: () => "ไม่สามารถเชื่อมต่อบัญชีกับตัวเองได้",
  },

  moderation: {
    errorCannotAnnounce: () => "ไม่สามารถส่งประกาศได้",
    errorCannotShoutout: () => "ไม่สามารถ Shoutout ได้",
    errorUserNotFound: (user) => `ไม่พบผู้ใช้: ${user}`,
    errorInvalidAction: (actions: string[]) => `คำสั่งไม่ถูกต้อง คำสั่งที่ถูกต้อง: ${actions.join(", ")}`,
    errorEventAlreadyConnected: () =>
      "มีอีเวนต์เชื่อมต่ออยู่แล้ว ใช้ !event disconnect ก่อน",
    errorUrlRequired: () => "กรุณาใส่ URL ที่ต้องการเชื่อมต่อ",
    errorEventNotConnected: () => "ไม่มีอีเวนต์ที่เชื่อมต่ออยู่",
    shoutoutSuccess: (user: string) => `ไปกดฟอลให้ @${user} กันด้วยนะ!`,
    streamTitleChanged: (title: string) => `เปลี่ยนชื่อสตรีมเป็น: ${title}`,
    errorPlatformUnsupported: () => "คำสั่งนี้ไม่รองรับบนแพลตฟอร์มนี้",
  },

  misc: {
    eat: (food) => `🍲 กิน ${food} ละกัน`,
    times: () => "ครั้ง",
  },

  discord: {
    link: {
      notLinked: "เชื่อมต่อบัญชีโดยใช้ `!link` บน Twitch หรือ Kick ก่อน",
      targetNotLinked: "ผู้ใช้นั้นยังไม่ได้เชื่อมต่อบัญชี",
      errorTitle: "การเชื่อมต่อล้มเหลว",
      successTitle: "เชื่อมต่อบัญชีสำเร็จ",
      title: "เชื่อมต่อบัญชีดิสคอร์ด",
      description: "พิมพ์ !link บน Twitch หรือ Kick แล้วใช้รหัสที่นี่",
      fieldName: "รหัส",
    },
    ping: {
      latency: (ms) => `ความหน่วง: ${ms}ms`,
    },
    help: {
      pageTitle: (page, total, category) =>
        `(หน้า ${page} จาก ${total}) หมวด: ${category}`,
      footer: "ใช้ /help command ตามด้วยชื่อคำสั่งเพื่อดูรายละเอียด",
      backToAll: "ใช้ /help all เพื่อดูคำสั่งทั้งหมด",
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
};

export const i18n = { en, th } as const;
export type I18n = typeof en;
