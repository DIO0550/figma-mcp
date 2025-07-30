// Figmaの基本型定義

import type { DeepCamelCase } from '../utils/type-transformers.js';

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Transform = [[number, number, number], [number, number, number]];

export interface LayoutConstraint {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface ExportSetting {
  suffix: string;
  format: 'JPG' | 'PNG' | 'SVG' | 'PDF';
  constraint: SizeConstraint;
}

export interface SizeConstraint {
  type: 'SCALE' | 'WIDTH' | 'HEIGHT';
  value: number;
}

export interface Paint {
  type:
    | 'SOLID'
    | 'GRADIENT_LINEAR'
    | 'GRADIENT_RADIAL'
    | 'GRADIENT_ANGULAR'
    | 'GRADIENT_DIAMOND'
    | 'IMAGE'
    | 'EMOJI';
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
  imageRef?: string;
}

export interface ColorStop {
  position: number;
  color: Color;
}

export interface Effect {
  type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: BlendMode;
  offset?: Vector;
  spread?: number;
}

export type BlendMode =
  | 'PASS_THROUGH'
  | 'NORMAL'
  | 'DARKEN'
  | 'MULTIPLY'
  | 'LINEAR_BURN'
  | 'COLOR_BURN'
  | 'LIGHTEN'
  | 'SCREEN'
  | 'LINEAR_DODGE'
  | 'COLOR_DODGE'
  | 'OVERLAY'
  | 'SOFT_LIGHT'
  | 'HARD_LIGHT'
  | 'DIFFERENCE'
  | 'EXCLUSION'
  | 'HUE'
  | 'SATURATION'
  | 'COLOR'
  | 'LUMINOSITY';

export interface Node {
  id: string;
  name: string;
  type: string;
  children?: Node[];
  visible?: boolean;
  backgroundColor?: Color;
  exportSettings?: ExportSetting[];
  absoluteBoundingBox?: Rectangle;
  absoluteRenderBounds?: Rectangle;
  constraints?: LayoutConstraint;
  relativeTransform?: Transform;
  size?: Vector;
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  effects?: Effect[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  children: Node[];
}

// APIレスポンス用のスネークケース型（内部使用）
export interface ComponentSnake {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: DocumentationLink[];
  // 追加フィールド
  file_key?: string;
  node_id?: string;
  containing_frame?: {
    page_id: string;
    page_name: string;
  };
  component_set_id?: string;
}

// アプリケーション用のキャメルケース型
export type Component = DeepCamelCase<ComponentSnake>;

export interface ComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks: DocumentationLink[];
}

// APIレスポンス用のスネークケース型（内部使用）
export interface StyleSnake {
  key: string;
  file_key: string;
  node_id: string;
  style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  name: string;
  description: string;
  remote?: boolean;
  sort_position?: string;
}

// アプリケーション用のキャメルケース型
export type Style = DeepCamelCase<StyleSnake>;

export interface DocumentationLink {
  uri: string;
}

// APIレスポンス用のスネークケース型（内部使用）
export interface FigmaUserSnake {
  id: string;
  handle: string;
  img_url: string;
  email: string;
}

// アプリケーション用のキャメルケース型
export type FigmaUser = DeepCamelCase<FigmaUserSnake>;

// APIレスポンス用のスネークケース型（内部使用）
export interface CommentSnake {
  id: string;
  file_key: string;
  parent_id?: string;
  user: FigmaUserSnake;
  created_at: string;
  resolved_at?: string;
  message: string;
  client_meta: {
    node_id?: string[];
    node_offset?: Vector;
    [key: string]: unknown;
  };
  order_id: string;
  reactions?: ReactionSnake[];
}

// アプリケーション用のキャメルケース型
export type Comment = DeepCamelCase<CommentSnake>;

// APIレスポンス用のスネークケース型（内部使用）
export interface ReactionSnake {
  user: FigmaUserSnake;
  created_at: string;
  emoji: string;
}

// アプリケーション用のキャメルケース型
export type Reaction = DeepCamelCase<ReactionSnake>;

// APIレスポンス用のスネークケース型（内部使用）
export interface VersionSnake {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: FigmaUserSnake;
  // 詳細情報（オプション）
  thumbnail_url?: string;
  pages_changed?: string[];
  components_changed?: number;
  styles_changed?: number;
}

// アプリケーション用のキャメルケース型
export type Version = DeepCamelCase<VersionSnake>;
