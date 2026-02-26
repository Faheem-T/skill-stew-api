import "reflect-metadata";
import express from "express";
import notificationRouter from "./routers/NotificationRouter";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

app.use("/api/v1/notifications", notificationRouter);

app.use(errorHandler);

export { app };
