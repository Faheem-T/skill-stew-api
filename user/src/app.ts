import express from "express";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./presentation/middlewares/httpLogger";
import authRouter from "./presentation/routers/AuthRouter";
import userRouter from "./presentation/routers/UserRouter";
import meRouter from "./presentation/routers/MeRouter";
import connectionRouter from "./presentation/routers/ConnectionRouter";
import expertRouter from "./presentation/routers/ExpertRouter";
import { HttpStatus } from "./constants/HttpStatus";

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
app.use("/api/v1/experts", expertRouter);

// health check
app.get("/health", (_req, res) => {
  res.status(HttpStatus.OK).json({ success: true, message: "Up and running!" });
});

let ready = false;

function markReady() {
  ready = true;
}

// readiness probe
app.get("/readiness", (_req, res) => {
  if (ready) {
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: "Ready for traffic!" });
  } else {
    res
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .json({ success: false, message: "Not ready yet!" });
  }
});

app.use(errorHandler);

export { app, markReady };
