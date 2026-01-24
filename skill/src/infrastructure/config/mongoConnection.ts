import mongoose from "mongoose";
import { ENV } from "../../utils/dotenv";
import { logger } from "../../utils/logger";

export const connectDB = async () => {
  const connection = await mongoose.connect(ENV.DATABASE_URL);
  logger.info(
    `Connected to mongodb: ${connection.connection.host}:${connection.connection.port}`,
  );
};
