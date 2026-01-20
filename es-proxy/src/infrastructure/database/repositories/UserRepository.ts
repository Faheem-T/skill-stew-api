import { Client } from "@elastic/elasticsearch";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BaseRepository } from "./BaseRepository";
import { UserMapper } from "../../mappers/UserMapper";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { InvalidSearchCriteriaError } from "../../../domain/errors/InvalidSearchCriteriaError";
import { mapESError } from "../../mappers/ErrorMapper";

export interface UserDoc {
  id: string;

  name?: string;
  username?: string;
  location?: { lat: number; lon: number };
  formattedAddress?: string;
  languages?: string[];
  isVerified?: boolean;

  offeredSkills?: string[];
  wantedSkills?: string[];
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
          terms: {
            offeredSkills,
            boost: 2.0,
          },
        });
      }

      if (wantedSkills && wantedSkills.length > 0) {
        shouldClauses.push({
          terms: {
            wantedSkills,
            boost: 2.0,
          },
        });
      }

      let query: QueryDslQueryContainer;

      if (shouldClauses.length === 0 && !location) {
        throw new InvalidSearchCriteriaError("At least one search criteria must be provided");
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
              boost: 1.8,
            },
          },
        };

        if (shouldClauses.length > 0) {
          (query as any).bool.functions = [geoFunction];
          (query as any).bool.boost_mode = "sum";
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

      const test = await this._es.search<UserDoc>({
        index: this._indexName,
        sort: ["_score"],
      });

      console.log(test.hits.hits);

      const docs = await this._es.search<UserDoc>({
        index: this._indexName,
        query,
        size,
        sort: ["_score"],
      });

      console.log(docs);

      return docs.hits.hits
        .map((hit) => {
          if (!hit._source) return;
          return this.mapper.toDomain(hit._source);
        })
        .filter((entity) => entity !== undefined);
    } catch (error) {
      // If it's our domain error, rethrow it
      if (error instanceof InvalidSearchCriteriaError) {
        throw error;
      }
      // Otherwise map as Elasticsearch error
      throw mapESError(error);
    }
  };
}
