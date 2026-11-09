# Data schema

## Heritage location

`geography` chứa WGS84 và `accuracyMeters`; `null` nghĩa là nguồn không công bố độ chính xác. `world` là pixel được pipeline sinh từ phép chiếu, không nhập tay. `positionType` nhận `verified | provisional | unverified | placeholder`.

Ba ID hợp lệ: `dinh_tho_duc`, `den_can_vang`, `chua_thap_linh`. Map runtime là `tho_duc_geographic_v1`.

## Geographic map

`geographic-map.json` chứa metadata phép chiếu, world bounds, các layer `roads`, `footpaths`, `water`, `landuse`, `buildings`, ba mốc di sản và các điểm tương tác. Mỗi feature OSM giữ ID nguồn và danh sách world points.

## Save v2

```ts
interface GameState {
  schemaVersion: 2;
  player: { mapId: 'tho_duc_geographic_v1'; x: number; y: number };
  activeEra: EraId;
  quest: QuestProgress;
  discoveredLocations: LocationId[];
  navigationTarget: LocationId | null;
  started: boolean;
}
```

Save v1 được migrate: giữ era/nhiệm vụ/điểm đã khám phá, chuyển người chơi về spawn an toàn vì world cũ không cùng hệ tọa độ. JSON hỏng, enum sai hoặc tọa độ không hữu hạn bị từ chối.
