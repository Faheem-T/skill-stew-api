import { Client } from "@elastic/elasticsearch";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BaseRepository } from "./BaseRepository";
import { UserMapper } from "../../mappers/UserMapper";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { ValidationError } from "../../../application/errors/ValidationError";
import { mapESError } from "../../mappers/ErrorMapper";
import { inspect } from "node:util";

export interface UserDoc {
  id: string;

  name?: string;
  username?: string;
  location?: { lat: number; lon: number };
  formattedAddress?: string;
  languages?: string[];
  isVerified?: boolean;
  avatarKey?: string;

  offeredSkills?: { skillId: string; skillName: string }[];
  wantedSkills?: { skillId: string; skillName: string }[];
}

export class UserRepository
  extends BaseRepository<User, UserDoc>
  implements IUserRepository
{
  constructor(es: Client) {
    super("users", es);
  }

  protected mapper = new UserMapper();

  protected getEntityName(): string {
    return "User";
  }

  findRecommendedUsers = async ({
    languages,
    location,
    offeredSkills,
    wantedSkills,
    radius = 10,
    minShouldMatch = 1,
    size = 20,
  }: {
    languages?: string[];
    location?: { lat: number; lon: number };
    offeredSkills?: string[];
    wantedSkills?: string[];
    radius?: number;
    minShouldMatch?: number | string;
    size?: number;
  }): Promise<User[]> => {
    try {
      const shouldClauses: QueryDslQueryContainer[] = [];

      if (languages && languages.length > 0) {
        shouldClauses.push({
          terms: {
            languages,
            boost: 1.5,
          },
        });
      }

      if (offeredSkills && offeredSkills.length > 0) {
        shouldClauses.push({
          nested: {
            path: "offeredSkills",
            query: {
              terms: {
                "offeredSkills.skillId": offeredSkills,
              },
            },
            score_mode: "sum",
            boost: 2.0,
          },
        });
      }

      if (wantedSkills && wantedSkills.length > 0) {
        shouldClauses.push({
          nested: {
            path: "wantedSkills",
            query: {
              terms: {
                "wantedSkills.skillId": wantedSkills,
              },
            },
            score_mode: "sum",
            boost: 2.0,
          },
        });
      }

      let query: QueryDslQueryContainer;

      if (shouldClauses.length === 0 && !location) {
        throw new ValidationError([
          {
            message: "At least one search criteria must be provided",
            field: "searchCriteria",
          },
        ]);
      }

      if (shouldClauses.length > 0) {
        query = {
          bool: {
            should: shouldClauses,
            minimum_should_match: minShouldMatch,
          },
        };
      } else {
        query = { match_all: {} };
      }
      if (location) {
        const geoFunction = {
          gauss: {
            location: {
              origin: {
                lat: location.lat,
                lon: location.lon,
              },
              offset: `${radius / 2}km`,
              scale: `${radius}km`,
              decay: 0.5,
            },
          },
        };

        if (shouldClauses.length > 0) {
          // Wrap the bool query inside function_score
          query = {
            function_score: {
              query: query, // existing bool query
              functions: [geoFunction],
              boost_mode: "sum",
            },
          };
        } else {
          query = {
            function_score: {
              query: { match_all: {} },
              functions: [geoFunction],
              boost_mode: "sum",
            },
          };
        }
      }

      const docs = await this._es.search<UserDoc>({
        index: this._indexName,
        query,
        size,
        sort: ["_score"],
      });

      return docs.hits.hits
        .map((hit) => {
          if (!hit._source) return;
          return this.mapper.toDomain(hit._source);
        })
        .filter((entity) => entity !== undefined);
    } catch (error) {
      // If it's our ValidationError, rethrow it
      if (error instanceof ValidationError) {
        throw error;
      }
      // Otherwise map as Elasticsearch error
      throw mapESError(error);
    }
  };
}
