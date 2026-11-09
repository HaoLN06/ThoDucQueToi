import type { HeritageLocation, LocationId } from '../shared/types/content';

export class LocationRegistry {
  private readonly locations: Map<LocationId, HeritageLocation>;

  constructor(items: HeritageLocation[]) {
    this.locations = new Map(items.map((item) => [item.id, item]));
  }

  get(id: LocationId): HeritageLocation {
    const location = this.locations.get(id);
    if (!location) throw new Error(`Không tìm thấy địa điểm: ${id}`);
    return location;
  }

  all(): HeritageLocation[] {
    return [...this.locations.values()];
  }
}
