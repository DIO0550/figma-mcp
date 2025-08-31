import type { ToolDefinition } from '../types.js';
import type { GetVersionsApiResponse } from '../../api/endpoints/versions/index.js';
import type { GetVersionsArgs } from './get-versions-args.js';

export type VersionTool = ToolDefinition<GetVersionsArgs, GetVersionsApiResponse>;
