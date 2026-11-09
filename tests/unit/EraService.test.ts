import { describe, expect, it } from 'vitest';
import { EraService } from '../../src/services/EraService';
import { createInitialState } from '../../src/shared/types/state';

describe('EraService', () => {
  it('đổi thời kỳ mà giữ nguyên vị trí và tiến trình', () => {
    const state = createInitialState();
    state.player = { ...state.player, x: 482, y: 311 };
    state.quest.guideSpoken = true;
    const changed = EraService.switchEra(state, 'ly_1077');
    expect(changed.activeEra).toBe('ly_1077');
    expect(changed.player).toEqual(state.player);
    expect(changed.quest).toEqual(state.quest);
  });

  it('không cho chuyển sang thời kỳ chưa triển khai', () => {
    const state = createInitialState();
    expect(EraService.switchEra(state, 'le')).toBe(state);
  });
});
