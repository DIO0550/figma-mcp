/**
 * Figma MCPサーバーのランタイム設定管理
 * 実行時に動的な設定更新を可能にする
 */

import { FigmaInfo } from './figma-info/figma-info.js';

export interface RuntimeConfig {
  /** Figma APIベースURLのオーバーライド */
  baseUrl?: string;
  /** パース済みのFigma情報 */
  figmaInfo?: FigmaInfo;
  // 将来の設定オプションはここに追加可能
}

// プライベートな設定ストア
let runtimeConfig: RuntimeConfig = {};

/**
 * ランタイム設定を更新する
 * @param config 既存の設定とマージする部分的な設定
 */
export const setRuntimeConfig = (config: Partial<RuntimeConfig>): void => {
  runtimeConfig = { ...runtimeConfig, ...config };
};

/**
 * URLからFigma情報を設定する
 * @param url パースするFigma URL
 */
export const setFigmaInfoFromUrl = (url: string): void => {
  const figmaInfo = FigmaInfo.fromUrl(url);
  setRuntimeConfig({ figmaInfo });
};

/**
 * 現在のランタイム設定を取得する
 * @returns 現在の設定のコピー
 */
export const getRuntimeConfig = (): RuntimeConfig => {
  return { ...runtimeConfig };
};

/**
 * ランタイム設定を空の状態にリセットする
 */
export const resetRuntimeConfig = (): void => {
  runtimeConfig = {};
};
