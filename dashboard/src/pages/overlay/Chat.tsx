import { useEffect, useRef, useState, useCallback } from "react";
import { Box } from "@mui/material";
import { useSocketEvent } from "@/hooks/useSocket";
import { api } from "@/hooks/useApi";
import type { MessageData, Configuration, ChatOverlaySettings } from "@/types/api";
import { DEFAULT_CHAT_OVERLAY_SETTINGS, PLATFORM_COLOR, resolveChatTheme } from "../../../../helpers/overlayTheme";

interface ChatMsg extends MessageData {
  key: string;
}


const ANIMATIONS = `
  @keyframes slideInRight { from { opacity:0; transform:translateX(100%) } to { opacity:1; transform:translateX(0) } }
  @keyframes slideInLeft  { from { opacity:0; transform:translateX(-100%) } to { opacity:1; transform:translateX(0) } }
  @keyframes slideInUp    { from { opacity:0; transform:translateY(-100%) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideInDown  { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn       { from { opacity:0 } to { opacity:1 } }
  @keyframes fadeInUp     { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeInDown   { from { opacity:0; transform:translateY(-30px) } to { opacity:1; transform:translateY(0) } }
  @keyframes bounceInRight { 0%{opacity:0;transform:translateX(100%) scale(.8)} 50%{opacity:1;transform:translateX(-10px) scale(1.1)} 100%{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes bounceInLeft  { 0%{opacity:0;transform:translateX(-100%) scale(.8)} 50%{opacity:1;transform:translateX(10px) scale(1.1)} 100%{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes slideOutRight { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(100%) } }
  @keyframes slideOutLeft  { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(-100%) } }
  @keyframes slideOutUp    { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-100%) } }
  @keyframes slideOutDown  { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(100%) } }
  @keyframes fadeOut       { from { opacity:1 } to { opacity:0 } }
  @keyframes fadeOutUp     { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-30px) } }
  @keyframes fadeOutDown   { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(30px) } }
  @keyframes bounceOutRight { 0%{opacity:1;transform:translateX(0) scale(1)} 50%{opacity:1;transform:translateX(-10px) scale(1.1)} 100%{opacity:0;transform:translateX(100%) scale(.8)} }
  @keyframes bounceOutLeft  { 0%{opacity:1;transform:translateX(0) scale(1)} 50%{opacity:1;transform:translateX(10px) scale(1.1)} 100%{opacity:0;transform:translateX(-100%) scale(.8)} }
`;

