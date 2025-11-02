import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./middlewares/httpLogger";
import { skillRouter } from "./routes/skillRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { skillProfileRouter } from "./routes/skillProfileRoutes";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// Routes
app.use("/api/v1/skills/profile", skillProfileRouter);
app.use("/api/v1/skills", skillRouter);

app.use(errorHandler);

export { app };
