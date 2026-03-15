export type Language = "en" | "th";
export type Platform = "twitch" | "kick" | "discord" | "youtube";
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

  // Optional platform-specific actions (only available on supporting platforms)
  setGame?: (gameName: string) => Promise<string | null>; // returns resolved game name, null if not found
  setTitle?: (title: string) => Promise<void>;
  announce?: (message: string) => Promise<void>;
  shoutout?: (targetName: string) => Promise<boolean>; // returns false if user not found
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

export interface ScheduledMessage {
  id: string;
  messages: string[];
  intervalSeconds: number;
  mode: "random" | "sequential";
  platforms: Platform[];
  isEnabled: boolean;
}

export type OverlayThemeId = "manao-v5" | "manao-classic" | "custom";
export type OverlayPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export type OverlayLayout = "default" | "classic";

export interface MusicOverlaySettings {
  themeId: OverlayThemeId;
  layout: OverlayLayout;
  accentColor: string;
  bgColor: string;
  fontFamily: string;
  borderRadius: number;
  position: OverlayPosition;
}

export type ChatAlign = "left" | "center" | "right";
export type ChatThemeId = "manao-v5" | "manao-classic" | "lucian" | "custom";
export type ChatLayout = "default" | "classic" | "lucian";
export type ChatAnimationIn =
  | "slideInRight" | "slideInLeft" | "slideInUp" | "slideInDown"
  | "fadeIn" | "fadeInUp" | "fadeInDown"
  | "bounceInRight" | "bounceInLeft";
export type ChatAnimationOut =
  | "slideOutRight" | "slideOutLeft" | "slideOutUp" | "slideOutDown"
  | "fadeOut" | "fadeOutUp" | "fadeOutDown"
  | "bounceOutRight" | "bounceOutLeft";

export interface ChatOverlaySettings {
  themeId: ChatThemeId;
  layout: ChatLayout;

  // Layout
  align: ChatAlign;
  maxWidth: number;
  maxMessages: number;
  padding: number;
  borderRadius: number;
  borderWidth: number;

  // Colors & appearance
  backgroundOpacity: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  letterSpacing: number;
  boxShadow: boolean;
  textShadow: boolean;
  hideBadges: boolean;
  borderColorSource: "user" | "platform";

  // Behavior
  timeoutMs: number;

  // Animation
  animationIn: ChatAnimationIn;
  animationOut: ChatAnimationOut;

  // Custom CSS
  customCSS: string;
}

export interface OverlaySettings {
  music: MusicOverlaySettings;
  chat: ChatOverlaySettings;
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
  scheduledMessages: ScheduledMessage[];
  overlaySettings: OverlaySettings
}