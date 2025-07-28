import type { Request, Response } from 'express';

export const imageHandlers = {
  exportImages: (req: Request, res: Response): Response | void => {
    const { fileKey } = req.params;
    const { ids, format, scale, svg_include_id, svg_simplify_stroke, use_absolute_bounds } =
      req.query || {};

    if (!ids) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ids parameter is required',
      });
    }

    const nodeIds = (ids as string).split(',');
    const images: Record<string, string> = {};

    nodeIds.forEach((id) => {
      const fileFormat = typeof format === 'string' ? format : 'png';
      const scaleValue = typeof scale === 'string' ? scale : '1';

      // URLにパラメータを含める（実際のAPIの動作をシミュレート）
      let imageUrl = `https://example.com/export/${fileKey}/${id}.${fileFormat}?scale=${scaleValue}`;

      // SVG固有のパラメータを追加
      if (fileFormat === 'svg') {
        if (svg_include_id) {
          imageUrl += `&svg_include_id=${String(svg_include_id)}`;
        }
        if (svg_simplify_stroke) {
          imageUrl += `&svg_simplify_stroke=${String(svg_simplify_stroke)}`;
        }
      }

      if (use_absolute_bounds) {
        imageUrl += `&use_absolute_bounds=${String(use_absolute_bounds)}`;
      }

      images[id] = imageUrl;
    });

    const mockResponse = {
      err: null,
      images,
    };

    res.json(mockResponse);
  },
};
