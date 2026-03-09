import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { httpLogger } from "./presentation/middlewares/httpLogger";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// Error handler
app.use(errorHandler);

export { app };
