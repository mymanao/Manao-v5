import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Slider,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { api } from "@/hooks/useApi.ts";
import type { Configuration } from "@/types/api.ts";

const PLATFORMS = ["twitch", "kick", "discord"] as const;

const CUSTOM_MESSAGE_KEYS = [
  {
    key: "onFollow" as const,
    label: "On Follow",
    placeholder: "[user] just followed!",
  },
  {
    key: "onSubscribe" as const,
    label: "On Subscribe",
    placeholder: "[user] just subscribed!",
  },
  {
    key: "onGiftSubscribe" as const,
    label: "On Gift Subscribe",
    placeholder: "[user] gifted a sub!",
  },
  {
    key: "onRaid" as const,
    label: "On Raid",
    placeholder: "[user] raided with [viewers] viewers!",
  },
  {
    key: "onCheer" as const,
    label: "On Cheer",
    placeholder: "[user] cheered [amount] bits!",
  },
];

export function ConfigPage() {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Configuration>("/api/config");
      setConfig(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!config) return;
    try {
      setSaving(true);
      await api.post("/api/config", config);
      setToast("Saved!");
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (!config) return <Alert severity="error">Failed to load config.</Alert>;

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Config
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Changes are saved to userConfig.json
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
          onClick={save}
          disabled={saving}
        >
          Save Changes
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* General */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            General
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select
                  value={config.language}
                  label="Language"
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      language: e.target.value as "en" | "th",
                    })
                  }
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="th">ภาษาไทย</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Currency Name"
                value={config.currency}
                onChange={(e) =>
                  setConfig({ ...config, currency: e.target.value })
                }
                placeholder="COIN"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Prefixes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Command Prefixes
          </Typography>
          <Grid container spacing={2}>
            {(["twitch", "kick", "discord"] as const).map((p) => (
              <Grid size={{ xs: 6, sm: 4 }} key={p}>
                <TextField
                  fullWidth
                  size="small"
                  label={`${p.charAt(0).toUpperCase() + p.slice(1)} Prefix`}
                  value={config.prefix[p]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      prefix: { ...config.prefix, [p]: e.target.value },
                    })
                  }
                  slotProps={{ htmlInput: { maxLength: 3 } }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Chat Rewards */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            Chat Rewards
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 2, display: "block" }}
          >
            Currency earned by chatters for sending messages.
          </Typography>
          <Stack
            spacing={3}
            divider={<Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />}
          >
            {PLATFORMS.map((platform) => (
              <Box key={platform}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ mb: 1.5, textTransform: "capitalize" }}
                >
                  {platform}
                </Typography>
                <Grid container spacing={2}>
                  {(["minimum", "maximum", "cooldown"] as const).map(
                    (field) => (
                      <Grid size={{ xs: 6, sm: 3 }} key={field}>
                        <TextField
                          fullWidth
                          size="small"
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          type="number"
                          value={config.chatRewards[platform][field]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              chatRewards: {
                                ...config.chatRewards,
                                [platform]: {
                                  ...config.chatRewards[platform],
                                  [field]: Number(e.target.value),
                                },
                              },
                            })
                          }
                          slotProps={{
                            htmlInput:
                              field === "cooldown"
                                ? {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        s
                                      </InputAdornment>
                                    ),
                                  }
                                : undefined,
                          }}
                        />
                      </Grid>
                    ),
                  )}
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Chance: {config.chatRewards[platform].chance}%
                    </Typography>
                    <Slider
                      size="small"
                      value={config.chatRewards[platform].chance}
                      min={0}
                      max={100}
                      step={5}
                      onChange={(_, v) =>
                        setConfig({
                          ...config,
                          chatRewards: {
                            ...config.chatRewards,
                            [platform]: {
                              ...config.chatRewards[platform],
                              chance: v as number,
                            },
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Custom Messages */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            Custom Messages
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 2, display: "block" }}
          >
            Use <code>[user]</code>, <code>[viewers]</code>,{" "}
            <code>[amount]</code> as placeholders.
          </Typography>
          <Stack
            spacing={2.5}
            divider={<Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />}
          >
            {CUSTOM_MESSAGE_KEYS.map(({ key, label, placeholder }) => (
              <Box key={key}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  {label}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="English"
                      value={config.customMessages[key].en}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          customMessages: {
                            ...config.customMessages,
                            [key]: {
                              ...config.customMessages[key],
                              en: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder={placeholder}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Thai"
                      value={config.customMessages[key].th}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          customMessages: {
                            ...config.customMessages,
                            [key]: {
                              ...config.customMessages[key],
                              th: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
      />
    </Box>
  );
}
