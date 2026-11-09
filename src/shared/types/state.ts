import type { EraId, LocationId } from './content';

export const SAVE_SCHEMA_VERSION = 1 as const;

export interface QuestProgress {
  guideSpoken: boolean;
  visitedLocations: LocationId[];
  portalUsed: boolean;
  completed: boolean;
}

export interface GameState {
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  player: { mapId: 'placeholder_village'; x: number; y: number };
  activeEra: EraId;
  quest: QuestProgress;
  discoveredLocations: LocationId[];
  started: boolean;
}

export const createInitialState = (): GameState => ({
  schemaVersion: SAVE_SCHEMA_VERSION,
  player: { mapId: 'placeholder_village', x: 150, y: 400 },
  activeEra: 'present',
  quest: { guideSpoken: false, visitedLocations: [], portalUsed: false, completed: false },
  discoveredLocations: [],
  started: false,
});
