import type { StyleSpecification } from 'maplibre-gl';
export const cityStyle: StyleSpecification = {
  version: 8,
  sources: {
    city: {
      type: 'vector', url: 'https://tiles.openfreemap.org/planet',
      attribution: '<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a> · &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  },
  layers: [
    { id: 'paper', type: 'background', paint: { 'background-color': '#F3EEE4' } },
    { id: 'water', type: 'fill', source: 'city', 'source-layer': 'water', paint: { 'fill-color': '#67C9B2' } },
    { id: 'waterways', type: 'line', source: 'city', 'source-layer': 'waterway', paint: { 'line-color': '#67C9B2', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, .5, 15, 3] } },
    { id: 'streets', type: 'line', source: 'city', 'source-layer': 'transportation', filter: ['in', 'class', 'minor', 'service', 'path', 'track'], paint: { 'line-color': '#252035', 'line-opacity': .32, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, .2, 15, 1.2] } },
    { id: 'avenues', type: 'line', source: 'city', 'source-layer': 'transportation', filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'motorway', 'trunk'], paint: { 'line-color': '#252035', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, .6, 13, 1.6, 17, 4] } }
  ]
};
