import { Client } from "@elastic/elasticsearch";
import { ENV } from "../../utils/dotenv";
import { logger } from "../../utils/logger";
import { MappingTypeMapping } from "@elastic/elasticsearch/lib/api/types";

export const INDEXES: { name: string; mappings: MappingTypeMapping }[] = [
  {
    name: "users",
    mappings: {
      properties: {
        id: { type: "keyword" },
        name: { type: "text" },
        username: { type: "text" },
        isVerified: { type: "boolean" },
        location: { type: "geo_point" },
        languages: { type: "keyword" },
        offeredSkills: { type: "keyword" },
        wantedSkills: { type: "keyword" },
      },
    },
  },
  // { name: "skills", mappings: {} },
] as const;

export const es = new Client({ node: ENV.ES_URL });

export async function setupES() {
  try {
    await es.ping();
    logger.info("✅ Connected to Elasticsearch");
  } catch (err) {
    logger.error("❌ Failed to connect to Elasticsearch", err);
    throw err;
  }

  for (const { name, mappings } of INDEXES) {
    logger.info(`Setting up index: ${name}`);
    const exists = await es.indices.exists({ index: name });

    if (!exists) {
      await es.indices.create({ index: name, mappings });
      logger.info(`✅ Created index: ${name}`);
    } else {
      logger.info(`ℹ️ Index already exists: ${name}`);
    }
  }
}
