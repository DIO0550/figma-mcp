import { parseFigmaUrl as parseUrl } from '../../utils/figma-url-parser.js';
import { setRuntimeConfig } from '../../config/runtime-config.js';
import type { ParseFigmaUrlArgs } from './parse-figma-url-args.js';

interface ParseFigmaUrlResult {
  figmaInfo: {
    fileId: string;
    fileName?: string;
    nodeId?: string;
  };
  message: string;
}

export function parseFigmaUrl(args: ParseFigmaUrlArgs): ParseFigmaUrlResult {
  const { url } = args;
  
  // URLをパース
  const figmaInfo = parseUrl(url);
  
  // runtime-configに保存
  setRuntimeConfig({ figmaInfo });
  
  return {
    figmaInfo,
    message: 'Figma URL parsed and saved successfully',
  };
}