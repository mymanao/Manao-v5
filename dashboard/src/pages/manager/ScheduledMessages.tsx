import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { api } from "@/hooks/useApi";
import type { ScheduledMessage, Platform } from "@/types/api";

const PLATFORMS: Platform[] = ["twitch", "kick"];

const empty = (): Omit<ScheduledMessage, "id"> => ({
  messages: [],
  intervalSeconds: 300,
  mode: "sequential",
  platforms: ["twitch"],
  isEnabled: true,
});

export function ScheduledMessagesPage() {
  const [items, setItems] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<
    Omit<ScheduledMessage, "id"> & { messagesStr: string }
  >({ ...empty(), messagesStr: "" });

  const load = useCallback(async () => {
    try {
      const data = await api.get<ScheduledMessage[]>("/api/scheduled-messages");
      setItems(data);
    } catch {
      setError("Failed to load scheduled messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...empty(), messagesStr: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: ScheduledMessage) => {
    setEditId(item.id);
    setForm({ ...item, messagesStr: item.messages.join("\n") });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const messages = form.messagesStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (messages.length === 0) {
        setError("Add at least one message");
        return;
      }
      if (form.platforms.length === 0) {
        setError("Select at least one platform");
        return;
      }

      const payload = {
        messages,
        intervalSeconds: form.intervalSeconds,
        mode: form.mode,
        platforms: form.platforms,
        isEnabled: form.isEnabled,
      };

      if (editId) {
        await api.put(`/api/scheduled-messages/${editId}`, payload);
      } else {
        await api.post("/api/scheduled-messages", payload);
      }
      setDialogOpen(false);
      await load();
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scheduled message?")) return;
    try {
      await api.delete(`/api/scheduled-messages/${id}`);
      await load();
    } catch {
      setError("Failed to delete");
    }
  };

  const toggleEnabled = async (item: ScheduledMessage) => {
    try {
      await api.put(`/api/scheduled-messages/${item.id}`, {
        ...item,
        isEnabled: !item.isEnabled,
      });
      await load();
    } catch {
      setError("Failed to update");
    }
  };

  const togglePlatform = (p: Platform) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
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
            Scheduled Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Messages sent automatically to chat at set intervals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Add
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <AccessTimeIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
          />
          <Typography color="text.secondary">
            No scheduled messages yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ mt: 2 }}
          >
            Add first message
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Enabled</TableCell>
                <TableCell>Messages</TableCell>
                <TableCell>Interval</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Platforms</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={item.isEnabled}
                      onChange={() => toggleEnabled(item)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.messages[0]}
                      {item.messages.length > 1 && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.disabled"
                          sx={{ ml: 0.5 }}
                        >
                          +{item.messages.length - 1} more
                        </Typography>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatInterval(item.intervalSeconds)}
                      size="small"
                      icon={<AccessTimeIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={item.mode} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {item.platforms.map((p) => (
                        <Chip key={p} label={p} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editId ? "Edit Scheduled Message" : "New Scheduled Message"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Messages"
              multiline
              rows={5}
              fullWidth
              value={form.messagesStr}
              onChange={(e) =>
                setForm((f) => ({ ...f, messagesStr: e.target.value }))
              }
              helperText="One message per line — the bot will cycle through these"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Interval (seconds)"
                type="number"
                fullWidth
                value={form.intervalSeconds}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    intervalSeconds: Math.max(30, Number(e.target.value)),
                  }))
                }
                helperText="Minimum 30 seconds"
                slotProps={{ htmlInput: { min: 30 } }}
              />
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select
                  value={form.mode}
                  label="Mode"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mode: e.target.value as "random" | "sequential",
                    }))
                  }
                >
                  <MenuItem value="sequential">Sequential</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Platforms
              </Typography>
              <FormGroup row>
                {PLATFORMS.map((p) => (
                  <FormControlLabel
                    key={p}
                    control={
                      <Checkbox
                        checked={form.platforms.includes(p)}
                        onChange={() => togglePlatform(p)}
                        size="small"
                      />
                    }
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                  />
                ))}
              </FormGroup>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isEnabled}
                  onChange={(_, v) => setForm((f) => ({ ...f, isEnabled: v }))}
                />
              }
              label="Enabled"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
