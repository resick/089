import type { MapPalette } from '@089/tokens';
import { z } from 'zod';

// Our own look on top of OpenFreeMap's OpenMapTiles styles (ADR-033): the
// layers and tiles stay theirs, the colours become ours, and buildings rise
// in 3D when zoomed in. Pure, so it runs the same for the WebView and native.

const layerSchema = z.looseObject({
  id: z.string(),
  type: z.string(),
  'source-layer': z.string().optional(),
  minzoom: z.number().optional(),
  paint: z.record(z.string(), z.unknown()).optional(),
  layout: z.record(z.string(), z.unknown()).optional(),
});

export const basemapStyleSchema = z.looseObject({
  version: z.literal(8),
  sources: z.record(z.string(), z.unknown()),
  layers: z.array(layerSchema),
});

export type BasemapStyle = z.infer<typeof basemapStyleSchema>;
type Layer = z.infer<typeof layerSchema>;

/** From this zoom buildings are drawn as 3D blocks (heights from OSM). */
export const BUILDINGS_3D_MINZOOM = 15;

// Clutter Apple Maps also leaves out at city scale.
const HIDDEN = /oneway|shield|boundary/;

type Role = Exclude<keyof MapPalette, 'labelStrong' | 'waterLabel' | 'halo'>;

function roleOf(layer: Layer): Role | null {
  const { id } = layer;
  if (layer.type === 'background') return 'land';
  switch (layer['source-layer']) {
    case 'water':
    case 'waterway':
      return 'water';
    case 'park':
      return 'park';
    case 'landcover':
      return /wood|grass|park/.test(id) ? 'park' : 'landuse';
    case 'landuse':
      return id.includes('park') ? 'park' : 'landuse';
    case 'aeroway':
      return 'landuse';
    case 'building':
      return 'building';
    case 'transportation':
      if (id.includes('rail')) return 'rail';
      if (id.includes('casing')) return 'casing';
      if (id.includes('path') || id.includes('pier')) return 'path';
      if (id.includes('motorway') || id.includes('major')) return 'roadMajor';
      return 'road';
    default:
      return null;
  }
}

function labelColor(layer: Layer, palette: MapPalette): string {
  const sourceLayer = layer['source-layer'] ?? '';
  if (sourceLayer.startsWith('water')) return palette.waterLabel;
  if (sourceLayer === 'place' && /city|town|country|state/.test(layer.id)) {
    return palette.labelStrong;
  }
  return palette.label;
}

function restyleLayer(layer: Layer, palette: MapPalette): Layer[] {
  if (HIDDEN.test(layer.id)) return [];

  if (layer.type === 'symbol') {
    return [
      {
        ...layer,
        paint: {
          ...layer.paint,
          'text-color': labelColor(layer, palette),
          'text-halo-color': palette.halo,
          'text-halo-width': 1.2,
        },
      },
    ];
  }

  const role = roleOf(layer);
  if (!role) return [layer];
  const color = palette[role];

  switch (layer.type) {
    case 'background':
      return [{ ...layer, paint: { 'background-color': color } }];
    case 'line':
      return [{ ...layer, paint: { ...layer.paint, 'line-color': color } }];
    case 'fill': {
      // Patterns and outlines are the stock style's texture; ours is flat.
      const {
        'fill-pattern': _pattern,
        'fill-outline-color': _outline,
        ...paint
      } = layer.paint ?? {};
      const flat: Layer = { ...layer, paint: { ...paint, 'fill-color': color } };
      if (role !== 'building') return [flat];
      return [
        { ...flat, maxzoom: BUILDINGS_3D_MINZOOM },
        {
          id: `${layer.id}-3d`,
          type: 'fill-extrusion',
          source: layer.source,
          'source-layer': layer['source-layer'],
          minzoom: BUILDINGS_3D_MINZOOM,
          paint: {
            'fill-extrusion-color': color,
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 0],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.9,
          },
        },
      ];
    }
    default:
      return [layer];
  }
}

/** Returns a recoloured copy of an OpenMapTiles style; the input is untouched. */
export function restyleBasemap(style: BasemapStyle, palette: MapPalette): BasemapStyle {
  return { ...style, layers: style.layers.flatMap((layer) => restyleLayer(layer, palette)) };
}
