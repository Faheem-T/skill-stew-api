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
  for (const { name, mappings } of INDEXES) {
    try {
      await es.indices.create({ index: name, mappings });
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
