/**
 * Common test data identifiers
 */
export const TestData = {
  /** Test file keys */
  FILE_KEY: 'test-file-key',
  EMPTY_FILE_KEY: 'empty-file-key',
  NON_EXISTENT_FILE_KEY: 'non-existent-file',
  
  /** Test tokens */
  VALID_TOKEN: 'test-token',
  INVALID_TOKEN: 'invalid-token',
  
  /** Test node IDs */
  NODE_ID: '2:3',
  COMPONENT_NODE_ID: '1:1',
  
  /** Test URLs */
  LOCALHOST_URL: 'http://localhost',
  CUSTOM_BASE_URL: 'https://custom.figma.com',
  
  /** Test version IDs */
  VERSION_1: 'version1',
  VERSION_2: 'version2',
} as const;