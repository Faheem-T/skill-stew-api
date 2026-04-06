import type { WorkshopSession } from "../domain/entities/Workshop";
import type { CohortStatus } from "../domain/entities/CohortStatus.enum";
import { ValidationError } from "../application/errors/ValidationError";

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

type DateParts = {
  year: number;
  month: number;
  day: number;
};

export interface DerivedCohortSession extends WorkshopSession {
  date: string;
  startsAt: Date;
}

const parseDateOnly = (value: string): DateParts => {
  if (!DATE_ONLY_REGEX.test(value)) {
    throw new ValidationError([
      { message: "Start date must be in YYYY-MM-DD format.", field: "startDate" },
    ]);
  }

  const parts = value.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (year === undefined || month === undefined || day === undefined) {
    throw new ValidationError([
      { message: "Start date must be in YYYY-MM-DD format.", field: "startDate" },
    ]);
  }

  return { year, month, day };
};

const toUtcMidnight = (value: string): Date => {
  const { year, month, day } = parseDateOnly(value);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateOnly = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const parseOffsetMinutes = (offset: string): number => {
  const match = offset.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    throw new Error(`Unsupported timezone offset format: ${offset}`);
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes);
};

const getOffsetMinutes = (timeZone: string, instant: Date): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);

  const offset = parts.find((part) => part.type === "timeZoneName")?.value;

  if (!offset) {
    throw new Error(`Could not resolve timezone offset for ${timeZone}`);
  }

  return parseOffsetMinutes(offset);
};

export const dateOnlyWeekday = (dateOnly: string): number => {
  const utcDate = toUtcMidnight(dateOnly);
  return (utcDate.getUTCDay() + 6) % 7;
};

export const localDateTimeToUtc = (
  dateOnly: string,
  time: string,
  timeZone: string,
): Date => {
  const { year, month, day } = parseDateOnly(dateOnly);
  const [hour, minute] = time.split(":").map(Number);
  const localMillis = Date.UTC(year, month - 1, day, hour, minute);

  let utcMillis = localMillis;
  for (let i = 0; i < 3; i++) {
    const offsetMinutes = getOffsetMinutes(timeZone, new Date(utcMillis));
    const adjusted = localMillis - offsetMinutes * 60 * 1000;
    if (adjusted === utcMillis) {
      break;
    }
    utcMillis = adjusted;
  }

  return new Date(utcMillis);
};

const sortSessions = (sessions: WorkshopSession[]): WorkshopSession[] => {
  return [...sessions].sort((left, right) => {
    if (left.weekNumber !== right.weekNumber) {
      return left.weekNumber - right.weekNumber;
    }
    if (left.dayOfWeek !== right.dayOfWeek) {
      return left.dayOfWeek - right.dayOfWeek;
    }
    return left.sessionOrder - right.sessionOrder;
  });
};

export const getEarliestWorkshopSession = (
  sessions: WorkshopSession[],
): WorkshopSession => {
  if (sessions.length === 0) {
    throw new ValidationError([
      { message: "Workshop must have at least one session.", field: "sessions" },
    ]);
  }

  return sortSessions(sessions)[0]!;
};

export const deriveCohortSessions = ({
  sessions,
  startDate,
  timeZone,
}: {
  sessions: WorkshopSession[];
  startDate: string;
  timeZone: string;
}): DerivedCohortSession[] => {
  const sortedSessions = sortSessions(sessions);
  const earliestSession = getEarliestWorkshopSession(sortedSessions);
  const startDateUtc = toUtcMidnight(startDate);

  return sortedSessions.map((session) => {
    const offsetDays =
      (session.weekNumber - earliestSession.weekNumber) * 7 +
      (session.dayOfWeek - earliestSession.dayOfWeek);
    const sessionDate = new Date(startDateUtc.getTime() + offsetDays * DAY_MS);
    const date = formatDateOnly(sessionDate);

    return {
      ...session,
      date,
      startsAt: localDateTimeToUtc(date, session.startTime, timeZone),
    };
  });
};

export const deriveCohortWindow = (
  sessions: DerivedCohortSession[],
): { firstSessionStartsAt: Date; lastSessionStartsAt: Date } => {
  if (sessions.length === 0) {
    throw new ValidationError([
      { message: "Workshop must have at least one session.", field: "sessions" },
    ]);
  }

  const startsAtValues = sessions.map((session) => session.startsAt.getTime());

  return {
    firstSessionStartsAt: new Date(Math.min(...startsAtValues)),
    lastSessionStartsAt: new Date(Math.max(...startsAtValues)),
  };
};

export const getDerivedCohortStatus = ({
  firstSessionStartsAt,
  lastSessionStartsAt,
  now = new Date(),
}: {
  firstSessionStartsAt: Date;
  lastSessionStartsAt: Date;
  now?: Date;
}): CohortStatus => {
  if (now < firstSessionStartsAt) {
    return "upcoming";
  }

  if (now > lastSessionStartsAt) {
    return "completed";
  }

  return "active";
};
