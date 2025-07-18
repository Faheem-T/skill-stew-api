import express from "express";
import { errorHandler } from "./3-presentation/middlewares/errorHandler";
import authRouter from "./3-presentation/routers/AuthRouter";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./3-presentation/routers/UserRouter";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(morgan("dev"));

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export { app };
