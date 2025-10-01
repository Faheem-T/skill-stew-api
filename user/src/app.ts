import express from "express";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import authRouter from "./presentation/routers/AuthRouter";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./presentation/routers/UserRouter";
import cookieParser from "cookie-parser";
import { httpLogger } from "./presentation/middlewares/httpLogger";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export { app };
