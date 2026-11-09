import type { GeographicMap, MapPoint } from '../shared/types/content';

const EARTH_RADIUS = 6378137;

export class GeographicService {
  constructor(private readonly projection: GeographicMap['projection']) {}

  toWorld(lat: number, lng: number): MapPoint {
    const { origin, bounds, pixelsPerMeter, padding } = this.projection;
    const xMeters = EARTH_RADIUS * (lng - origin.lng) * Math.PI / 180;
    const yMeters = this.mercatorY(lat) - this.mercatorY(origin.lat);
    const maxY = this.mercatorY(bounds.north) - this.mercatorY(origin.lat);
    return { x: padding + xMeters * pixelsPerMeter, y: padding + (maxY - yMeters) * pixelsPerMeter };
  }

  toGeographic(point: MapPoint): { lat: number; lng: number } {
    const { origin, bounds, pixelsPerMeter, padding } = this.projection;
    const xMeters = (point.x - padding) / pixelsPerMeter;
    const maxY = this.mercatorY(bounds.north) - this.mercatorY(origin.lat);
    const y = this.mercatorY(origin.lat) + maxY - (point.y - padding) / pixelsPerMeter;
    return {
      lat: (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * 180 / Math.PI,
      lng: origin.lng + xMeters / EARTH_RADIUS * 180 / Math.PI,
    };
  }

  distanceMeters(a: MapPoint, b: MapPoint): number {
    return Math.hypot(a.x - b.x, a.y - b.y) / this.projection.pixelsPerMeter;
  }

  private mercatorY(lat: number): number {
    const radians = lat * Math.PI / 180;
    return EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + radians / 2));
  }
}
