import express from "express";
import { errorHandler } from "./3-presentation/middlewares/errorHandler";
import userRouter from "./3-presentation/routers/UserRouter";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(express.urlencoded());
app.use(express.json());

// logger
app.use(morgan("dev"));

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export { app };
