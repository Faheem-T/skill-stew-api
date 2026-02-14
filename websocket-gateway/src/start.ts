import Express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = Express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use((req, res, next) => {
  console.log("Got a request!");
  console.log("Request path", req.path);
  next();
});
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], credentials: true },
  path: "/socket.io",
});

io.on("connection", (socket) => {
  console.log("A user connected!");
  socket.on("ping", (message) => {
    console.log(`Received message ${JSON.stringify(message)}`);
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
