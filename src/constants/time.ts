/** One second in milliseconds */
export const SECOND_IN_MS = 1000;

/** One minute in milliseconds (60 seconds) */
export const MINUTE_IN_MS = 60 * SECOND_IN_MS;

/** One hour in milliseconds (60 minutes) */
export const HOUR_IN_MS = 60 * MINUTE_IN_MS;

/** One day in milliseconds (24 hours) */
export const DAY_IN_MS = 24 * HOUR_IN_MS;

/** One week in milliseconds (7 days) */
export const WEEK_IN_MS = 7 * DAY_IN_MS;

export const TIME_IN_MS = {
  SECOND: SECOND_IN_MS,
  MINUTE: MINUTE_IN_MS,
  HOUR: HOUR_IN_MS,
  DAY: DAY_IN_MS,
  WEEK: WEEK_IN_MS,
} as const;
