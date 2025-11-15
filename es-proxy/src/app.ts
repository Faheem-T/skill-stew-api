import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./presentation/middlewares/httpLogger";
import { skillRouter } from "./presentation/routers/SkillRouter";
import { errorHandler } from "./presentation/middlewares/errorHandler";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ credentials: true }));

// Routes
app.use("/api/v1/search/skills", skillRouter);

app.use(errorHandler);

export { app };
