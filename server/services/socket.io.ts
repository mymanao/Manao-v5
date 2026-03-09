import { logger } from "@/helpers/logger";
import { SOCKET_PORT } from "@/config";
import { Server, type Socket } from "socket.io";
import type {SongRequestData} from "@/core/types.ts";

export const songQueue: SongRequestData[] = [];

function handleConnection(socket: Socket): void {
  logger.info(`[Socket] ${socket.id} connected`);

  socket.on("disconnect", () => {
    logger.info(`[Socket] ${socket.id} disconnected`);
  });

  socket.on("songEnded", () => {
    songQueue.shift();
    socket.emit("songPlayNext", songQueue);
  });

  socket.on("songQueueFetch", () => {
    socket.emit("songQueue", songQueue);
  });

  socket.on("play-sound", (data) => {
    socket.broadcast.emit("play-sound", data);
  });

  socket.on("currentSongProgress", (data) => {
    socket.broadcast.emit("currentSongProgress", data);
  });
}

export const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
}).listen(SOCKET_PORT);

io.on("connection", handleConnection);

logger.info(`[Socket] Listening on port ${SOCKET_PORT}`);