import type { EraId } from '../shared/types/content';
import type { GameState } from '../shared/types/state';

export class EraService {
  static switchEra(state: GameState, target: EraId): GameState {
    if (target !== 'present' && target !== 'ly_1077') return state;
    if (state.activeEra === target) return state;
    return { ...state, activeEra: target };
  }

  static toggle(state: GameState): GameState {
    return this.switchEra(state, state.activeEra === 'present' ? 'ly_1077' : 'present');
  }
}
