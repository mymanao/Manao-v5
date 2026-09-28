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
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "@/hooks/useApi";
import type { Configuration, CustomReplies } from "@/types/api";

const emptyReply = (): CustomReplies => ({
  id: crypto.randomUUID(),
  keywordType: "includes",
  responseType: "random",
  keywords: [],
  responses: [],
  counterEnabled: false,
  keepCounter: false,
});

export function RepliesPage() {
  const [replies, setReplies] = useState<CustomReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<
    CustomReplies & { keywordsStr: string; responsesStr: string }
  >({
    ...emptyReply(),
    keywordsStr: "",
    responsesStr: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const config = await api.get<Configuration>("/api/config");
      setReplies(config.customReplies);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveAll = async (next: CustomReplies[]) => {
    await api.post("/api/config", { customReplies: next });
    setReplies(next);
  };

  const openCreate = () => {
    setEditIdx(null);
    setForm({ ...emptyReply(), keywordsStr: "", responsesStr: "" });
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    const r = replies[idx]!;
    setEditIdx(idx);
    setForm({
      ...r,
      keywordsStr: r.keywords.join(", "),
      responsesStr: r.responses.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const reply: CustomReplies = {
        keywordType: form.keywordType,
        responseType: form.responseType,
        id: form.id,
        keywords: form.keywordsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        responses: form.responsesStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        counterEnabled: form.counterEnabled,
        keepCounter: form.keepCounter,
      };
      const next =
        editIdx !== null
          ? replies.map((r, i) => (i === editIdx ? reply : r))
          : [...replies, reply];
      await saveAll(next);
      setDialogOpen(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idx: number) => {
    if (!confirm("Delete this reply?")) return;
    await saveAll(replies.filter((_, i) => i !== idx));
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
            Custom Replies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Auto-reply when chat messages match a keyword.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Add Reply
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        {replies.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No custom replies yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Match Type</TableCell>
                  <TableCell>Response Type</TableCell>
                  <TableCell>Keywords</TableCell>
                  <TableCell>Responses</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {replies.map((r, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Chip
                        label={r.keywordType}
                        size="small"
                        color={
                          r.keywordType === "exact" ? "secondary" : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.responseType}
                        size="small"
                        color={r.responseType === "random" ? "info" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {r.keywords.map((k) => (
                          <Chip
                            key={k}
                            label={k}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 240,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.responses.join(" | ")}
                      </Typography>
                      {r.counterEnabled && (
                        <Chip
                          label={r.keepCounter ? "Counter (kept)" : "Counter"}
                          size="small"
                          color="secondary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(idx)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(idx)}
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
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editIdx !== null ? "Edit Reply" : "New Reply"}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Keyword Match Type</InputLabel>
              <Select
                value={form.keywordType}
                label="Keyword Match Type"
                onChange={(e) =>
                  setForm({
                    ...form,
                    keywordType: e.target.value as "includes" | "exact",
                  })
                }
              >
                <MenuItem value="includes">
                  Includes (contains keyword)
                </MenuItem>
                <MenuItem value="exact">Exact (full message match)</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Response Type</InputLabel>
              <Select
                value={form.responseType}
                label="Response Type"
                onChange={(e) =>
                  setForm({
                    ...form,
                    responseType: e.target.value as "random" | "sequential",
                  })
                }
              >
                <MenuItem value="random">Random</MenuItem>
                <MenuItem value="sequential">Sequential</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              fullWidth
              label="Keywords (comma separated)"
              value={form.keywordsStr}
              onChange={(e) =>
                setForm({ ...form, keywordsStr: e.target.value })
              }
              placeholder="hello, hi, hey"
            />
            <TextField
              size="small"
              fullWidth
              multiline
              rows={3}
              label="Responses (comma separated)"
              value={form.responsesStr}
              onChange={(e) =>
                setForm({ ...form, responsesStr: e.target.value })
              }
              placeholder="Hello [user]! You are [username]. [counter] time(s)!"
            />
            <Typography variant="caption" color="text.secondary">
              Templates support <code>[user]</code> to tag the requester,{" "}
              <code>[username]</code> for their username, and{" "}
              <code>[counter]</code> when counters are enabled.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.counterEnabled ?? false}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      counterEnabled: e.target.checked,
                      keepCounter: e.target.checked
                        ? (form.keepCounter ?? false)
                        : false,
                    })
                  }
                />
              }
              label="Add a counter (use [counter] to place it, or append it automatically)"
            />
            {form.counterEnabled && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.keepCounter ?? false}
                    onChange={(e) =>
                      setForm({ ...form, keepCounter: e.target.checked })
                    }
                  />
                }
                label="Keep counter between bot restarts"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={16} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
