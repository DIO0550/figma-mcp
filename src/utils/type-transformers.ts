/**
 * 型変換ユーティリティ
 *
 * スネークケースとキャメルケース間の型レベル変換を提供します。
 *
 * ## サポートされている機能
 * - 基本的な文字列の変換（snake_case ↔ camelCase）
 * - オブジェクトのキー変換（非再帰・再帰）
 * - オプショナルプロパティ（?）の保持
 * - null/undefined を含むユニオン型
 * - enum型の値
 * - ネストされた配列とオブジェクト
 * - readonlyプロパティの保持
 * - インデックスシグネチャ内のオブジェクト
 *
 * ## 制限事項
 * - タプル型：配列として処理されるため、タプルの構造は保持されません
 * - 関数型：関数自体は変換されませんが、引数や戻り値の型は変換されません
 * - インターセクション型（&）：個別の型として処理されます
 * - Record型：キーは変換されませんが、値は変換されます
 * - ジェネリック型：型パラメータは変換されません
 */

/**
 * スネークケースをキャメルケースに変換する型
 * @example
 * type Result = SnakeToCamelCase<'file_key'>; // 'fileKey'
 */
export type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

/**
 * よく使われるアクロニムを正規化する内部型
 * 最初に見つかったアクロニムだけを変換
 */
type NormalizeAcronyms<S extends string> = S extends `HTTPS${infer After}`
  ? `Https${NormalizeAcronyms<After>}`
  : S extends `HTTP${infer After}`
    ? `Http${NormalizeAcronyms<After>}`
    : S extends `XML${infer After}`
      ? `Xml${NormalizeAcronyms<After>}`
      : S extends `URL${infer After}`
        ? `Url${NormalizeAcronyms<After>}`
        : S extends `API${infer After}`
          ? `Api${NormalizeAcronyms<After>}`
          : S extends `JSON${infer After}`
            ? `Json${NormalizeAcronyms<After>}`
            : S extends `SVG${infer After}`
              ? `Svg${NormalizeAcronyms<After>}`
              : S extends `PDF${infer After}`
                ? `Pdf${NormalizeAcronyms<After>}`
                : S extends `IO${infer After}`
                  ? `Io${NormalizeAcronyms<After>}`
                  : S extends `ID${infer After}`
                    ? `Id${NormalizeAcronyms<After>}`
                    : S extends `${infer First}${infer Rest}`
                      ? `${First}${NormalizeAcronyms<Rest>}`
                      : S;

/**
 * キャメルケースをスネークケースに変換する基本型
 */
type CamelToSnakeCaseBase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${CamelToSnakeCaseBase<U>}`
    : `${Lowercase<T>}_${CamelToSnakeCaseBase<Uncapitalize<U>>}`
  : Lowercase<S>;

/**
 * キャメルケースをスネークケースに変換する型
 * @example
 * type Result = CamelToSnakeCase<'fileKey'>; // 'file_key'
 * type Result2 = CamelToSnakeCase<'XMLHttpRequest'>; // 'xml_http_request'
 * type Result3 = CamelToSnakeCase<'getAPIKey'>; // 'get_api_key'
 */
export type CamelToSnakeCase<S extends string> = CamelToSnakeCaseBase<NormalizeAcronyms<S>>;

/**
 * オブジェクトのキーをキャメルケースに変換する型（非再帰）
 * @example
 * type Result = CamelCaseKeys<{ file_key: string; created_at: Date }>;
 * // { fileKey: string; createdAt: Date }
 */
export type CamelCaseKeys<T> = T extends object
  ? T extends Array<unknown>
    ? T
    : {
        [K in keyof T as SnakeToCamelCase<K & string>]: T[K];
      }
  : T;

/**
 * オブジェクトのキーをスネークケースに変換する型（非再帰）
 * @example
 * type Result = SnakeCaseKeys<{ fileKey: string; createdAt: Date }>;
 * // { file_key: string; created_at: Date }
 */
export type SnakeCaseKeys<T> = T extends object
  ? T extends Array<unknown>
    ? T
    : {
        [K in keyof T as CamelToSnakeCase<K & string>]: T[K];
      }
  : T;

/**
 * ネストされたオブジェクトを再帰的にキャメルケースに変換する型
 * @example
 * type Result = DeepCamelCase<{
 *   file_key: string;
 *   client_meta: { node_id: string; };
 * }>;
 * // { fileKey: string; clientMeta: { nodeId: string; } }
 */
export type DeepCamelCase<T> = T extends object
  ? T extends Array<infer U>
    ? Array<DeepCamelCase<U>>
    : {
        [K in keyof T as SnakeToCamelCase<K & string>]: DeepCamelCase<T[K]>;
      }
  : T;

/**
 * ネストされたオブジェクトを再帰的にスネークケースに変換する型
 * @example
 * type Result = DeepSnakeCase<{
 *   fileKey: string;
 *   clientMeta: { nodeId: string; };
 * }>;
 * // { file_key: string; client_meta: { node_id: string; } }
 */
export type DeepSnakeCase<T> = T extends object
  ? T extends Array<infer U>
    ? Array<DeepSnakeCase<U>>
    : {
        [K in keyof T as CamelToSnakeCase<K & string>]: DeepSnakeCase<T[K]>;
      }
  : T;
