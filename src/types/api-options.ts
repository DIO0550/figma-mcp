// Figma APIオプションの型定義

export interface GetFileOptions {
  version?: string;
  ids?: string[];
  depth?: number;
  geometry?: 'paths' | 'points';
  plugin_data?: string;
  branch_data?: boolean;
}

export interface GetNodesOptions {
  ids: string[];
  version?: string;
  depth?: number;
  geometry?: 'paths' | 'points';
  plugin_data?: string;
}

export interface ExportImageOptions {
  ids: string[];
  scale?: number;
  format?: 'jpg' | 'png' | 'svg' | 'pdf';
  svg_include_id?: boolean;
  svg_simplify_stroke?: boolean;
  use_absolute_bounds?: boolean;
  version?: string;
}

export interface PostCommentOptions {
  message: string;
  client_meta: {
    x: number;
    y: number;
  };
  comment_id?: string;
}