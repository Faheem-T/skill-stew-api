import Express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { logger } from "./utils/logger";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import { ENV } from "./utils/dotenv";

const app = Express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], credentials: true },
  path: "/socket.io",
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  const { id, email, role } = socket.data.user;
  socket.join(`user:${id}`);
  logger.info(`User connected: ${id} (${role})`);

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${id}`);
    // No need to manually leave rooms — socket.io does it automatically on disconnect
  });
});

server.listen(ENV.PORT, () => {
  logger.info(`Listening on port ${ENV.PORT}`);
});
