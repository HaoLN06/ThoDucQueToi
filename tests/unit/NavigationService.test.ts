import { describe, expect, it } from 'vitest';
import { NavigationService } from '../../src/services/NavigationService';
import type { GeographicMap } from '../../src/shared/types/content';
import mapData from '../../public/data/geographic-map.json';

const map = mapData as GeographicMap;
const navigation = new NavigationService(map);
const targets = [...map.heritage.map(({ world }) => world), map.interaction.guide, map.interaction.portal];

describe('NavigationService', () => {
  it.each(['present', 'ly_1077'] as const)('keeps every NPC, heritage site and portal reachable in %s', (era) => {
    targets.forEach((target) => expect(navigation.canReach(map.interaction.spawn, target, era), JSON.stringify(target)).toBe(true));
  });

  it('blocks water and exact building polygons without using oversized bounding boxes', () => {
    const water = map.layers.water[0].points[1];
    const building = map.layers.buildings[0].points;
    const buildingVertexBoundsCenter = {
      x: (Math.min(...building.map(({ x }) => x)) + Math.max(...building.map(({ x }) => x))) / 2,
      y: (Math.min(...building.map(({ y }) => y)) + Math.max(...building.map(({ y }) => y))) / 2,
    };
    expect(navigation.isBlocked(water, 'present')).toBe(true);
    expect(navigation.isBlocked(buildingVertexBoundsCenter, 'present')).toBe(true);
    expect(navigation.isBlocked(buildingVertexBoundsCenter, 'ly_1077')).toBe(false);
  });

  it('prevents tunnelling through a river during a long movement step', () => {
    const segment = map.layers.water[0].points;
    const middle = segment[Math.floor(segment.length / 2)];
    expect(navigation.canMove({ x: middle.x - 100, y: middle.y }, { x: middle.x + 100, y: middle.y }, 'present')).toBe(false);
  });

  it('blocks the interior of closed pond geometry', () => {
    const pondMap = structuredClone(map);
    pondMap.layers.water.push({ id: 'test-pond', name: 'Ao kiểm thử', kind: 'pond', points: [
      { x: 1100, y: 1100 }, { x: 1200, y: 1100 }, { x: 1200, y: 1200 }, { x: 1100, y: 1200 }, { x: 1100, y: 1100 },
    ] });
    expect(new NavigationService(pondMap).isBlocked({ x: 1150, y: 1150 }, 'present')).toBe(true);
  });
});
