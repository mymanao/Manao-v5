export type Language = "en" | "th";
export type Platform = "twitch" | "kick" | "discord";
export type Permission =
  | "everyone"
  | "follower"
  | "subscriber"
  | "vip"
  | "moderator"
  | "broadcaster";
export interface Localized<T = string> {
  en: T;
  th: T;
}

export interface CommandArgument {
  name: Localized;
  description: Localized;
  required?: boolean;
}

export interface ResolvedCommandArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface Command {
  name: Localized;
  description: Localized;
  aliases?: Localized<string[]>;
  arguments?: CommandArgument[];
  permission?: Permission;
  platforms?: Platform[];
  isCustom?: boolean;
  execute: (context: CommandContext, args: string[]) => Promise<void>;
}

export interface CommandUser {
  id: string;
  name: string;
  platform: Platform;
  platformID: string;
  roles: {
    isFollower: boolean;
    isSubscriber: boolean;
    isVIP: boolean;
    isModerator: boolean;
    isBroadcaster: boolean;
  };
}

export interface CommandContext {
  user: CommandUser;
  channel: string;
  language: Language;
  currency: string;

  // Methods to send messages back to the user
  say: (message: string) => Promise<void>;
  reply: (message: string) => Promise<void>;
  whisper: (message: string) => Promise<void>;
  emit: <T = unknown>(event: string, data: T) => void;

  // Platform-specific user lookup by display name → internal ID
  lookupUser: (name: string) => Promise<string | null>;
}

export interface PlatformAdapter {
  readonly platform: Platform;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  sendMessage: (channel: string, message: string) => Promise<void>;
  onMessage: (handler: MessageHandler) => void;
}

export type MessageHandler = (
  context: CommandContext,
  message: string,
) => Promise<void>;

export type FeedStatus =
  | "neutral"
  | "normal"
  | "success"
  | "warning"
  | "danger";

export interface FeedEvent {
  status: FeedStatus;
  icon: string;
  name: string;
  action: string;
}

export interface MessageData {
  from: Platform;
  user: string;
  message: string;
  id: string;
  roles: {
    isFollower: boolean;
    isSubscriber: boolean;
    isVIP: boolean;
    isModerator: boolean;
    isBroadcaster: boolean;
  };
  color: string;
  badges: string[];
}

export interface SongData {
  title: string;
  author: string;
  thumbnail: string;
  id: string;
}

export interface SongRequestData extends SongData {
  requestedBy: string;
}

export interface UserData {
  id: string;
  money: number;
  nickname: string | null;
}

export interface CustomCommand {
  id: string;
  name: string;
  description: string;
  aliases: string;
  arguments: string;
  permission: Permission;
  code: string;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CustomMessages {
  onFollow: Localized;
  onSubscribe: Localized;
  onGiftSubscribe: Localized;
  onRaid: Localized;
  onCheer: Localized;
}

export interface CustomReplies {
  keywordType: "includes" | "exact";
  responseType: "random" | "sequential";
  keywords: string[];
  responses: string[];
}

export interface SoundEntry {
  name: string;
  url: string;
}

export interface SoundReward {
  id: string;
  title: string;
  cost: number;
  prompt: string;
  isEnabled: boolean;
  userInputRequired: boolean;
  globalCooldown: number; // In seconds
  soundFile: string | null;
}

export interface ChatReward {
  minimum: number;
  maximum: number;
  chance: number; // 0 - 100;
  cooldown: number; // In seconds
}

export interface Configuration {
  prefix: Record<Platform, string>;
  defaultSongs: SongData[];
  disabledCommands: string[];
  language: Language;
  currency: string;
  customMessages: CustomMessages;
  customReplies: CustomReplies[];
  soundRewards: SoundReward[];
  soundboard: SoundEntry[];
  chatRewards: Record<Platform, ChatReward>;
}