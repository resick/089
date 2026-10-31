import { mapPalette } from '@089/tokens';

import { basemapStyleSchema, BUILDINGS_3D_MINZOOM, restyleBasemap } from './basemapStyle';

const palette = mapPalette.dark;

// A trimmed OpenMapTiles style with one layer of each kind we restyle.
const style = basemapStyleSchema.parse({
  version: 8,
  sources: { openmaptiles: { type: 'vector', url: 'https://tiles.example.test' } },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#123456' } },
    { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water' },
    {
      id: 'landuse_park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      paint: { 'fill-pattern': 'park-dots', 'fill-outline-color': '#000000' },
    },
    { id: 'building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building' },
    {
      id: 'highway_major_inner',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      paint: { 'line-width': 2 },
    },
    { id: 'road_oneway', type: 'symbol', 'source-layer': 'transportation' },
    { id: 'boundary_state', type: 'line', 'source-layer': 'boundary' },
    { id: 'place_city', type: 'symbol', 'source-layer': 'place' },
    { id: 'water_name', type: 'symbol', 'source-layer': 'water_name' },
  ],
});

const restyled = restyleBasemap(style, palette);
const layer = (id: string) => restyled.layers.find((l) => l.id === id);

describe('restyleBasemap', () => {
  it('paints land, water and parks from the palette', () => {
    expect(layer('background')?.paint).toEqual({ 'background-color': palette.land });
    expect(layer('water')?.paint).toEqual({ 'fill-color': palette.water });
    expect(layer('landuse_park')?.paint).toEqual({ 'fill-color': palette.park });
  });

  it('keeps line widths and only replaces the colour', () => {
    expect(layer('highway_major_inner')?.paint).toEqual({
      'line-width': 2,
      'line-color': palette.roadMajor,
    });
  });

  it('adds 3D buildings from the zoom where flat ones stop', () => {
    expect(layer('building')).toMatchObject({ maxzoom: BUILDINGS_3D_MINZOOM });
    expect(layer('building-3d')).toMatchObject({
      type: 'fill-extrusion',
      'source-layer': 'building',
      minzoom: BUILDINGS_3D_MINZOOM,
    });
  });

  it('drops one-way arrows and boundaries', () => {
    expect(layer('road_oneway')).toBeUndefined();
    expect(layer('boundary_state')).toBeUndefined();
  });

  it('colours labels by what they name', () => {
    expect(layer('place_city')?.paint).toMatchObject({ 'text-color': palette.labelStrong });
    expect(layer('water_name')?.paint).toMatchObject({ 'text-color': palette.waterLabel });
  });

  it('leaves the input style untouched', () => {
    expect(style.layers[0]?.paint).toEqual({ 'background-color': '#123456' });
  });
});

describe('basemapStyleSchema', () => {
  it('rejects something that is not a MapLibre style', () => {
    expect(() => basemapStyleSchema.parse({ version: 7, layers: [] })).toThrow();
  });
});
