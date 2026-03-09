import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useSocketEvent } from "@/hooks/useSocket";
import type { MessageData } from "@/types/api";

interface ChatMsg extends MessageData {
  key: string;
}

const PLATFORM_COLOR: Record<string, string> = {
  twitch: "#9146FF",
  kick: "#53FC18",
  discord: "#5865F2",
};

export function ChatOverlay() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useSocketEvent<MessageData>("message", (data) => {
    setMessages((prev) => {
      const next = [...prev, { ...data, key: `${Date.now()}-${Math.random()}` }];
      return next.slice(-50); // keep last 50
    });
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {messages.map((msg) => (
        <Box
          key={msg.key}
          sx={{
            mb: 0.75,
            p: "6px 10px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            borderLeft: `3px solid ${PLATFORM_COLOR[msg.from] ?? "#888"}`,
            maxWidth: 480,
            animation: "fadeSlideIn 0.2s ease",
            "@keyframes fadeSlideIn": {
              from: { opacity: 0, transform: "translateX(-8px)" },
              to: { opacity: 1, transform: "translateX(0)" },
            },
          }}
        >
          {/* Badges */}
          {msg.badges.length > 0 && (
            <Box sx={{ display: "inline-flex", gap: 0.25, mr: 0.5, verticalAlign: "middle" }}>
              {msg.badges.map((badge, i) => (
                <img key={i} src={badge} alt="" style={{ width: 16, height: 16, borderRadius: 2 }} />
              ))}
            </Box>
          )}
          <span style={{ fontWeight: 700, color: msg.color || "#fff", fontSize: 14 }}>
            {msg.user}
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 4px", fontSize: 12 }}>·</span>
          <span
            style={{ color: "#e8e8e8", fontSize: 14 }}
            dangerouslySetInnerHTML={{ __html: msg.message }}
          />
        </Box>
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}
