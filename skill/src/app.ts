import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./presentation/middlewares/httpLogger";
import { skillProfileRouter } from "./presentation/routes/skillProfileRoutes";
import { skillRouter } from "./presentation/routes/skillRoutes";
import { workshopRouter } from "./presentation/routes/workshopRoutes";
import { cohortRouter } from "./presentation/routes/cohortRoutes";
import { publicWorkshopRouter } from "./presentation/routes/publicWorkshopRoutes";
import { publicCohortRouter } from "./presentation/routes/publicCohortRoutes";
import { errorHandler } from "./presentation/middlewares/errorHandler";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// logger
app.use(httpLogger);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// Routes
app.use("/api/v1/skills/profile", skillProfileRouter);
app.use("/api/v1/skills", skillRouter);
app.use("/api/v1/workshops", workshopRouter);
app.use("/api/v1/cohorts", cohortRouter);
app.use("/api/v1/public/workshops", publicWorkshopRouter);
app.use("/api/v1/public/cohorts", publicCohortRouter);

app.use(errorHandler);

export { app };
