import type { ToolDefinition } from '../types.js';
import type { FileComponentsApiResponse } from '../../api/endpoints/components/index.js';
import type { GetComponentsArgs } from './get-components-args.js';

export type ComponentTool = ToolDefinition<GetComponentsArgs, FileComponentsApiResponse>;
