import type { EraId, GeographicMap, MapFeature } from '../shared/types/content';

export interface EraVisualLayers {
  roads: MapFeature[];
  footpaths: MapFeature[];
  water: MapFeature[];
  landuse: MapFeature[];
  buildings: MapFeature[];
  waterIsModernReference: boolean;
}

export const getEraVisualLayers = (map: GeographicMap, era: EraId): EraVisualLayers => era === 'ly_1077'
  ? { roads: [], footpaths: [], water: map.layers.water, landuse: [], buildings: [], waterIsModernReference: true }
  : { ...map.layers, waterIsModernReference: false };
