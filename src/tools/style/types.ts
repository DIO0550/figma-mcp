import type { ToolDefinition } from '../types.js';
import type { GetStylesApiResponse } from '../../types/api/responses/style-responses.js';
import type { GetStylesArgs } from './get-styles-args.js';

export type StyleTool = ToolDefinition<GetStylesArgs, GetStylesApiResponse>;
