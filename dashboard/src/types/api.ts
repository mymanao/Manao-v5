// Mirrors core/types.ts from the bot — keep in sync

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

export interface Command {
  name: Localized;
  description: Localized;
  aliases?: Localized<string[]>;
  arguments?: CommandArgument[];
  permission?: Permission;
  platforms?: Platform[];
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

export interface SongData {
  title: string;
  author: string;
  thumbnail: string;
  id: string;
}

export interface SongRequestData extends SongData {
  requestedBy: string;
}

export interface CustomMessages {
  onFollow: Localized;
  onSubscribe: Localized;
  onGiftSubscribe: Localized;
  onRaid: Localized;
  onCheer: Localized;
}

export interface CustomReply {
  keywordType: "includes" | "exact";
  responseType: "random" | "sequential";
  keywords: string[];
  responses: string[];
}

export interface SoundReward {
  id: string;
  title: string;
  cost: number;
  prompt: string;
  isEnabled: boolean;
  userInputRequired: boolean;
  globalCooldown: number;
  soundFile: string | null;
}

export interface ChatReward {
  minimum: number;
  maximum: number;
  chance: number;
  cooldown: number;
}

export interface Configuration {
  prefix: Record<Platform, string>;
  defaultSongs: SongData[];
  disabledCommands: string[];
  language: Language;
  currency: string;
  customMessages: CustomMessages;
  customReplies: CustomReply[];
  soundRewards: SoundReward[];
  chatRewards: Record<Platform, ChatReward>;
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
