import mongoose from "mongoose";
import { ENV } from "../utils/dotenv";
import { readFile } from "fs/promises";
import { logger } from "../utils/logger";
import { Skill } from "../entities/Skill";
import { SkillModel } from "../models/skillModel";
import { CreateEvent, Producer } from "@skillstew/common";

async function seedData() {
  try {
    await mongoose.connect(ENV.DATABASE_URL);

    const count = await SkillModel.countDocuments();
    if (count > 0) return;
  } catch (err) {
    logger.error("Couldn't connect to mongodb", err);
    throw err;
  }

  const rawData = await readFile("/app/src/config/skillSeedData.json", {
    encoding: "utf8",
  });
  const data: Skill[] = JSON.parse(rawData);
  await SkillModel.insertMany(data);
  const messageProducer = new Producer();
  data.forEach((skill) => {
    messageProducer.publish(
      CreateEvent("skill.created", { ...skill }, "skill"),
    );
  });
  logger.info("Seeding complete.");
}

seedData();
