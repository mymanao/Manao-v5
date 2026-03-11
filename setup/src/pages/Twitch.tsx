import { useState, useEffect, useRef } from "react";
import {
  Paper, Typography, Button, Stack, TextField, Switch,
  FormControlLabel, Alert, Divider, Box, Chip, CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { SetupConfig } from "../App";

export default function TwitchPage({
                                     config, onNext, onBack, onReload,
                                   }: {
  config: SetupConfig;
  onNext: () => void;
  onBack: () => void;
  onReload: () => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(config.twitch.enabled ?? false);
  const [clientId, setClientId] = useState(config.twitch.clientId ?? "");
  const [clientSecret, setClientSecret] = useState(config.twitch.clientSecret ?? "");
  const [botAuthed, setBotAuthed] = useState(config.twitch.hasTokens ?? false);
  const [broadcasterAuthed, setBroadcasterAuthed] = useState(config.twitch.hasTokens ?? false);
  const [authorizing, setAuthorizing] = useState<"bot" | "broadcaster" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasCredentials = (clientId?.length ?? 0) > 0 && (clientSecret?.length ?? 0) > 0;

  const authorize = async (role: "bot" | "broadcaster") => {
    setError(null);
    setAuthorizing(role);
    try {
      const res = await fetch("/setup/api/twitch/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          clientId,
          clientSecret: clientSecret.includes("•") ? "" : clientSecret,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to start OAuth");

      // Open OAuth URL in new window
      window.open(data.url, "_blank", "width=600,height=700");

      // Poll config until tokens appear
      pollRef.current = setInterval(async () => {
        const cfg = await fetch("/setup/api/config").then(r => r.json());
        if (cfg.twitch.hasTokens) {
          clearInterval(pollRef.current!);
          await onReload();
          if (role === "bot") setBotAuthed(true);
          else setBroadcasterAuthed(true);
          setAuthorizing(null);
        }
      }, 1500);
    } catch (e) {
      setError(String(e));
      setAuthorizing(null);
    }
  };

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const save = async () => {
    if (!enabled) { onNext(); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/setup/api/twitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: "true", clientId, clientSecret }),
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

  const canProceed = !enabled || (botAuthed && broadcasterAuthed);

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Twitch</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Connect your Twitch bot and broadcaster account.
      </Typography>

      <FormControlLabel
        control={<Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />}
        label="Enable Twitch"
        sx={{ mb: 3 }}
      />

      {enabled && (
        <Stack spacing={3}>
          {/* Step 1 */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              1. Twitch App Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Create an app at{" "}
              <a href="https://dev.twitch.tv/console/apps/create" target="_blank" rel="noreferrer"
                 style={{ color: "#9147ff" }}>
                dev.twitch.tv
              </a>
              {" "}with redirect URI{" "}
              <code style={{ background: "#333", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
                http://localhost:4000/setup/callback/twitch
              </code>
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField size="small" fullWidth label="Client ID"
                         value={clientId} onChange={(e) => setClientId(e.target.value)} />
              <TextField size="small" fullWidth label="Client Secret" type="password"
                         value={clientSecret}
                         onFocus={() => { if (clientSecret.includes("•")) setClientSecret(""); }}
                         onChange={(e) => setClientSecret(e.target.value)} />
            </Stack>
          </Box>

          <Divider />

          {/* Step 2 */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              2. Authorize Accounts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Authorize your <strong>bot account</strong> first, then your <strong>broadcaster account</strong>.
              A browser window will open for each.
            </Typography>

            <Stack spacing={2}>
              {/* Bot */}
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2">Bot Account</Typography>
                  {botAuthed && <Chip icon={<CheckCircleIcon />} label="Authorized" size="small" color="success" />}
                </Stack>
                <Button
                  variant="outlined" size="small"
                  endIcon={authorizing === "bot" ? <CircularProgress size={14} /> : <OpenInNewIcon />}
                  disabled={!hasCredentials || authorizing !== null}
                  onClick={() => authorize("bot")}
                >
                  {authorizing === "bot" ? "Waiting…" : botAuthed ? "Re-authorize Bot" : "Authorize Bot Account"}
                </Button>
              </Box>

              {/* Broadcaster */}
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2">Broadcaster Account</Typography>
                  {broadcasterAuthed && <Chip icon={<CheckCircleIcon />} label="Authorized" size="small" color="success" />}
                </Stack>
                <Button
                  variant="outlined" size="small"
                  endIcon={authorizing === "broadcaster" ? <CircularProgress size={14} /> : <OpenInNewIcon />}
                  disabled={!hasCredentials || authorizing !== null}
                  onClick={() => authorize("broadcaster")}
                >
                  {authorizing === "broadcaster" ? "Waiting…" : broadcasterAuthed ? "Re-authorize Broadcaster" : "Authorize Broadcaster Account"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button onClick={onBack} variant="outlined" fullWidth>Back</Button>
        <Button
          onClick={save} variant="contained" fullWidth
          disabled={saving || !canProceed}
        >
          {saving ? "Saving…" : !canProceed ? "Authorize both accounts first" : "Next"}
        </Button>
      </Stack>
    </Paper>
  );
}