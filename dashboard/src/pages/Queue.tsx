import { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, Stack, LinearProgress, Alert,
  CircularProgress, IconButton, Tooltip,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import DeleteIcon from "@mui/icons-material/Delete";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import { useSocketEvent } from "@/hooks/useSocket";
import { api } from "@/hooks/useApi";
import type { SongRequestData } from "@/types/api";

export function QueuePage() {
  const [queue, setQueue] = useState<SongRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await api.get<SongRequestData[]>("/api/queue");
      setQueue(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useSocketEvent<SongRequestData[]>("songQueue", (data) => setQueue(data));
  useSocketEvent<SongRequestData[]>("songPlayNext", (data) => setQueue(data));
  useSocketEvent<{ percent: number }>("currentSongProgress", (data) => setProgress(data.percent ?? 0));

  const nowPlaying = queue[0];
  const upcoming = queue.slice(1);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Song Queue</Typography>

      {/* Now playing */}
      {nowPlaying ? (
        <Paper
          sx={{
            p: 2.5, mb: 3,
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={nowPlaying.thumbnail}
              variant="rounded"
              sx={{ width: 64, height: 64 }}
            >
              <MusicNoteIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Chip icon={<HeadphonesIcon />} label="Now Playing" size="small" color="primary" />
              </Stack>
              <Typography variant="subtitle1" fontWeight={700} noWrap>{nowPlaying.title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{nowPlaying.author}</Typography>
              <Typography variant="caption" color="text.secondary">Requested by {nowPlaying.requestedBy}</Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, borderRadius: 1, height: 3 }}
              />
            </Box>
          </Stack>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>No songs in queue. Request a song with <code>!sr</code>.</Alert>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            Up Next ({upcoming.length})
          </Typography>
          <Paper sx={{ mt: 1 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Song</TableCell>
                    <TableCell>Requested By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcoming.map((song, idx) => (
                    <TableRow key={song.id} hover>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>{idx + 2}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={song.thumbnail} variant="rounded" sx={{ width: 40, height: 40 }}>
                            <MusicNoteIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>{song.title}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{song.author}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{song.requestedBy}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
