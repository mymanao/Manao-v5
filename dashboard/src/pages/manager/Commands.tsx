import { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, Chip, Stack, TextField, InputAdornment,
  Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
  CircularProgress, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "@/hooks/useApi";
import type { CustomCommand, Configuration, Permission } from "@/types/api";

// API returns already-flattened commands (resolved to current language)
interface FlatCommand {
  name: string;
  description: string;
  aliases: string[];
  arguments: { name: string; description: string; required?: boolean }[];
  permission: Permission;
  platforms: string[];
}

const PERMISSIONS: Permission[] = ["everyone", "follower", "subscriber", "vip", "moderator", "broadcaster"];

const permColor: Record<Permission, "default" | "success" | "info" | "warning" | "error" | "secondary"> = {
  everyone: "default",
  follower: "info",
  subscriber: "success",
  vip: "secondary",
  moderator: "warning",
  broadcaster: "error",
};

interface CustomCommandForm {
  id?: string;
  name: string;
  description: string;
  aliases: string;
  permission: Permission;
  code: string;
}

const emptyForm = (): CustomCommandForm => ({
  name: "", description: "", aliases: "", permission: "everyone", code: 'await ctx.reply("Hello world!");',
});

export function CommandsPage() {
  const [builtIn, setBuiltIn] = useState<FlatCommand[]>([]);
  const [custom, setCustom] = useState<CustomCommand[]>([]);
  const [disabled, setDisabled] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CustomCommandForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [cmds, cfg, cust] = await Promise.all([
        api.get<FlatCommand[]>("/api/commands"),
        api.get<Configuration>("/api/config"),
        api.get<CustomCommand[]>("/api/custom-commands"),
      ]);
      setBuiltIn(cmds);
      setDisabled(cfg.disabledCommands);
      setCustom(cust);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleCommand = async (name: string, enabled: boolean) => {
    const next = enabled
      ? disabled.filter((d) => d !== name)
      : [...disabled, name];
    setDisabled(next);
    await api.post("/api/config", { disabledCommands: next });
  };

  const openCreate = () => { setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (c: CustomCommand) => {
    setForm({ id: c.id, name: c.name, description: c.description, aliases: c.aliases, permission: c.permission, code: c.code });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (form.id) {
        await api.put(`/api/custom-commands/${form.id}`, form);
      } else {
        await api.post("/api/custom-commands", form);
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this custom command?")) return;
    await api.delete(`/api/custom-commands/${id}`);
    await load();
  };

  const filtered = builtIn.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Commands</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enable or disable built-in commands. Add custom commands with TypeScript code.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Typography variant="overline" color="text.secondary" fontWeight={700}>Built-in ({filtered.length})</Typography>
      <Paper sx={{ mt: 1, mb: 4 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <TextField
            size="small"
            placeholder="Search commands…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: 280 }}
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Enabled</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Aliases</TableCell>
                <TableCell>Permission</TableCell>
                <TableCell>Platforms</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((cmd) => {
                const enabled = !disabled.includes(cmd.name);
                return (
                  <TableRow key={cmd.name} hover>
                    <TableCell>
                      <Switch size="small" checked={enabled} onChange={() => toggleCommand(cmd.name, enabled)} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{cmd.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{cmd.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(cmd.aliases ?? []).map((a) => (
                          <Chip key={a} label={a} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {cmd.permission && (
                        <Chip label={cmd.permission} size="small" color={permColor[cmd.permission]} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(cmd.platforms.length > 0 ? cmd.platforms : ["twitch", "kick", "discord"]).map((p) => (
                          <Chip key={p} label={p} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700}>Custom ({custom.length})</Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Command
        </Button>
      </Stack>
      <Paper>
        {custom.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No custom commands yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permission</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {custom.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{c.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{c.description}</Typography></TableCell>
                    <TableCell><Chip label={c.permission} size="small" color={permColor[c.permission]} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? "Edit Custom Command" : "New Custom Command"}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Name" size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Description" size="small" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Aliases (comma separated)" size="small" value={form.aliases} onChange={(e) => setForm({ ...form, aliases: e.target.value })} />
            <FormControl size="small">
              <InputLabel>Permission</InputLabel>
              <Select value={form.permission} label="Permission" onChange={(e) => setForm({ ...form, permission: e.target.value as Permission })}>
                {PERMISSIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Code"
              multiline
              rows={5}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              InputProps={{ sx: { fontFamily: "monospace", fontSize: "0.8rem" } }}
            />
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