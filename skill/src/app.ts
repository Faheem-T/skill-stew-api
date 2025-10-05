import express from "express";
// import { errorHandler } from "";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./middlewares/httpLogger";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// app.use(errorHandler);

export { app };
