import type { ToolDefinition } from '../types.js';
import type { GetStylesApiResponse } from '../../api/endpoints/styles/index.js';
import type { GetStylesArgs } from './get-styles-args.js';

export type StyleTool = ToolDefinition<GetStylesArgs, GetStylesApiResponse>;
