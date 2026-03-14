import {
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { SetupConfig } from "../App";

export default function DonePage({ config }: { config: SetupConfig }) {
  const platforms = [
    {
      name: "Twitch",
      ok: config.twitch.enabled && config.twitch.hasTokens,
      color: "#9147ff",
    },
    {
      name: "Discord",
      ok: config.discord.enabled && config.discord.hasToken,
      color: "#5865f2",
    },
    {
      name: "Kick",
      ok: config.kick.enabled && config.kick.hasTokens,
      color: "#53fc18",
    },
  ];
  const anyEnabled = platforms.some((p) => p.ok);

  return (
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {anyEnabled ? "Setup Complete!" : "No Platforms Configured"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {anyEnabled
          ? "Your bot is ready. Start it by clicking at \"ManaoBot\" shortcut on your desktop! Feel free to close this page and program."
          : "Go back and enable at least one platform to use the bot."}
      </Typography>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
        {platforms
          .filter((p) => p.ok)
          .map((p) => (
            <Chip
              key={p.name}
              label={p.name}
              color="success"
              variant="outlined"
            />
          ))}
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => (window.location.href = "/")}
        >
          Back to Welcome
        </Button>
      </Stack>
    </Paper>
  );
}
