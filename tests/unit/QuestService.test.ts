import { describe, expect, it } from 'vitest';
import { QuestService } from '../../src/services/QuestService';
import type { QuestProgress } from '../../src/shared/types/state';

const fresh = (): QuestProgress => ({ guideSpoken: false, visitedLocations: [], portalUsed: false, completed: false });

describe('QuestService', () => {
  it('cho phép thăm ba địa điểm theo thứ tự bất kỳ', () => {
    let progress = QuestService.talkToGuide(fresh());
    progress = QuestService.visitLocation(progress, 'chua_thap_linh');
    progress = QuestService.visitLocation(progress, 'dinh_tho_duc');
    progress = QuestService.visitLocation(progress, 'den_can_vang');
    expect(QuestService.isPortalUnlocked(progress)).toBe(true);
    expect(QuestService.usePortal(progress)).toMatchObject({ portalUsed: true, completed: true });
  });

  it('không mở cổng khi chưa nói chuyện với người dẫn chuyện', () => {
    let progress = fresh();
    (['dinh_tho_duc', 'den_can_vang', 'chua_thap_linh'] as const).forEach((id) => {
      progress = QuestService.visitLocation(progress, id);
    });
    expect(QuestService.isPortalUnlocked(progress)).toBe(false);
    expect(QuestService.usePortal(progress)).toBe(progress);
  });

  it('ghi nhận lại địa điểm theo cách idempotent', () => {
    const once = QuestService.visitLocation(fresh(), 'dinh_tho_duc');
    const twice = QuestService.visitLocation(once, 'dinh_tho_duc');
    expect(twice).toBe(once);
    expect(twice.visitedLocations).toEqual(['dinh_tho_duc']);
  });
});
