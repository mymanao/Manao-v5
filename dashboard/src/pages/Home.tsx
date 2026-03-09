import { Box, Grid, Paper, Typography, Button, Stack, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import TerminalIcon from "@mui/icons-material/Terminal";
import SettingsIcon from "@mui/icons-material/Settings";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import ChatIcon from "@mui/icons-material/Chat";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import RedeemIcon from "@mui/icons-material/Redeem";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSocket } from "@/hooks/useSocket";

const QUICK_LINKS = [
  {
    title: "Commands",
    description: "Enable/disable built-in commands and manage custom ones.",
    icon: <TerminalIcon sx={{ fontSize: 32 }} />,
    color: "#7C3AED",
    actions: [{ label: "Open", to: "/commands" }],
  },
  {
    title: "Config",
    description: "Language, currency, prefixes, custom messages, chat rewards.",
    icon: <SettingsIcon sx={{ fontSize: 32 }} />,
    color: "#06B6D4",
    actions: [{ label: "Open", to: "/config" }],
  },
  {
    title: "Music Queue",
    description: "View the current song queue and control playback.",
    icon: <QueueMusicIcon sx={{ fontSize: 32 }} />,
    color: "#22C55E",
    actions: [{ label: "Queue", to: "/queue" }],
  },
  {
    title: "Custom Replies",
    description: "Auto-reply to keywords in chat.",
    icon: <ForumIcon sx={{ fontSize: 32 }} />,
    color: "#F59E0B",
    actions: [{ label: "Open", to: "/replies" }],
  },
  {
    title: "Channel Points",
    description: "Manage sound rewards and channel point redemptions.",
    icon: <RedeemIcon sx={{ fontSize: 32 }} />,
    color: "#EF4444",
    actions: [{ label: "Open", to: "/channel-points" }],
  },
];

const OVERLAY_LINKS = [
  { label: "Chat", path: "/overlay/chat", icon: <ChatIcon fontSize="small" /> },
  { label: "Feed", path: "/overlay/feed", icon: <GraphicEqIcon fontSize="small" /> },
  { label: "Music", path: "/overlay/music", icon: <MusicNoteIcon fontSize="small" /> },
];

export function HomePage() {
  const { connected } = useSocket();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #A78BFA, #67E8F9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
          }}
        >
          🍋 Manao Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Your all-in-one streaming bot — Twitch · Kick · Discord
        </Typography>
        <Chip
          size="small"
          label={connected ? "Bot connected" : "Bot offline"}
          color={connected ? "success" : "default"}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Quick access cards */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.1em" }}>
        Quick Access
      </Typography>
      <Grid container spacing={2} sx={{ mt: 0.5, mb: 4 }}>
        {QUICK_LINKS.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
            <Paper
              sx={{
                p: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.2s, transform 0.2s",
                "&:hover": {
                  borderColor: `${item.color}55`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  bgcolor: `${item.color}20`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                {item.icon}
              </Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
                {item.description}
              </Typography>
              <Stack direction="row" spacing={1}>
                {item.actions.map((a) => (
                  <Button
                    key={a.label}
                    component={Link}
                    to={a.to}
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: item.color, "&:hover": { bgcolor: item.color, filter: "brightness(1.15)" } }}
                  >
                    {a.label}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Overlays */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.1em" }}>
        Stream Overlays
      </Typography>
      <Paper sx={{ mt: 1, p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add these URLs as Browser Sources in OBS/Streamlabs.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {OVERLAY_LINKS.map((ol) => (
            <Button
              key={ol.label}
              component={Link}
              to={ol.path}
              target="_blank"
              size="small"
              variant="outlined"
              startIcon={ol.icon}
              endIcon={<OpenInNewIcon sx={{ fontSize: "12px !important" }} />}
            >
              {ol.label}
            </Button>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
