import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';

export interface JsonSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  items?: unknown;
  enum?: readonly unknown[];
  minItems?: number;
  maxItems?: number;
  description?: string;
}

/**
 * JsonSchemaのコンパニオンオブジェクト
 */
export const JsonSchema = {
  /**
   * ZodスキーマからJSON Schemaを生成
   */
  from<T extends z.ZodTypeAny>(schema: T): JsonSchema {
    const jsonSchema = zodToJsonSchema(schema, {
      $refStrategy: 'none',
      errorMessages: false,
      markdownDescription: false,
    });

    let result: unknown = jsonSchema;

    // $schemaプロパティを除去
    if (typeof jsonSchema === 'object' && jsonSchema !== null && '$schema' in jsonSchema) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $schema, ...rest } = jsonSchema;
      result = rest;
    }

    // object型の場合、requiredがなければ空配列を追加
    if (
      result &&
      typeof result === 'object' &&
      'type' in result &&
      result.type === 'object' &&
      !('required' in result)
    ) {
      (result as Record<string, unknown>).required = [];
    }

    return result as JsonSchema;
  },
};

export interface ToolDefinition<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  execute: (args: TArgs) => Promise<TResult>;
  inputSchema: JsonSchema;
}

export interface ToolContent {
  type: 'text';
  text: string;
}

export interface ToolResponse {
  content: ToolContent[];
  isError?: boolean;
}
