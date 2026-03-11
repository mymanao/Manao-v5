import { useState } from "react";
import {
  Paper, Typography, Button, Stack, TextField, Switch,
  FormControlLabel, Alert, Divider, Box,
} from "@mui/material";
import type { SetupConfig } from "../App";

export default function DiscordPage({
                                      config, onNext, onBack, onReload,
                                    }: {
  config: SetupConfig;
  onNext: () => void;
  onBack: () => void;
  onReload: () => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(config.discord.enabled ?? false);
  const [botToken, setBotToken] = useState(config.discord.token ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!enabled) { onNext(); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/setup/api/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: "true", botToken }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Save failed");
      await onReload();
      onNext();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Discord</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Optional — connect a Discord bot to your server.
      </Typography>

      <FormControlLabel
        control={<Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />}
        label="Enable Discord"
        sx={{ mb: 3 }}
      />

      {enabled && (
        <Stack spacing={2}>
          <Divider />
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Create a bot at{" "}
              <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer"
                 style={{ color: "#9147ff" }}>
                discord.com/developers
              </a>{" "}
              and copy the Bot Token.
            </Typography>
          </Box>
          <TextField
            size="small" fullWidth label="Bot Token" required
            value={botToken}
            onFocus={() => { if (botToken === "••••••••") setBotToken(""); }}
            onChange={(e) => setBotToken(e.target.value)}
            type="password"
          />
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button onClick={onBack} variant="outlined" fullWidth>Back</Button>
        <Button onClick={save} variant="contained" fullWidth disabled={saving}>
          {saving ? "Saving…" : "Next"}
        </Button>
      </Stack>
    </Paper>
  );
}