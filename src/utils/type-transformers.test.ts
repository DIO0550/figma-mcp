import { describe, it, expectTypeOf } from 'vitest';
import type {
  SnakeToCamelCase,
  CamelToSnakeCase,
  CamelCaseKeys,
  SnakeCaseKeys,
  DeepCamelCase,
  DeepSnakeCase,
} from './type-transformers.js';

describe('type-transformers', () => {
  describe('SnakeToCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      type Test1 = SnakeToCamelCase<'file_key'>;
      expectTypeOf<Test1>().toEqualTypeOf<'fileKey'>();

      type Test2 = SnakeToCamelCase<'created_at'>;
      expectTypeOf<Test2>().toEqualTypeOf<'createdAt'>();

      type Test3 = SnakeToCamelCase<'thumbnail_url'>;
      expectTypeOf<Test3>().toEqualTypeOf<'thumbnailUrl'>();

      type Test4 = SnakeToCamelCase<'svg_include_id'>;
      expectTypeOf<Test4>().toEqualTypeOf<'svgIncludeId'>();
    });

    it('should handle single word', () => {
      type Test = SnakeToCamelCase<'name'>;
      expectTypeOf<Test>().toEqualTypeOf<'name'>();
    });

    it('should handle empty string', () => {
      type Test = SnakeToCamelCase<''>;
      expectTypeOf<Test>().toEqualTypeOf<''>();
    });
  });

  describe('CamelToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      type Test1 = CamelToSnakeCase<'fileKey'>;
      expectTypeOf<Test1>().toEqualTypeOf<'file_key'>();

      type Test2 = CamelToSnakeCase<'createdAt'>;
      expectTypeOf<Test2>().toEqualTypeOf<'created_at'>();

      type Test3 = CamelToSnakeCase<'thumbnailUrl'>;
      expectTypeOf<Test3>().toEqualTypeOf<'thumbnail_url'>();

      type Test4 = CamelToSnakeCase<'svgIncludeId'>;
      expectTypeOf<Test4>().toEqualTypeOf<'svg_include_id'>();
    });

    it('should handle single word', () => {
      type Test = CamelToSnakeCase<'name'>;
      expectTypeOf<Test>().toEqualTypeOf<'name'>();
    });

    it('should handle empty string', () => {
      type Test = CamelToSnakeCase<''>;
      expectTypeOf<Test>().toEqualTypeOf<''>();
    });
  });

  describe('CamelCaseKeys', () => {
    it('should convert object keys to camelCase', () => {
      type Input = {
        file_key: string;
        created_at: string;
        thumbnail_url: string;
      };

      type Expected = {
        fileKey: string;
        createdAt: string;
        thumbnailUrl: string;
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle nested objects', () => {
      type Input = {
        file_key: string;
        client_meta: {
          node_id: string;
          node_offset: number;
        };
      };

      type Expected = {
        fileKey: string;
        clientMeta: {
          node_id: string;
          node_offset: number;
        };
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('SnakeCaseKeys', () => {
    it('should convert object keys to snake_case', () => {
      type Input = {
        fileKey: string;
        createdAt: string;
        thumbnailUrl: string;
      };

      type Expected = {
        file_key: string;
        created_at: string;
        thumbnail_url: string;
      };

      type Result = SnakeCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('DeepCamelCase', () => {
    it('should recursively convert all keys to camelCase', () => {
      type Input = {
        file_key: string;
        client_meta: {
          node_id: string;
          node_offset: {
            x_position: number;
            y_position: number;
          };
        };
      };

      type Expected = {
        fileKey: string;
        clientMeta: {
          nodeId: string;
          nodeOffset: {
            xPosition: number;
            yPosition: number;
          };
        };
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle arrays', () => {
      type Input = {
        file_key: string;
        comment_list: Array<{
          comment_id: string;
          created_at: string;
        }>;
      };

      type Expected = {
        fileKey: string;
        commentList: Array<{
          commentId: string;
          createdAt: string;
        }>;
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('DeepSnakeCase', () => {
    it('should recursively convert all keys to snake_case', () => {
      type Input = {
        fileKey: string;
        clientMeta: {
          nodeId: string;
          nodeOffset: {
            xPosition: number;
            yPosition: number;
          };
        };
      };

      type Expected = {
        file_key: string;
        client_meta: {
          node_id: string;
          node_offset: {
            x_position: number;
            y_position: number;
          };
        };
      };

      type Result = DeepSnakeCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('Optional properties', () => {
    it('should handle optional properties in CamelCaseKeys', () => {
      type Input = {
        file_key: string;
        created_at?: string;
        thumbnail_url?: string;
        is_active?: boolean;
      };

      type Expected = {
        fileKey: string;
        createdAt?: string;
        thumbnailUrl?: string;
        isActive?: boolean;
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle optional properties in DeepCamelCase', () => {
      type Input = {
        file_key: string;
        client_meta?: {
          node_id?: string;
          node_offset?: {
            x_position: number;
            y_position?: number;
          };
        };
      };

      type Expected = {
        fileKey: string;
        clientMeta?: {
          nodeId?: string;
          nodeOffset?: {
            xPosition: number;
            yPosition?: number;
          };
        };
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('Null and undefined types', () => {
    it('should handle null and undefined in unions', () => {
      type Input = {
        file_key: string | null;
        created_at?: string | null;
        thumbnail_url: string | undefined;
        is_deleted: boolean | null | undefined;
      };

      type Expected = {
        fileKey: string | null;
        createdAt?: string | null;
        thumbnailUrl: string | undefined;
        isDeleted: boolean | null | undefined;
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle nullable nested objects', () => {
      type Input = {
        user_profile: {
          user_id: string;
          display_name: string | null;
        } | null;
        settings_data?: {
          theme_mode: 'light' | 'dark';
          auto_save?: boolean;
        } | null | undefined;
      };

      type Expected = {
        userProfile: {
          userId: string;
          displayName: string | null;
        } | null;
        settingsData?: {
          themeMode: 'light' | 'dark';
          autoSave?: boolean;
        } | null | undefined;
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('Enum types', () => {
    enum StatusEnum {
      IN_PROGRESS = 'IN_PROGRESS',
      COMPLETED = 'COMPLETED',
      FAILED = 'FAILED'
    }

    it('should handle enum values', () => {
      type Input = {
        task_status: StatusEnum;
        priority_level: 'LOW' | 'MEDIUM' | 'HIGH';
      };

      type Expected = {
        taskStatus: StatusEnum;
        priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle const enums and numeric enums', () => {
      const enum Direction {
        Up = 0,
        Down = 1,
        Left = 2,
        Right = 3
      }

      type Input = {
        movement_direction: Direction;
        rotation_angle: 0 | 90 | 180 | 270;
      };

      type Expected = {
        movementDirection: Direction;
        rotationAngle: 0 | 90 | 180 | 270;
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('Complex union types', () => {
    it('should handle discriminated unions', () => {
      type Input = 
        | { type: 'user_created'; user_id: string; created_at: string }
        | { type: 'user_updated'; user_id: string; updated_fields: string[] }
        | { type: 'user_deleted'; user_id: string; deleted_at: string };

      type Expected = 
        | { type: 'user_created'; userId: string; createdAt: string }
        | { type: 'user_updated'; userId: string; updatedFields: string[] }
        | { type: 'user_deleted'; userId: string; deletedAt: string };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle nested unions with objects', () => {
      type Input = {
        response_data: 
          | { status: 'success'; data_payload: { item_count: number } }
          | { status: 'error'; error_details: { error_code: string; error_message: string } }
          | null;
      };

      type Expected = {
        responseData: 
          | { status: 'success'; dataPayload: { itemCount: number } }
          | { status: 'error'; errorDetails: { errorCode: string; errorMessage: string } }
          | null;
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });


  describe('Complex nested structures', () => {
    it('should handle deeply nested arrays and objects', () => {
      type Input = {
        file_key: string;
        component_list: Array<{
          component_id: string;
          created_at: string;
          child_components?: Array<{
            child_id: string;
            is_visible: boolean;
          }>;
        }>;
        metadata_map: {
          [key: string]: {
            value_type: string;
            default_value?: unknown;
          };
        };
      };

      type Expected = {
        fileKey: string;
        componentList: Array<{
          componentId: string;
          createdAt: string;
          childComponents?: Array<{
            childId: string;
            isVisible: boolean;
          }>;
        }>;
        metadataMap: {
          [key: string]: {
            valueType: string;
            defaultValue?: unknown;
          };
        };
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle union types', () => {
      type Input = {
        response_type: 'success' | 'error';
        data_item: string | number | { item_id: string };
      };

      type Expected = {
        responseType: 'success' | 'error';
        dataItem: string | number | { itemId: string };
      };

      type Result = DeepCamelCase<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it('should handle readonly properties', () => {
      type Input = {
        readonly file_key: string;
        readonly created_at: string;
      };

      type Expected = {
        readonly fileKey: string;
        readonly createdAt: string;
      };

      type Result = CamelCaseKeys<Input>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });
});