import express from "express";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./presentation/middlewares/httpLogger";
import authRouter from "./presentation/routers/AuthRouter";
import userRouter from "./presentation/routers/UserRouter";
import meRouter from "./presentation/routers/MeRouter";
import connectionRouter from "./presentation/routers/ConnectionRouter";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/connections", connectionRouter);

app.use(errorHandler);

export { app };
