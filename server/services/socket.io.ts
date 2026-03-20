import { logger } from "@/helpers/logger";
import { Server, type Socket } from "socket.io";
import type {SongRequestData} from "@/core/types.ts";
import type { AddressInfo } from "net";
import { internalIpV4Sync } from "internal-ip";

export const songQueue: SongRequestData[] = [];

function handleConnection(socket: Socket): void {
  logger.info(`[Socket] ${socket.id} connected`);

  socket.emit("songQueue", songQueue);

  socket.on("disconnect", () => {
    logger.info(`[Socket] ${socket.id} disconnected`);
  });

  socket.on("songEnded", () => {
    songQueue.shift();
    io.emit("songPlayNext", songQueue);
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
}).listen(0);

io.on("connection", handleConnection);

const SOCKET_ADDR_INFO = io.httpServer.address() as AddressInfo;
export const SOCKET_PORT = SOCKET_ADDR_INFO.port;
export const SOCKET_URL = `ws://${internalIpV4Sync()}:${SOCKET_PORT}`;

logger.info(`[Socket] Socket.IO server running on ${SOCKET_URL}`);
