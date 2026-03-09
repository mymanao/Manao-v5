import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TerminalIcon from "@mui/icons-material/Terminal";
import SettingsIcon from "@mui/icons-material/Settings";
import ChatIcon from "@mui/icons-material/Chat";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import RedeemIcon from "@mui/icons-material/Redeem";
import ForumIcon from "@mui/icons-material/Forum";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { useSocket } from "@/hooks/useSocket";
import * as React from "react";

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <DashboardIcon />, path: "/" },
  {
    label: "Commands",
    icon: <TerminalIcon />,
    path: "/commands",
    section: "Manager",
  },
  { label: "Config", icon: <SettingsIcon />, path: "/config" },
  { label: "Custom Replies", icon: <ForumIcon />, path: "/replies" },
  { label: "Channel Points", icon: <RedeemIcon />, path: "/channel-points" },
  {
    label: "Song Queue",
    icon: <QueueMusicIcon />,
    path: "/queue",
    section: "Overlays",
  },
  { label: "Chat Overlay", icon: <ChatIcon />, path: "/overlay/chat" },
  { label: "Feed Overlay", icon: <GraphicEqIcon />, path: "/overlay/feed" },
  { label: "Music Overlay", icon: <MusicNoteIcon />, path: "/overlay/music" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { connected } = useSocket();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const isOverlay = location.pathname.startsWith("/overlay/");

  if (isOverlay) return <>{children}</>;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            🍋 Manao v5
          </Typography>
          <Chip
            icon={
              connected ? (
                <WifiIcon sx={{ fontSize: "12px !important" }} />
              ) : (
                <WifiOffIcon sx={{ fontSize: "12px !important" }} />
              )
            }
            label={connected ? "Connected" : "Disconnected"}
            size="small"
            color={connected ? "success" : "error"}
            variant="outlined"
            sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }}
          />
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Nav */}
        <List sx={{ flex: 1, px: 1, py: 1 }}>
          {NAV_ITEMS.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const showSection =
              item.section &&
              (idx === 0 || NAV_ITEMS[idx - 1]?.section !== item.section);

            return (
              <Box key={item.path}>
                {showSection && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      display: "block",
                      color: "text.secondary",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                      mt: 1,
                    }}
                  >
                    {item.section}
                  </Typography>
                )}
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mb: 0.25,
                    transition: "all 0.15s ease",
                    "&.Mui-selected": {
                      bgcolor: "rgba(124,58,237,0.15)",
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                      "& .MuiListItemText-primary": {
                        color: "primary.light",
                        fontWeight: 600,
                      },
                      "&:hover": { bgcolor: "rgba(124,58,237,0.2)" },
                    },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive
                        ? "primary.main"
                        : hoveredPath === item.path
                          ? "text.primary"
                          : "text.secondary",
                      transition: "color 0.15s ease",
                      "& svg": { fontSize: "1.1rem" },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </Box>
            );
          })}
        </List>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Manao v5.0.0-alpha.0
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
