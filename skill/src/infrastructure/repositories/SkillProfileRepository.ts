import {
  skillProficiencies,
  SkillProfile,
} from "../../domain/entities/SkillProfile";
import type {
  HydratedSkillProfile,
  ISkillProfileRepository,
} from "../../domain/repositories/ISkillProfileRepository";
import {
  type SkillProfileAttr,
  type SkillProfileDoc,
  SkillProfileModel,
} from "../models/skillProfileModel";
import { mapMongooseError } from "../mappers/ErrorMapper";
import { NotFoundError } from "../../domain/errors";

export class SkillProfileRepository implements ISkillProfileRepository {
  save = async (profile: SkillProfile): Promise<Required<SkillProfile>> => {
    try {
      const attrs = this.toPersistence(profile);
      const newProfile = SkillProfileModel.build(attrs);
      const savedProfile = await SkillProfileModel.findByIdAndUpdate(
        attrs._id,
        newProfile,
        { upsert: true, new: true },
      );
      return this.toDomain(savedProfile);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  getById = async (id: string): Promise<SkillProfile> => {
    try {
      const doc = await SkillProfileModel.findById(id);
      if (!doc) throw new NotFoundError("Skill profile");
      return this.toDomain(doc);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  getHydratedByUserId = async (id: string): Promise<HydratedSkillProfile> => {
    try {
      const result = await SkillProfileModel.aggregate<{
        offered: {
          skill: { id: string; name: string };
          proficiency: typeof skillProficiencies;
          hoursTaught: number;
        }[];
        wanted: {
          skill: { id: string; name: string };
          hoursLearned: number;
        }[];
      }>([
        {
          $match: {
            _id: id,
          },
        },

        {
          $lookup: {
            from: "skills",
            let: {
              offeredSkillIds: "$offered.skillId",
              wantedSkillIds: "$wanted.skillId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      "$_id",
                      {
                        $concatArrays: [
                          "$$offeredSkillIds",
                          "$$wantedSkillIds",
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
            as: "skills",
          },
        },

        {
          $addFields: {
            offered: {
              $map: {
                input: "$offered",
                as: "o",
                in: {
                  proficiency: "$$o.proficiency",
                  hoursTaught: "$$o.hoursTaught",
                  skill: {
                    $let: {
                      vars: {
                        skill: {
                          $first: {
                            $filter: {
                              input: "$skills",
                              as: "s",
                              cond: { $eq: ["$$s._id", "$$o.skillId"] },
                            },
                          },
                        },
                      },
                      in: {
                        id: "$$skill._id",
                        name: "$$skill.name",
                      },
                    },
                  },
                },
              },
            },

            wanted: {
              $map: {
                input: "$wanted",
                as: "w",
                in: {
                  hoursLearned: "$$w.hoursLearned",
                  skill: {
                    $let: {
                      vars: {
                        skill: {
                          $first: {
                            $filter: {
                              input: "$skills",
                              as: "s",
                              cond: { $eq: ["$$s._id", "$$w.skillId"] },
                            },
                          },
                        },
                      },
                      in: {
                        id: "$$skill._id",
                        name: "$$skill.name",
                      },
                    },
                  },
                },
              },
            },
          },
        },

        {
          $project: {
            skills: 0,
            __v: 0,
          },
        },
      ]);

      if (!result[0]) {
        throw new NotFoundError("profile");
      }
      return result[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw mapMongooseError(error);
    }
  };

  private toPersistence = (profile: SkillProfile): SkillProfileAttr => {
    const { id, offered, wanted } = profile;

    return {
      _id: id,
      offered,
      wanted,
    };
  };

  private toDomain = (doc: SkillProfileDoc): Required<SkillProfile> => {
    const { _id, offered, wanted, createdAt, updatedAt } = doc;
    const profile = new SkillProfile(_id, offered, wanted);
    profile.createdAt = createdAt;
    profile.updatedAt = updatedAt;
    return profile as Required<SkillProfile>;
  };
}
