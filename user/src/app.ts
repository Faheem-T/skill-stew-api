import express from "express";
import { errorHandler } from "./3-presentation/middlewares/errorHandler";
import userRouter from "./3-presentation/routers/UserRouter";

const app = express();

app.use(express.urlencoded());
app.use(express.json());

app.use("/api/users", userRouter);

app.use(errorHandler);

export { app };
