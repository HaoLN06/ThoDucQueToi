import { describe, expect, it } from 'vitest';
import mapData from '../../public/data/geographic-map.json';
import { getEraVisualLayers } from '../../src/services/MapLayerService';
import type { GeographicMap } from '../../src/shared/types/content';

const map = mapData as GeographicMap;

describe('MapLayerService', () => {
  it('never renders modern roads, buildings or land-use as 1077 geometry', () => {
    const historical = getEraVisualLayers(map, 'ly_1077');
    expect(historical.roads).toEqual([]);
    expect(historical.footpaths).toEqual([]);
    expect(historical.buildings).toEqual([]);
    expect(historical.landuse).toEqual([]);
    expect(historical.waterIsModernReference).toBe(true);
  });

  it('retains all OSM layers for the present-day map', () => {
    const present = getEraVisualLayers(map, 'present');
    expect(present.roads.length).toBeGreaterThan(0);
    expect(present.buildings.length).toBeGreaterThan(0);
    expect(present.waterIsModernReference).toBe(false);
  });
});
