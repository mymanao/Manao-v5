import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { api } from "@/hooks/useApi";
import { useSocket } from "@/hooks/useSocket";
import type { SoundEntry } from "@/types/api";

const EMPTY: SoundEntry = { name: "", url: "" };

export function SoundboardPage() {
  const [sounds, setSounds] = useState<SoundEntry[]>([]);
  const [localFiles, setLocalFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<SoundEntry>(EMPTY);
  const [preview, setPreview] = useState<HTMLAudioElement | null>(null);
  const { socket } = useSocket();

  const load = useCallback(async () => {
    try {
      const [cfg, files] = await Promise.all([
        api.get<{ soundboard: SoundEntry[] }>("/api/soundboard"),
        api.get<string[]>("/api/sounds"),
      ]);
      setLocalFiles(files);

      // Auto-populate from local files on first load
      if ((cfg.soundboard ?? []).length === 0 && files.length > 0) {
        const defaults: SoundEntry[] = files.map((f) => ({
          name: f.replace("/sounds/", "").replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          url: f,
        }));
        await api.post("/api/soundboard", { soundboard: defaults });
        setSounds(defaults);
      } else {
        setSounds(cfg.soundboard ?? []);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (next: SoundEntry[]) => {
    await api.post("/api/soundboard", { soundboard: next });
    setSounds(next);
  };

  const openCreate = () => {
    setEditIdx(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditIdx(idx);
    setForm(sounds[idx]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.url) return;
    const next =
      editIdx !== null
        ? sounds.map((s, i) => (i === editIdx ? form : s))
        : [...sounds, form];
    await save(next);
    setDialogOpen(false);
  };

  const handleDelete = async (idx: number) => {
    if (!confirm(`Delete "${sounds[idx].name}"?`)) return;
    await save(sounds.filter((_, i) => i !== idx));
  };

  const playSound = (url: string, name: string) => {
    socket.emit("play-sound", { url, name });
  };

  const playPreview = (url: string) => {
    preview?.pause();
    const audio = new Audio(url);
    audio.play().catch(() => {});
    setPreview(audio);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Soundboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click a button to play a sound through the overlay.
          </Typography>
        </Box>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            href="/overlay/sound"
            target="_blank"
          >
            Open Player
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Sound
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {sounds.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No sounds yet. Add one to get started.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 1.5,
          }}
        >
          {sounds.map((s, idx) => (
            <Paper
              key={idx}
              sx={{
                position: "relative",
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 1.5,
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "rgba(124,58,237,0.12)",
                  borderColor: "primary.main",
                },
                "&:active": { transform: "scale(0.96)" },
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onClick={() => playSound(s.url, s.name)}
            >
              <VolumeUpIcon sx={{ fontSize: 28, color: "primary.main", mb: 1 }} />
              <Typography
                variant="body2"
                fontWeight={700}
                textAlign="center"
                sx={{
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                }}
              >
                {s.name}
              </Typography>

              <Stack
                direction="row"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  opacity: 0,
                  ".MuiPaper-root:hover &": { opacity: 1 },
                  transition: "opacity 0.15s",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(idx)}>
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editIdx !== null ? "Edit Sound" : "Add Sound"}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {localFiles.length > 0 && (
              <FormControl size="small" fullWidth>
                <InputLabel>Local file</InputLabel>
                <Select
                  value={localFiles.includes(form.url) ? form.url : ""}
                  label="Local file"
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {localFiles.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f.replace("/sounds/", "")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              size="small"
              fullWidth
              label="Or paste URL"
              value={localFiles.includes(form.url) ? "" : form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com/sound.mp3"
            />

            {form.url && (
              <Button
                size="small"
                startIcon={<VolumeUpIcon />}
                onClick={() => playPreview(form.url)}
              >
                Preview
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name || !form.url}
          >
            {editIdx !== null ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}