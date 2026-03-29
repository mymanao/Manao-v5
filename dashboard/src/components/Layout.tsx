import { version } from "../../../package.json"
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
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TerminalIcon from "@mui/icons-material/Terminal";
import SettingsIcon from "@mui/icons-material/Settings";
import ChatIcon from "@mui/icons-material/Chat";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RedeemIcon from "@mui/icons-material/Redeem";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PaletteIcon from "@mui/icons-material/Palette";
import ForumIcon from "@mui/icons-material/Forum";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MenuIcon from "@mui/icons-material/Menu";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSocket } from "@/hooks/useSocket";
import * as React from "react";

const DRAWER_WIDTH = 232;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <DashboardIcon />, path: "/" },
  { label: "Song Queue", icon: <QueueMusicIcon />, path: "/queue" },
  { label: "Soundboard", icon: <VolumeUpIcon />, path: "/soundboard" },
  {
    label: "Commands",
    icon: <TerminalIcon />,
    path: "/manager/commands",
    section: "Manager",
  },
  { label: "Custom Replies", icon: <ForumIcon />, path: "/manager/replies" },
  {
    label: "Channel Points",
    icon: <RedeemIcon />,
    path: "/manager/channel-points",
  },
  {
    label: "Scheduled Messages",
    icon: <ScheduleIcon />,
    path: "/manager/scheduled-messages",
  },
  {
    label: "Config",
    icon: <SettingsIcon />,
    path: "/customize/config",
    section: "Customize",
  },
  { label: "Overlay", icon: <PaletteIcon />, path: "/customize/overlay" },
  {
    label: "Chat Overlay",
    icon: <ChatIcon />,
    path: "/overlay/chat",
    section: "Overlays",
  },
  { label: "Feed Overlay", icon: <GraphicEqIcon />, path: "/overlay/feed" },
  { label: "Music Overlay", icon: <MusicNoteIcon />, path: "/overlay/music" },
  { label: "Sound Overlay", icon: <VolumeUpIcon />, path: "/overlay/sound" },
];

function DrawerContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { connected } = useSocket();

  return (
    <>
      {/* Logo area */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            component="img"
            src="/manao_mini.png"
            alt="Manao"
            sx={{ width: 32, height: 32, flexShrink: 0, display: "block" }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              Manao
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", fontSize: "0.65rem" }}
            >
              Version {version}
            </Typography>
          </Box>
        </Box>

        {/* Connection status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            background: connected
              ? "rgba(105,240,0,0.06)"
              : "rgba(255,255,255,0.03)",
            border: "1px solid",
            borderColor: connected
              ? "rgba(105,240,0,0.15)"
              : "rgba(255,255,255,0.06)",
          }}
        >
          <FiberManualRecordIcon
            sx={{
              fontSize: 8,
              color: connected ? "#69F000" : "#424242",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: connected ? "#69F000" : "text.disabled",
              letterSpacing: "0.03em",
            }}
          >
            {connected ? "Connected" : "Disconnected"}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: "auto" }}>
        {NAV_ITEMS.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const showSection =
            item.section &&
            (idx === 0 || NAV_ITEMS[idx - 1]?.section !== item.section);

          return (
            <Box key={item.path}>
              {showSection && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 1,
                    py: 0.5,
                    display: "block",
                    color: "text.disabled",
                    mt: idx === 0 ? 0 : 1.5,
                    mb: 0.5,
                  }}
                >
                  {item.section}
                </Typography>
              )}
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                onClick={onClose}
                sx={{ mb: 0.25, px: 1, py: 0.75, minHeight: 36 }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActive ? "primary.main" : "text.disabled",
                    "& svg": { fontSize: "1rem" },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: "0.8125rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "primary.main" : "text.secondary",
                    },
                  }}
                />
              </ListItemButton>
            </Box>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Box
          component="a"
          href="https://manao.otternoon.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.disabled",
            fontSize: "0.65rem",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
            transition: "color 0.15s",
          }}
        >
          Open Docs
          <OpenInNewIcon sx={{ fontSize: "0.6rem" }} />
        </Box>
      </Box>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Mobile top bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: "flex", md: "none" },
          background: "#111",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: "52px !important", px: 2, gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ color: "text.secondary", p: 0.75 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box
            component="img"
            src="/manao_mini.png"
            alt="Manao"
            sx={{ width: 24, height: 24, display: "block" }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.01em",
            }}
          >
            Manao
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DrawerContent onClose={() => setMobileOpen(false)} />
      </Drawer>

      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: "68px", md: 3 },
          overflow: "auto",
          minWidth: 0,
          background: "#0D0D0D",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
