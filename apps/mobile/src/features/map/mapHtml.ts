import type { LngLat } from '@maplibre/maplibre-react-native';

import type { BasemapStyle } from './basemapStyle';

// MapLibre GL JS for places without the native module (Expo Go, web preview).
// v5 ships one UMD file with its worker inlined, which matters inside a
// WebView/iframe with no origin: v6 loads a separate cross-origin worker.
export const MAPLIBRE_GL_VERSION = '5.24.0';
const CDN = `https://unpkg.com/maplibre-gl@${MAPLIBRE_GL_VERSION}/dist`;

type Options = {
  /** Our restyled style object, or a style URL as the fallback. */
  style: BasemapStyle | string;
  center: LngLat;
  zoom: number;
  /** Page colour shown before tiles load, so there is no white flash. */
  background: string;
};

const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

/** Self-contained HTML page rendering one full-screen map. */
export function buildMapHtml({ style, center, zoom, background }: Options): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${CDN}/maplibre-gl.css">
<style>
  html, body, #map { margin: 0; height: 100%; width: 100%; background: ${background}; }
  .maplibregl-ctrl-attrib { font: 11px system-ui, sans-serif; }
</style>
</head>
<body>
<div id="map"></div>
<script src="${CDN}/maplibre-gl.js"></script>
<script>
  new maplibregl.Map({
    container: 'map',
    style: ${json(style)},
    center: ${json(center)},
    zoom: ${json(zoom)},
    attributionControl: { compact: true },
    dragRotate: false,
    pitchWithRotate: false,
  });
</script>
</body>
</html>`;
}
