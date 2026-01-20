import { Client } from "@elastic/elasticsearch";
import { ENV } from "../../utils/dotenv";
import { logger } from "../../utils/logger";
import { MappingTypeMapping } from "@elastic/elasticsearch/lib/api/types";
import deepEqual from "fast-deep-equal";
import { mapESError } from "../mappers/ErrorMapper";

export const INDEXES: { name: string; mappings: MappingTypeMapping }[] = [
  {
    name: "users",
    mappings: {
      properties: {
        id: { type: "keyword" },
        name: { type: "text" },
        username: { type: "text" },
        isVerified: { type: "boolean" },
        formattedAddress: { type: "text" },
        location: { type: "geo_point" },
        languages: { type: "keyword" },
        offeredSkills: { type: "keyword" },
        wantedSkills: { type: "keyword" },
      },
    },
  },
  {
    name: "skills",
    mappings: {
      properties: {
        id: { type: "keyword" },
        name: { type: "text" },
        alternateNames: { type: "text" },
      },
    },
  },
] as const;

export const es = new Client({
  node: ENV.ES_URL,
});

async function ensureAlias(
  aliasName: string,
  mappings: MappingTypeMapping,
): Promise<string> {
  const aliasExists = await es.indices.existsAlias({ name: aliasName });

  if (!aliasExists) {
    // No alias: create first index version
    const initialIndex = `${aliasName}_v${Date.now()}`;

    await es.indices.create({ index: initialIndex, mappings });

    await es.indices.updateAliases({
      actions: [{ add: { index: initialIndex, alias: aliasName } }],
    });

    logger.info(`Alias created: ${aliasName} → ${initialIndex}`);
    return initialIndex;
  }

  // Alias exists → find the index behind it
  const aliasInfo = await es.indices.getAlias({ name: aliasName });
  const currentIndex = Object.keys(aliasInfo)[0];

  logger.info(`Alias found: ${aliasName} → ${currentIndex}`);
  return currentIndex;
}

export async function setupES() {
  try {
    await es.ping();
    logger.info("Connected to Elasticsearch");
  } catch (err) {
    logger.error("Failed to connect to Elasticsearch", err);
    throw mapESError(err);
  }

  for (const { name: aliasName, mappings } of INDEXES) {
    logger.info(`Setting up index: ${aliasName}`);

    const currentIndex = await ensureAlias(aliasName, mappings);

    // Fetch existing mapping
    const currentMappingResponse = await es.indices.getMapping({
      index: currentIndex,
    });

    const currentProperties =
      currentMappingResponse[currentIndex]?.mappings?.properties ?? {};

    const expectedProperties = mappings.properties ?? {};

    // Compare mapping
    const mappingChanged = !deepEqual(currentProperties, expectedProperties);

    if (!mappingChanged) {
      logger.info(`No mapping changes for "${aliasName}"`);
      continue;
    }

    logger.warn(`Mapping drift detected for "${aliasName}".`);
    logger.warn(`Reindexing will be performed.`);

    // Create new versioned index
    const newIndex = `${aliasName}_v${Date.now()}`;

    await es.indices.create({ index: newIndex, mappings });
    logger.info(`Created new index: ${newIndex}`);

    // Reindex data from old to new
    await es.reindex({
      wait_for_completion: true,
      source: { index: currentIndex },
      dest: { index: newIndex },
    });

    logger.info(`Reindexed data: ${currentIndex} → ${newIndex}`);

    // Switch alias to new index
    await es.indices.updateAliases({
      actions: [
        { remove: { index: currentIndex, alias: aliasName } },
        { add: { index: newIndex, alias: aliasName } },
      ],
    });

    logger.info(`Alias updated: ${aliasName} → ${newIndex}`);

    // Delete old index
    await es.indices.delete({ index: currentIndex });
    logger.info(`Deleted old index: ${currentIndex}`);

    logger.info(`Reindex complete for "${aliasName}"`);
  }
}
