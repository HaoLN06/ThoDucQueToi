import { describe, expect, it } from 'vitest';
import { GeographicService } from '../../src/services/GeographicService';
import type { GeographicMap } from '../../src/shared/types/content';

const projection: GeographicMap['projection'] = {
  type: 'local-web-mercator', crs: 'EPSG:4326',
  origin: { lat: 21.238, lng: 106.018 },
  bounds: { west: 106.018, south: 21.238, east: 106.035, north: 21.252 },
  pixelsPerMeter: 1, padding: 80, world: { width: 2052, height: 1832 },
};

describe('GeographicService', () => {
  it('round-trips WGS84 and world coordinates', () => {
    const service = new GeographicService(projection);
    const source = { lat: 21.244166667, lng: 106.021944444 };
    const result = service.toGeographic(service.toWorld(source.lat, source.lng));
    expect(result.lat).toBeCloseTo(source.lat, 8);
    expect(result.lng).toBeCloseTo(source.lng, 8);
  });

  it('uses the configured metric world scale', () => {
    const service = new GeographicService(projection);
    expect(service.distanceMeters({ x: 100, y: 100 }, { x: 400, y: 500 })).toBe(500);
  });
});
