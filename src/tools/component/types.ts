import type { ToolDefinition } from '../types.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';
import type { GetComponentsArgs } from './get-components-args.js';

export type ComponentTool = ToolDefinition<GetComponentsArgs, GetComponentsResponse>;
