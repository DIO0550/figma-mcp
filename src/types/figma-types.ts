// Figmaの基本型定義

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
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
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

export interface Component {
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

export interface ComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks: DocumentationLink[];
}

export interface Style {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
}

export interface DocumentationLink {
  uri: string;
}

export interface FigmaUser {
  id: string;
  handle: string;
  img_url: string;
  email: string;
}

export interface Comment {
  id: string;
  file_key: string;
  parent_id?: string;
  user: FigmaUser;
  created_at: string;
  resolved_at?: string;
  message: string;
  client_meta: Vector;
  order_id: string;
  reactions?: Reaction[];
}

export interface Reaction {
  user: FigmaUser;
  created_at: string;
  emoji: string;
}

export interface Version {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: FigmaUser;
  // 詳細情報（オプション）
  thumbnail_url?: string;
  pages_changed?: string[];
  components_changed?: number;
  styles_changed?: number;
}