export function ChatOverlay() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [s, setS] = useState<ChatOverlaySettings>(DEFAULT_CHAT_OVERLAY_SETTINGS);
  const sRef = useRef<ChatOverlaySettings>(DEFAULT_CHAT_OVERLAY_SETTINGS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Configuration>("/api/config").then((config) => {
      const resolved = resolveChatTheme(config.overlaySettings?.chat ?? DEFAULT_CHAT_OVERLAY_SETTINGS);
      sRef.current = resolved;
      setS(resolved);
    }).catch(() => {});
  }, []);

  // Inject Google Fonts — Classic needs Outfit + Noto Sans Thai Looped
  useEffect(() => {
    const id = "chat-overlay-font";
    document.getElementById(id)?.remove();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    const families = s.themeId === "manao-classic"
      ? ["Outfit", "Noto+Sans+Thai+Looped"]
      : s.themeId === "lucian"
        ? ["EB+Garamond", "IBM+Plex+Sans+Thai"]
        : [s.fontFamily.replace(/ /g, "+")];
    link.href = `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}:wght@400;600;700;800`).join("&")}&display=swap`;
    document.head.appendChild(link);
  }, [s.fontFamily, s.themeId]);

  // Inject animation keyframes + custom CSS
  useEffect(() => {
    const id = "chat-overlay-style";
    document.getElementById(id)?.remove();
    const style = document.createElement("style");
    style.id = id;
    style.textContent = ANIMATIONS + "\n" + (s.customCSS || "");
    document.head.appendChild(style);
  }, [s.customCSS]);

  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const removeMessage = useCallback((key: string) => {
    setExiting((prev) => new Set(prev).add(key));
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.key !== key));
      setExiting((prev) => { const s = new Set(prev); s.delete(key); return s; });
    }, 750);
  }, []);

  useSocketEvent<MessageData>("message", (data) => {
    const current = sRef.current;
    const key = `${Date.now()}-${Math.random()}`;
    setMessages((prev) => {
      const next = [...prev, { ...data, key }];
      return next.slice(-current.maxMessages);
    });

    if (current.timeoutMs > 0) {
      setTimeout(() => removeMessage(key), current.timeoutMs);
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const borderColor = (msg: ChatMsg) =>
    s.borderColorSource === "platform"
      ? (PLATFORM_COLOR[msg.from] ?? "#888")
      : (msg.color || "#888");

  // Lucian: role-based background colors
  const lucianBg = (roles: ChatMsg["roles"]) => {
    if (roles.isBroadcaster) return "rgba(212,175,55,0.75)";
    if (roles.isModerator)   return "rgba(28,185,106,0.75)";
    if (roles.isVIP)         return "rgba(224,5,185,0.75)";
    if (roles.isSubscriber)  return "rgba(255,255,255,0.75)";
    return "rgba(0,0,0,0.75)";
  };

  const lucianTextColor = (roles: ChatMsg["roles"]) =>
    roles.isSubscriber && !roles.isModerator && !roles.isVIP && !roles.isBroadcaster
      ? "#000" : "#fff";

  const alignSx = (color: string) => ({
    left:   { alignSelf: "flex-start", borderLeft: `${s.borderWidth}px solid ${color}`, borderRight: "none", borderBottom: "none" },
    center: { alignSelf: "center",     borderBottom: `${s.borderWidth}px solid ${color}`, borderLeft: "none", borderRight: "none" },
    right:  { alignSelf: "flex-end",   borderRight: `${s.borderWidth}px solid ${color}`, borderLeft: "none", borderBottom: "none" },
  }[s.align]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        p: 2,
        overflow: "hidden",
        background: "transparent",
        fontFamily: s.themeId === "manao-classic"
          ? `'Outfit', 'Noto Sans Thai Looped', sans-serif`
          : s.themeId === "lucian"
            ? `'IBM Plex Sans Thai', sans-serif`
            : `'${s.fontFamily}', 'Noto Sans Thai', sans-serif`,
      }}
    >
      {messages.map((msg) => {
        if (s.themeId === "lucian") {
          return (
            /* ── Lucian layout ───────────────────────────────── */
            <Box key={msg.key} sx={{
              position: "relative",
              mb: 1,
              ml: "25px",
              mr: "5px",
              alignSelf: "flex-end",
              width: "fit-content",
              maxWidth: s.maxWidth,
              animation: exiting.has(msg.key)
                ? `${s.animationOut} 0.75s ease forwards`
                : `${s.animationIn} 0.75s ease forwards`,
            }}>
              {/* Triangle */}
              <Box sx={{
                position: "absolute",
                right: "100%",
                bottom: 0,
                width: 0,
                height: 0,
                borderTop: "20px solid transparent",
                borderRight: `20px solid ${lucianBg(msg.roles)}`,
                borderBottom: "0px solid transparent",
              }} />
              {/* Card */}
              <Box sx={{
                p: "8px 12px",
                background: lucianBg(msg.roles),
                borderRight: `10px solid ${msg.color || "#fff"}`,
                wordBreak: "break-word",
              }}>
                {/* Meta: username + badges, right-aligned */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mb: 0.25 }}>
                  <span style={{
                    fontFamily: "'EB Garamond', 'IBM Plex Sans Thai', serif",
                    fontWeight: 700,
                    fontSize: `${s.fontSize * 1.15}px`,
                    color: lucianTextColor(msg.roles),
                    textShadow: "2px 2px 2px rgba(0,0,0,0.3)",
                  }}>
                    {msg.user}
                  </span>
                  {!s.hideBadges && msg.badges.map((badge, i) => (
                    <img key={i} src={badge} alt="" style={{
                      height: "1.25rem",
                      verticalAlign: "middle",
                      transform: "rotate(-15deg)",
                      filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
                      flexShrink: 0,
                    }} />
                  ))}
                </Box>
                {/* Message */}
                <Box sx={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans Thai', sans-serif",
                      fontSize: `${s.fontSize}px`,
                      color: lucianTextColor(msg.roles),
                      textShadow: "2px 2px 2px rgba(0,0,0,0.3)",
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}
                    dangerouslySetInnerHTML={{ __html: msg.message }}
                  />
                </Box>
              </Box>
            </Box>
          );
        }

        return (
          /* ── Default / Classic layout ─────────────────────── */
          <Box
            key={msg.key}
            sx={{
              mb: 0.75,
              p: `${s.padding}px`,
              borderRadius: `${s.borderRadius}px`,
              background: s.bgColor,
              backdropFilter: "blur(4px)",
              maxWidth: s.maxWidth,
              boxShadow: s.boxShadow ? "0 2px 8px rgba(0,0,0,0.25)" : "none",
              animation: exiting.has(msg.key)
                ? `${s.animationOut} 0.75s ease forwards`
                : `${s.animationIn} 0.75s ease forwards`,
              textAlign: s.align,
              wordBreak: "break-word",
              ...alignSx(borderColor(msg)),
            }}
          >
            {s.themeId === "manao-classic" ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
                  {!s.hideBadges && msg.badges.map((badge, i) => (
                    <img key={i} src={badge} alt="" style={{ width: "1.2em", height: "1.2em", verticalAlign: "middle", flexShrink: 0 }} />
                  ))}
                  <span style={{
                    fontWeight: 700,
                    color: msg.color || "#fff",
                    fontSize: s.fontSize,
                    letterSpacing: s.letterSpacing,
                    textShadow: s.textShadow ? "0 2px 8px rgba(0,0,0,0.7)" : "none",
                  }}>
                    {msg.user}
                  </span>
                </Box>
                <span
                  style={{
                    color: s.textColor,
                    fontSize: s.fontSize,
                    fontWeight: s.fontWeight,
                    letterSpacing: s.letterSpacing,
                    lineHeight: 1.4,
                    textShadow: s.textShadow ? "0 2px 8px rgba(0,0,0,0.7)" : "none",
                  }}
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              </>
            ) : (
              <>
                {!s.hideBadges && msg.badges.length > 0 && (
                  <Box sx={{ display: "inline-flex", gap: 0.25, mr: 0.5, verticalAlign: "middle" }}>
                    {msg.badges.map((badge, i) => (
                      <img key={i} src={badge} alt="" style={{ width: 16, height: 16, borderRadius: 2 }} />
                    ))}
                  </Box>
                )}
                <span style={{
                  fontWeight: Math.min(parseInt(s.fontWeight) + 100, 900),
                  color: msg.color || "#fff",
                  fontSize: s.fontSize,
                  letterSpacing: s.letterSpacing,
                  textShadow: s.textShadow ? "0 2px 8px rgba(0,0,0,0.7)" : "none",
                }}>
                  {msg.user}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 4px", fontSize: s.fontSize - 2 }}>·</span>
                <span
                  style={{
                    color: s.textColor,
                    fontSize: s.fontSize,
                    fontWeight: s.fontWeight,
                    letterSpacing: s.letterSpacing,
                    textShadow: s.textShadow ? "0 2px 8px rgba(0,0,0,0.7)" : "none",
                  }}
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              </>
            )}
          </Box>
        );
      })}
      <div ref={bottomRef} />
    </Box>
  );
}