import type { EraId, GeographicMap, MapFeature, MapPoint } from '../shared/types/content';

const distanceToSegment = (point: MapPoint, start: MapPoint, end: MapPoint): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
};

const pointInPolygon = (point: MapPoint, polygon: MapPoint[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
};

const polygonBlocksCircle = (point: MapPoint, radius: number, polygon: MapPoint[]): boolean => {
  if (pointInPolygon(point, polygon)) return true;
  return polygon.some((vertex, index) => distanceToSegment(point, vertex, polygon[(index + 1) % polygon.length]) <= radius);
};

export class NavigationService {
  constructor(private readonly map: GeographicMap) {}

  isBlocked(point: MapPoint, era: EraId, radius = 18): boolean {
    const { width, height } = this.map.projection.world;
    if (point.x < radius || point.y < radius || point.x > width - radius || point.y > height - radius) return true;
    if (this.waterBlocks(point, radius)) return true;
    if (era === 'present' && this.map.layers.buildings.some((feature) => feature.points.length >= 3 && polygonBlocksCircle(point, radius, feature.points))) return true;
    return false;
  }

  canMove(from: MapPoint, to: MapPoint, era: EraId, radius = 18): boolean {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(6, radius / 2)));
    for (let index = 1; index <= steps; index++) {
      const t = index / steps;
      if (this.isBlocked({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }, era, radius)) return false;
    }
    return true;
  }

  canReach(start: MapPoint, target: MapPoint, era: EraId, tolerance = 80, step = 36): boolean {
    const key = (x: number, y: number) => `${Math.round(x / step)},${Math.round(y / step)}`;
    const queue: MapPoint[] = [start];
    const visited = new Set([key(start.x, start.y)]);
    const directions = [[step, 0], [-step, 0], [0, step], [0, -step], [step, step], [step, -step], [-step, step], [-step, -step]];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      if (Math.hypot(current.x - target.x, current.y - target.y) <= tolerance) return true;
      for (const [dx, dy] of directions) {
        const next = { x: current.x + dx, y: current.y + dy };
        const nextKey = key(next.x, next.y);
        if (!visited.has(nextKey) && this.canMove(current, next, era)) { visited.add(nextKey); queue.push(next); }
      }
    }
    return false;
  }

  private waterBlocks(point: MapPoint, radius: number): boolean {
    return this.map.layers.water.some((feature) => {
      const waterRadius = feature.kind === 'river' ? 15 : 8;
      const first = feature.points[0];
      const last = feature.points.at(-1);
      const closed = feature.points.length >= 4 && first && last && first.x === last.x && first.y === last.y;
      if (closed && polygonBlocksCircle(point, radius, feature.points)) return true;
      return this.featureSegments(feature).some(([start, end]) => distanceToSegment(point, start, end) <= radius + waterRadius);
    });
  }

  private featureSegments(feature: MapFeature): Array<[MapPoint, MapPoint]> {
    return feature.points.slice(1).map((point, index) => [feature.points[index], point]);
  }
}
