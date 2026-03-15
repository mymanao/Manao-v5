import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { SetupConfig } from "../App";

export default function YouTubePage({
                                      config,
                                      onNext,
                                      onBack,
                                      onReload,
                                    }: {
  config: SetupConfig;
  onNext: () => void;
  onBack: () => void;
  onReload: () => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(config.youtube.enabled ?? false);
  const [clientId, setClientId] = useState(config.youtube.clientId ?? "");
  const [clientSecret, setClientSecret] = useState(
    config.youtube.clientSecret ?? "",
  );
  const [authed, setAuthed] = useState(config.youtube.hasTokens ?? false);
  const [authorizing, setAuthorizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCredentials =
    (clientId?.length ?? 0) > 0 && (clientSecret?.length ?? 0) > 0;

  // Authorize: POST to server which opens browser + waits for callback itself
  const authorize = async () => {
    setError(null);
    setAuthorizing(true);
    try {
      const res = await fetch("/setup/api/youtube/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret: clientSecret.includes("•") ? "" : clientSecret,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Authorization failed");
        return;
      }
      await onReload();
      setAuthed(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setAuthorizing(false);
    }
  };

  const save = async () => {
    if (!enabled) {
      onNext();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/setup/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: "true", clientId, clientSecret }),
      });
      const data = await res.json();
      if (!data.success) {
        setError("Save failed");
        return;
      }
      await onReload();
      onNext();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const canProceed = !enabled || authed;

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        YouTube
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Connect your YouTube channel to read live chat.
      </Typography>

      <FormControlLabel
        control={<Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />}
        label="Enable YouTube"
        sx={{ mb: 3 }}
      />

      {enabled && (
        <Stack spacing={3}>
          {/* Step 1 */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              1. Google Cloud Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Go to{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#FF0000" }}
              >
                console.cloud.google.com
              </a>
              , enable <strong>YouTube Data API v3</strong>, then create an{" "}
              <strong>OAuth 2.0 Client ID</strong> with application type{" "}
              <strong>Desktop app</strong>. No redirect URI needed.
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                fullWidth
                label="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                label="Client Secret"
                type="password"
                value={clientSecret}
                onFocus={() => {
                  if (clientSecret.includes("•")) setClientSecret("");
                }}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Step 2 */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              2. Authorize YouTube Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click Authorize — a browser window will open automatically. Sign
              in with the Google account that owns your YouTube channel, then
              come back here.
            </Typography>

            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle2">YouTube Account</Typography>
                {authed && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Authorized"
                    size="small"
                    color="success"
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                endIcon={authorizing ? <CircularProgress size={14} /> : undefined}
                disabled={!hasCredentials || authorizing}
                onClick={authorize}
              >
                {authorizing
                  ? "Waiting for Google login…"
                  : authed
                    ? "Re-authorize Account"
                    : "Authorize YouTube Account"}
              </Button>
            </Box>
          </Box>
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button onClick={onBack} variant="outlined" fullWidth>
          Back
        </Button>
        <Button
          onClick={save}
          variant="contained"
          fullWidth
          disabled={saving || !canProceed}
        >
          {saving
            ? "Saving…"
            : !canProceed
              ? "Authorize account first"
              : "Next"}
        </Button>
      </Stack>
    </Paper>
  );
}