import { createInitialState, SAVE_SCHEMA_VERSION, type GameState } from '../shared/types/state';
import type { EraId, LocationId } from '../shared/types/content';

export const SAVE_KEY = 'tho-duc-time-journey:save';
const locationIds = new Set<LocationId>(['dinh_tho_duc', 'den_can_vang', 'chua_thap_linh']);
const eraIds = new Set<EraId>(['present', 'ly_1077', 'le', 'nguyen_1845', 'twentieth_century']);

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class SaveService {
  constructor(private readonly storage: StorageLike) {}

  hasValidSave(): boolean {
    return this.load() !== null;
  }

  save(state: GameState): void {
    this.storage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  load(): GameState | null {
    const raw = this.storage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw) as Partial<GameState>;
      if (value.schemaVersion !== SAVE_SCHEMA_VERSION || !value.player || !value.quest) return null;
      if (value.player.mapId !== 'placeholder_village' || !Number.isFinite(value.player.x) || !Number.isFinite(value.player.y)) return null;
      if (!eraIds.has(value.activeEra as EraId)) return null;
      if (!Array.isArray(value.discoveredLocations) || !value.discoveredLocations.every((id) => locationIds.has(id))) return null;
      if (!Array.isArray(value.quest.visitedLocations) || !value.quest.visitedLocations.every((id) => locationIds.has(id))) return null;
      if (typeof value.quest.guideSpoken !== 'boolean' || typeof value.quest.portalUsed !== 'boolean' || typeof value.quest.completed !== 'boolean') return null;
      return value as GameState;
    } catch {
      return null;
    }
  }

  reset(): GameState {
    this.storage.removeItem(SAVE_KEY);
    return createInitialState();
  }
}
