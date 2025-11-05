import { Client } from "@elastic/elasticsearch";
import { ENV } from "../../utils/dotenv";
import { logger } from "../../utils/logger";

export const INDEXES = ["users", "skills"] as const;

export const es = new Client({ node: ENV.ES_URL });

export async function setupES() {
  for (const index of INDEXES) {
    try {
      await es.indices.create({ index });
    } catch (err) {
      const e = err as any;
      if (e.meta?.body?.error?.type === "resource_already_exists_exception") {
        logger.info("Index not created as it already exists");
      } else {
        logger.error(e);
        throw e;
      }
    }
  }
}
