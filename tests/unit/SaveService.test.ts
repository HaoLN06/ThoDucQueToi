import { describe, expect, it } from 'vitest';
import { SaveService, SAVE_KEY, type StorageLike } from '../../src/services/SaveService';
import { createInitialState } from '../../src/shared/types/state';

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe('SaveService', () => {
  it('tuần tự hóa và nạp lại đúng dữ liệu', () => {
    const storage = new MemoryStorage();
    const saves = new SaveService(storage);
    const state = createInitialState();
    state.started = true;
    state.activeEra = 'ly_1077';
    state.discoveredLocations = ['den_can_vang'];
    saves.save(state);
    expect(saves.load()).toEqual(state);
  });

  it('không làm ứng dụng vỡ với dữ liệu hỏng', () => {
    const storage = new MemoryStorage();
    const saves = new SaveService(storage);
    storage.setItem(SAVE_KEY, '{khong-phai-json');
    expect(saves.load()).toBeNull();
    storage.setItem(SAVE_KEY, JSON.stringify({ schemaVersion: 999 }));
    expect(saves.load()).toBeNull();
  });

  it('xóa tiến trình về trạng thái ban đầu', () => {
    const storage = new MemoryStorage();
    const saves = new SaveService(storage);
    saves.save(createInitialState());
    expect(saves.reset()).toEqual(createInitialState());
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it('migrate save Sprint 01 và giữ nguyên tiến trình nhiệm vụ', () => {
    const storage = new MemoryStorage();
    const saves = new SaveService(storage);
    storage.setItem(SAVE_KEY, JSON.stringify({
      schemaVersion: 1,
      player: { mapId: 'placeholder_village', x: 430, y: 270 },
      activeEra: 'present',
      quest: { guideSpoken: true, visitedLocations: ['dinh_tho_duc'], portalUsed: false, completed: false },
      discoveredLocations: ['dinh_tho_duc'], started: true,
    }));
    const migrated = saves.load();
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.player.mapId).toBe('tho_duc_geographic_v1');
    expect(migrated?.quest.visitedLocations).toEqual(['dinh_tho_duc']);
    expect(migrated?.navigationTarget).toBeNull();
  });
});
