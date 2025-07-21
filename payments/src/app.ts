import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import subscriptionPlansRouter from "./presentation/routers/subscriptionPlansRouter";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(morgan("dev"));

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/api/v1/payments/subscriptions", subscriptionPlansRouter);

export { app };
