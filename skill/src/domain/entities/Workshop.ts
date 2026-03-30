import { v7 as uuidv7 } from "uuid";
import type { WorkshopStatus } from "./WorkshopStatus.enum";

export interface WorkshopSession {
  id: string;
  weekNumber: number;
  dayOfWeek: number;
  sessionOrder: number;
  title?: string | null;
  description?: string | null;
  startTime: string;
}

export class Workshop {
  readonly id: string;
  readonly expertId: string;
  readonly title: string;
  readonly description: string | null;
  readonly targetAudience: string | null;
  readonly bannerImageKey: string | null;
  readonly maxCohortSize: number;
  readonly status: WorkshopStatus;
  readonly sessions: WorkshopSession[];
  readonly timezone: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor({
    id,
    expertId,
    title,
    description,
    targetAudience,
    bannerImageKey,
    maxCohortSize,
    status = "draft",
    sessions = [],
    timezone = null,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    expertId: string;
    title: string;
    description?: string | null;
    targetAudience?: string | null;
    bannerImageKey?: string | null;
    maxCohortSize: number;
    status?: WorkshopStatus;
    sessions?: WorkshopSession[];
    timezone?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id ?? uuidv7();
    this.expertId = expertId;
    this.title = title.trim();
    this.description = description ?? null;
    this.targetAudience = targetAudience ?? null;
    this.bannerImageKey = bannerImageKey ?? null;
    this.maxCohortSize = maxCohortSize;
    this.status = status;
    this.sessions = sessions;
    this.timezone = timezone;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateBasics({
    title,
    description,
    targetAudience,
    bannerImageKey,
    maxCohortSize,
  }: {
    title?: string;
    description?: string | null;
    targetAudience?: string | null;
    bannerImageKey?: string | null;
    maxCohortSize?: number;
  }): Workshop {
    return new Workshop({
      id: this.id,
      expertId: this.expertId,
      title: title ?? this.title,
      description: description === undefined ? this.description : description,
      targetAudience:
        targetAudience === undefined ? this.targetAudience : targetAudience,
      bannerImageKey:
        bannerImageKey === undefined ? this.bannerImageKey : bannerImageKey,
      maxCohortSize: maxCohortSize ?? this.maxCohortSize,
      status: this.status,
      sessions: this.sessions,
      timezone: this.timezone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
