import { useState } from "react";
import {
  Paper, Typography, Button, Stack, TextField, Switch,
  FormControlLabel, Alert, Divider, Box, Chip, CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { SetupConfig } from "../App";

export default function KickPage({
                                   config, onNext, onBack, onReload,
                                 }: {
  config: SetupConfig;
  onNext: () => void;
  onBack: () => void;
  onReload: () => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(config.kick.enabled ?? false);
  const [clientId, setClientId] = useState(config.kick.clientId ?? "");
  const [clientSecret, setClientSecret] = useState(config.kick.clientSecret ?? "");
  const [ngrokAuthtoken, setNgrokAuthtoken] = useState(config.kick.ngrokAuthtoken ?? "");
  const [ngrokDomain, setNgrokDomain] = useState(config.kick.ngrokDomain ?? "");
  const [hasTokens, setHasTokens] = useState(config.kick.hasTokens ?? false);
  const [authorizing, setAuthorizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCredentials = (clientId?.length ?? 0) > 0 && (clientSecret?.length ?? 0) > 0;

  const authorize = async () => {
    setAuthorizing(true);
    setError(null);
    try {
      const res = await fetch("/setup/api/kick/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret: clientSecret.includes("•") ? "" : clientSecret,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Authorization failed");
      await onReload();
      setHasTokens(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setAuthorizing(false);
    }
  };

  const save = async () => {
    if (!enabled) { onNext(); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/setup/api/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: "true",
          clientId, clientSecret,
          ngrokAuthtoken, ngrokDomain,
        }),
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
      <Typography variant="h5" fontWeight={700} gutterBottom>Kick</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Optional — connect to Kick chat. Requires ngrok for EventSub webhooks.
      </Typography>

      <FormControlLabel
        control={<Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />}
        label="Enable Kick"
        sx={{ mb: 3 }}
      />

      {enabled && (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              1. Kick App Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Create an app at{" "}
              <a href="https://kick.com/settings/developer" target="_blank" rel="noreferrer"
                 style={{ color: "#53fc18" }}>
                kick.com/settings/developer
              </a>
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

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              2. Authorize Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A browser window will open for Kick OAuth. Make sure Client ID and Secret are filled first.
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                variant="outlined"
                endIcon={authorizing ? <CircularProgress size={14} /> : <OpenInNewIcon />}
                disabled={!hasCredentials || authorizing}
                onClick={authorize}
                sx={{ borderColor: "#53fc18", color: "#53fc18", "&:hover": { borderColor: "#53fc18" } }}
              >
                {authorizing ? "Waiting for browser…" : "Authorize Kick Account"}
              </Button>
              {hasTokens && (
                <Chip icon={<CheckCircleIcon />} label="Authorized" size="small" color="success" />
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              3. Ngrok (for webhooks)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Get your auth token at{" "}
              <a href="https://dashboard.ngrok.com/get-started/your-authtoken" target="_blank" rel="noreferrer"
                 style={{ color: "#53fc18" }}>
                dashboard.ngrok.com
              </a>
            </Typography>
            <Stack spacing={2}>
              <TextField size="small" fullWidth label="Ngrok Auth Token"
                         value={ngrokAuthtoken} onChange={(e) => setNgrokAuthtoken(e.target.value)} />
              <TextField size="small" fullWidth label="Ngrok Domain (optional)"
                         value={ngrokDomain} onChange={(e) => setNgrokDomain(e.target.value)}
                         placeholder="your-domain.ngrok-free.app" />
            </Stack>
          </Box>
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button onClick={onBack} variant="outlined" fullWidth>Back</Button>
        <Button
          onClick={save} variant="contained" fullWidth
          disabled={saving || (enabled && !hasTokens)}
        >
          {saving ? "Saving…" : enabled && !hasTokens ? "Authorize first" : "Next"}
        </Button>
      </Stack>
    </Paper>
  );
}