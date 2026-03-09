import { useState } from "react";
import { Box } from "@mui/material";
import { useSocketEvent } from "@/hooks/useSocket";
import type { FeedEvent, FeedStatus } from "@/types/api";

interface FeedItem extends FeedEvent {
  key: string;
}

const STATUS_COLOR: Record<FeedStatus, string> = {
  neutral: "#94A3B8",
  normal: "#7C3AED",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export function FeedOverlay() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useSocketEvent<FeedEvent>("feed", (data) => {
    const item: FeedItem = { ...data, key: `${Date.now()}-${Math.random()}` };
    setItems((prev) => [item, ...prev.slice(0, 9)]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    }, 8000);
  });

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        fontFamily: "'DM Sans', sans-serif",
        pointerEvents: "none",
      }}
    >
      {items.map((item) => {
        const color = STATUS_COLOR[item.status];
        return (
          <Box
            key={item.key}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: "10px",
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${color}55`,
              boxShadow: `0 0 12px ${color}33`,
              minWidth: 220,
              animation: "feedIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              "@keyframes feedIn": {
                from: { opacity: 0, transform: "translateX(40px) scale(0.9)" },
                to: { opacity: 1, transform: "translateX(0) scale(1)" },
              },
            }}
          >
            <Box
              sx={{
                width: 32, height: 32, borderRadius: "8px",
                background: `${color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{item.name}</Box>
              <Box sx={{ fontSize: 12, color: color, lineHeight: 1.2 }}>{item.action}</Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
