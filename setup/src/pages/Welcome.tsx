import { Box, Paper, Typography, Button, Chip, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { SetupConfig } from "../App";

export default function WelcomePage({
  config,
  onNext,
}: {
  config: SetupConfig;
  onNext: () => void;
}) {
  const platforms = [
    { name: "Twitch", ok: config.twitch.enabled && config.twitch.hasTokens },
    { name: "Discord", ok: config.discord.enabled && config.discord.hasToken },
    { name: "Kick", ok: config.kick.enabled && config.kick.hasTokens },
    { name: "YouTube", ok: config.youtube.enabled && config.youtube.hasTokens },
  ];

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Welcome to Manao v5
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This wizard will help you connect your streaming platforms. You only
        need to set up the platforms you use.
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 4 }}>
        {platforms.map((p) => (
          <Box
            key={p.name}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            {p.ok ? (
              <CheckCircleIcon color="success" />
            ) : (
              <RadioButtonUncheckedIcon color="disabled" />
            )}
            <Typography>{p.name}</Typography>
            {p.ok && (
              <Chip
                label="Configured"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        ))}
      </Stack>

      <Stack spacing={2}>
        <Button
          variant={config.complete ? "text" : "contained"}
          size="large"
          fullWidth
          onClick={onNext}
        >
          {config.complete ? "Reconfigure platforms" : "Get Started"}
        </Button>
      </Stack>
    </Paper>
  );
}
