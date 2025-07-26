import type { ToolDefinition } from '../types.js';
import type { GetVersionsResponse } from '../../types/api/responses/version-responses.js';
import type { GetVersionsArgs } from './get-versions-args.js';

export type VersionTool = ToolDefinition<GetVersionsArgs, GetVersionsResponse>;