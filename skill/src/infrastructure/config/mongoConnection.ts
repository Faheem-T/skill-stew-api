import mongoose from "mongoose";
import { ENV } from "../../utils/dotenv";
import { logger } from "../../utils/logger";
import { mapMongooseError } from "../mappers/ErrorMapper";

const RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 3000;

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const connectDB = async () => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const connection = await mongoose.connect(ENV.DATABASE_URL);
      await mongoose.connection.db?.admin().command({ ping: 1 });
      logger.info(
        `Pinged deployment. Successfully connected to mongodb: ${connection.connection.host}:${connection.connection.port}`,
      );
      return;
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_ATTEMPTS) {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        logger.warn(
          `MongoDB connection attempt ${attempt}/${RETRY_ATTEMPTS} failed. Retrying in ${backoffMs}ms...`,
        );
        await delay(backoffMs);
      } else {
        logger.error(
          `MongoDB connection failed after ${RETRY_ATTEMPTS} attempts.`,
        );
      }
    }
  }

  throw mapMongooseError(lastError);
};
