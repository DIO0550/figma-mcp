// Figma APIレスポンスの型定義

import type { Document, Component, ComponentSet, Style, Comment, Version, Node } from './figma-types.js';

export interface FigmaFile {
  document: Document;
  components: Record<string, Component>;
  componentSets: Record<string, ComponentSet>;
  schemaVersion: number;
  styles: Record<string, Style>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

export interface GetNodesResponse {
  nodes: Record<string, {
    document: Node;
    components: Record<string, Component>;
    schemaVersion: number;
  }>;
}

export interface GetComponentsResponse {
  meta: {
    components: Component[];
  };
}

export interface GetComponentSetsResponse {
  meta: {
    component_sets: Array<{
      key: string;
      name: string;
      description: string;
    }>;
  };
}

export interface GetStylesResponse {
  meta: {
    styles: Style[];
  };
}

export interface ExportImageResponse {
  err?: string;
  images: Record<string, string>;
  status?: number;
}

export interface GetCommentsResponse {
  comments: Comment[];
}

export interface GetVersionsResponse {
  versions: Version[];
}

export interface GetTeamProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export interface GetProjectFilesResponse {
  files: Array<{
    key: string;
    name: string;
    thumbnail_url: string;
    last_modified: string;
  }>;
}