export const TEST_TIMEOUT = {
  DEFAULT: 5000,
  UNIT_TEST: 10000,
  INTEGRATION_TEST: 30000,
  E2E_TEST: 60000,
} as const;

export const TEST_PERFORMANCE = {
  LARGE_DATASET_SIZE: 10000,
  EXECUTION_TIME_LIMIT: 10000, // 10 seconds in milliseconds
} as const;
