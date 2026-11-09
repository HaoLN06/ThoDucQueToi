import type { LocationId } from '../shared/types/content';
import type { QuestProgress } from '../shared/types/state';

export class QuestService {
  static talkToGuide(progress: QuestProgress): QuestProgress {
    if (progress.guideSpoken) return progress;
    return { ...progress, guideSpoken: true };
  }

  static visitLocation(progress: QuestProgress, locationId: LocationId): QuestProgress {
    if (progress.visitedLocations.includes(locationId)) return progress;
    return { ...progress, visitedLocations: [...progress.visitedLocations, locationId] };
  }

  static isPortalUnlocked(progress: QuestProgress): boolean {
    return progress.guideSpoken && progress.visitedLocations.length === 3;
  }

  static usePortal(progress: QuestProgress): QuestProgress {
    if (!this.isPortalUnlocked(progress) || progress.portalUsed) return progress;
    return { ...progress, portalUsed: true, completed: true };
  }
}
