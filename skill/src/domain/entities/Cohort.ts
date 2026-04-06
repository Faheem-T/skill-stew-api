import { v7 as uuidv7 } from "uuid";

export class Cohort {
  readonly id: string;
  readonly workshopId: string;
  readonly expertId: string;
  readonly workshopTitle: string;
  readonly workshopBannerImageKey: string | null;
  readonly workshopTimezone: string;
  readonly spotPriceAmount: number;
  readonly currency: string;
  readonly startDate: string;
  readonly maxStudents: number;
  readonly firstSessionStartsAt: Date;
  readonly lastSessionStartsAt: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor({
    id,
    workshopId,
    expertId,
    workshopTitle,
    workshopBannerImageKey,
    workshopTimezone,
    spotPriceAmount,
    currency,
    startDate,
    maxStudents,
    firstSessionStartsAt,
    lastSessionStartsAt,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    workshopId: string;
    expertId: string;
    workshopTitle: string;
    workshopBannerImageKey?: string | null;
    workshopTimezone: string;
    spotPriceAmount: number;
    currency: string;
    startDate: string;
    maxStudents: number;
    firstSessionStartsAt: Date;
    lastSessionStartsAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id ?? uuidv7();
    this.workshopId = workshopId;
    this.expertId = expertId;
    this.workshopTitle = workshopTitle;
    this.workshopBannerImageKey = workshopBannerImageKey ?? null;
    this.workshopTimezone = workshopTimezone;
    this.spotPriceAmount = spotPriceAmount;
    this.currency = currency;
    this.startDate = startDate;
    this.maxStudents = maxStudents;
    this.firstSessionStartsAt = firstSessionStartsAt;
    this.lastSessionStartsAt = lastSessionStartsAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateMutableFields({
    spotPriceAmount,
    currency,
    startDate,
    maxStudents,
    firstSessionStartsAt,
    lastSessionStartsAt,
  }: {
    spotPriceAmount?: number;
    currency?: string;
    startDate?: string;
    maxStudents?: number;
    firstSessionStartsAt?: Date;
    lastSessionStartsAt?: Date;
  }): Cohort {
    return new Cohort({
      id: this.id,
      workshopId: this.workshopId,
      expertId: this.expertId,
      workshopTitle: this.workshopTitle,
      workshopBannerImageKey: this.workshopBannerImageKey,
      workshopTimezone: this.workshopTimezone,
      spotPriceAmount: spotPriceAmount ?? this.spotPriceAmount,
      currency: currency ?? this.currency,
      startDate: startDate ?? this.startDate,
      maxStudents: maxStudents ?? this.maxStudents,
      firstSessionStartsAt: firstSessionStartsAt ?? this.firstSessionStartsAt,
      lastSessionStartsAt: lastSessionStartsAt ?? this.lastSessionStartsAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
