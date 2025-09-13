import { test, expectTypeOf } from 'vitest';
import type {
  SnakeToCamelCase,
  CamelToSnakeCase,
  CamelCaseKeys,
  SnakeCaseKeys,
  DeepCamelCase,
  DeepSnakeCase,
} from '../type-transformers.js';

// ==============================
// SnakeToCamelCase 型変換テスト
// ==============================

test('SnakeToCamelCase - converts snake_case string literals to camelCase', () => {
  type Test1 = SnakeToCamelCase<'file_key'>;
  expectTypeOf<Test1>().toEqualTypeOf<'fileKey'>();

  type Test2 = SnakeToCamelCase<'created_at'>;
  expectTypeOf<Test2>().toEqualTypeOf<'createdAt'>();

  type Test3 = SnakeToCamelCase<'thumbnail_url'>;
  expectTypeOf<Test3>().toEqualTypeOf<'thumbnailUrl'>();

  type Test4 = SnakeToCamelCase<'svg_include_id'>;
  expectTypeOf<Test4>().toEqualTypeOf<'svgIncludeId'>();
});

test('SnakeToCamelCase - handles single word strings', () => {
  type Test = SnakeToCamelCase<'name'>;
  expectTypeOf<Test>().toEqualTypeOf<'name'>();
});

test('SnakeToCamelCase - handles empty string', () => {
  type Test = SnakeToCamelCase<''>;
  expectTypeOf<Test>().toEqualTypeOf<''>();
});

// ==============================
// CamelToSnakeCase 型変換テスト
// ==============================

test('CamelToSnakeCase - converts camelCase string literals to snake_case', () => {
  type Test1 = CamelToSnakeCase<'fileKey'>;
  expectTypeOf<Test1>().toEqualTypeOf<'file_key'>();

  type Test2 = CamelToSnakeCase<'createdAt'>;
  expectTypeOf<Test2>().toEqualTypeOf<'created_at'>();

  type Test3 = CamelToSnakeCase<'thumbnailUrl'>;
  expectTypeOf<Test3>().toEqualTypeOf<'thumbnail_url'>();

  type Test4 = CamelToSnakeCase<'svgIncludeId'>;
  expectTypeOf<Test4>().toEqualTypeOf<'svg_include_id'>();
});

test('CamelToSnakeCase - handles single word strings', () => {
  type Test = CamelToSnakeCase<'name'>;
  expectTypeOf<Test>().toEqualTypeOf<'name'>();
});

test('CamelToSnakeCase - handles empty string', () => {
  type Test = CamelToSnakeCase<''>;
  expectTypeOf<Test>().toEqualTypeOf<''>();
});

test('CamelToSnakeCase - handles consecutive uppercase letters (acronyms)', () => {
  // アクロニムが正しく処理される
  type Test1 = CamelToSnakeCase<'XMLHttpRequest'>;
  expectTypeOf<Test1>().toEqualTypeOf<'xml_http_request'>();

  type Test2 = CamelToSnakeCase<'IOError'>;
  expectTypeOf<Test2>().toEqualTypeOf<'io_error'>();

  type Test3 = CamelToSnakeCase<'HTTPSConnection'>;
  expectTypeOf<Test3>().toEqualTypeOf<'https_connection'>();

  type Test4 = CamelToSnakeCase<'URLPattern'>;
  expectTypeOf<Test4>().toEqualTypeOf<'url_pattern'>();

  // 一般的なキャメルケースでも正しく動作
  type Test5 = CamelToSnakeCase<'apiKey'>;
  expectTypeOf<Test5>().toEqualTypeOf<'api_key'>();

  type Test6 = CamelToSnakeCase<'httpStatus'>;
  expectTypeOf<Test6>().toEqualTypeOf<'http_status'>();

  // 複数のアクロニムを含むケース
  type Test7 = CamelToSnakeCase<'getAPIKeyFromJSON'>;
  expectTypeOf<Test7>().toEqualTypeOf<'get_api_key_from_json'>();

  type Test8 = CamelToSnakeCase<'parseXMLToJSON'>;
  expectTypeOf<Test8>().toEqualTypeOf<'parse_xml_to_json'>();
});

// ==============================
// CamelCaseKeys オブジェクトキー変換テスト
// ==============================

test('CamelCaseKeys - converts object keys to camelCase', () => {
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

test('CamelCaseKeys - handles nested objects (shallow)', () => {
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

// ==============================
// SnakeCaseKeys オブジェクトキー変換テスト
// ==============================

test('SnakeCaseKeys - converts object keys to snake_case', () => {
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

// ==============================
// DeepCamelCase 再帰的変換テスト
// ==============================

test('DeepCamelCase - recursively converts all keys to camelCase', () => {
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

test('DeepCamelCase - handles arrays of objects', () => {
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

// ==============================
// DeepSnakeCase 再帰的変換テスト
// ==============================

test('DeepSnakeCase - recursively converts all keys to snake_case', () => {
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

// ==============================
// Optional プロパティのテスト
// ==============================

test('CamelCaseKeys - handles optional properties', () => {
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

test('DeepCamelCase - handles optional nested properties', () => {
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

// ==============================
// Null/Undefined ユニオン型のテスト
// ==============================

test('CamelCaseKeys - handles null and undefined in unions', () => {
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

test('DeepCamelCase - handles nullable nested objects', () => {
  type Input = {
    user_profile: {
      user_id: string;
      display_name: string | null;
    } | null;
    settings_data?:
      | {
          theme_mode: 'light' | 'dark';
          auto_save?: boolean;
        }
      | null
      | undefined;
  };

  type Expected = {
    userProfile: {
      userId: string;
      displayName: string | null;
    } | null;
    settingsData?:
      | {
          themeMode: 'light' | 'dark';
          autoSave?: boolean;
        }
      | null
      | undefined;
  };

  type Result = DeepCamelCase<Input>;
  expectTypeOf<Result>().toEqualTypeOf<Expected>();
});

// ==============================
// Enum 型のテスト
// ==============================

enum StatusEnum {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

test('CamelCaseKeys - handles enum values', () => {
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

const enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

test('CamelCaseKeys - handles const enums and numeric enums', () => {
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

// ==============================
// 複雑なユニオン型のテスト
// ==============================

test('DeepCamelCase - handles discriminated unions', () => {
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

test('DeepCamelCase - handles nested unions with objects', () => {
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

// ==============================
// 複雑なネスト構造のテスト
// ==============================

test('DeepCamelCase - handles deeply nested arrays and objects', () => {
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

test('DeepCamelCase - handles mixed union types', () => {
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

test('CamelCaseKeys - handles readonly properties', () => {
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
