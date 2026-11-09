import type { EraId, LocationId } from './content';

export const SAVE_SCHEMA_VERSION = 2 as const;

export interface QuestProgress {
  guideSpoken: boolean;
  visitedLocations: LocationId[];
  portalUsed: boolean;
  completed: boolean;
}

export interface GameState {
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  player: { mapId: 'tho_duc_geographic_v1'; x: number; y: number };
  activeEra: EraId;
  quest: QuestProgress;
  discoveredLocations: LocationId[];
  started: boolean;
  navigationTarget: LocationId | null;
}

export const createInitialState = (): GameState => ({
  schemaVersion: SAVE_SCHEMA_VERSION,
  player: { mapId: 'tho_duc_geographic_v1', x: 673.7, y: 1181.49 },
  activeEra: 'present',
  quest: { guideSpoken: false, visitedLocations: [], portalUsed: false, completed: false },
  discoveredLocations: [],
  started: false,
  navigationTarget: null,
});
