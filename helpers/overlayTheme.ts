import type {
  MusicOverlaySettings, OverlayThemeId,
  ChatOverlaySettings, ChatThemeId,
} from "../core/types";

// ── Music ─────────────────────────────────────────────────────────────────────

export const MUSIC_OVERLAY_PRESETS: Record<
  Exclude<OverlayThemeId, "custom">,
  MusicOverlaySettings
> = {
  "manao-v5": {
    themeId: "manao-v5",
    layout: "default",
    accentColor: "#69F000",
    bgColor: "rgba(0,0,0,0.75)",
    fontFamily: "DM Sans",
    borderRadius: 14,
    position: "bottom-left",
  },
  "manao-classic": {
    themeId: "manao-classic",
    layout: "classic",
    accentColor: "#f50f0f",
    bgColor: "rgba(0,0,0,0.5)",
    fontFamily: "Noto Serif Thai",
    borderRadius: 8,
    position: "bottom-left",
  },
};

export const DEFAULT_MUSIC_OVERLAY_SETTINGS: MusicOverlaySettings =
  MUSIC_OVERLAY_PRESETS["manao-v5"];

export function resolveMusicTheme(
  settings: MusicOverlaySettings
): MusicOverlaySettings {
  if (settings.themeId === "custom") return settings;
  return MUSIC_OVERLAY_PRESETS[settings.themeId] ?? settings;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export const CHAT_OVERLAY_PRESETS: Record<
  Exclude<ChatThemeId, "custom">,
  ChatOverlaySettings
> = {
  "manao-v5": {
    themeId: "manao-v5",
    layout: "default",
    align: "left",
    maxWidth: 480,
    maxMessages: 50,
    padding: 10,
    borderRadius: 8,
    borderWidth: 3,
    backgroundOpacity: 0.75,
    bgColor: "rgba(0,0,0,0.75)",
    textColor: "#ffffff",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "DM Sans",
    letterSpacing: 0,
    boxShadow: true,
    textShadow: true,
    hideBadges: false,
    borderColorSource: "user",
    timeoutMs: 0,
    animationIn: "slideInRight",
    animationOut: "slideOutLeft",
    customCSS: "",
  },
  "lucian": {
    themeId: "lucian",
    layout: "lucian",
    align: "right",
    maxWidth: 480,
    maxMessages: 50,
    padding: 8,
    borderRadius: 0,
    borderWidth: 10,
    backgroundOpacity: 0.75,
    bgColor: "rgba(0,0,0,0.75)",
    textColor: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "IBM Plex Sans Thai",
    letterSpacing: 0,
    boxShadow: false,
    textShadow: true,
    hideBadges: false,
    borderColorSource: "user",
    timeoutMs: 0,
    animationIn: "slideInRight",
    animationOut: "slideOutRight",
    customCSS: "",
  },
  "manao-classic": {
    themeId: "manao-classic",
    layout: "classic",
    align: "left",
    maxWidth: 500,
    maxMessages: 50,
    padding: 12,
    borderRadius: 16,
    borderWidth: 10,
    backgroundOpacity: 0.5,
    bgColor: "linear-gradient(135deg, #4e4e4880, #38342b80)",
    textColor: "#ffffff",
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Noto Sans Thai Looped",
    letterSpacing: 0,
    boxShadow: true,
    textShadow: true,
    hideBadges: false,
    borderColorSource: "user",
    timeoutMs: 0,
    animationIn: "slideInRight",
    animationOut: "slideOutLeft",
    customCSS: "",
  },
};

export const DEFAULT_CHAT_OVERLAY_SETTINGS: ChatOverlaySettings =
  CHAT_OVERLAY_PRESETS["manao-v5"];


export function resolveChatTheme(
  settings: ChatOverlaySettings
): ChatOverlaySettings {
  if (settings.themeId === "custom") return settings;
  const preset = CHAT_OVERLAY_PRESETS[settings.themeId] ?? settings;
  // Preserve user-configured behavior settings — only take visual defaults from preset
  return {
    ...preset,
    timeoutMs: settings.timeoutMs,
    maxMessages: settings.maxMessages,
    customCSS: settings.customCSS,
  };
}

// ── Shared ────────────────────────────────────────────────────────────────────

export const DEFAULT_OVERLAY_SETTINGS = {
  music: DEFAULT_MUSIC_OVERLAY_SETTINGS,
  chat: DEFAULT_CHAT_OVERLAY_SETTINGS,
};

export function googleFontsUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700;800&display=swap`;
}

export const ANIMATION_IN_OPTIONS: ChatOverlaySettings["animationIn"][] = [
  "slideInRight", "slideInLeft", "slideInUp", "slideInDown",
  "fadeIn", "fadeInUp", "fadeInDown",
  "bounceInRight", "bounceInLeft",
];

export const ANIMATION_OUT_OPTIONS: ChatOverlaySettings["animationOut"][] = [
  "slideOutRight", "slideOutLeft", "slideOutUp", "slideOutDown",
  "fadeOut", "fadeOutUp", "fadeOutDown",
  "bounceOutRight", "bounceOutLeft",
];

export const PLATFORM_COLOR: Record<string, string> = {
  twitch: "#9146FF",
  kick: "#53FC18",
  discord: "#5865F2",
  youtube: "#FF0000",
};