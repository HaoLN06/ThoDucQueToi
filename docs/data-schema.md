# Data schema

## Heritage location

```ts
interface HeritageLocation {
  id: 'dinh_tho_duc' | 'den_can_vang' | 'chua_thap_linh';
  name: string;
  category: 'communal_house' | 'temple' | 'pagoda';
  categoryLabel: string;
  verification: {
    status: VerificationStatus;
    sources: string[];
    note: string;
  };
  geography: { lat: number | null; lng: number | null };
  world: {
    mapId: string;
    x: number;
    y: number;
    positionType: 'placeholder';
  };
  availableEras: EraId[];
  description: string;
}
```

`geography` luôn là tọa độ địa lý WGS84 hoặc `null`. `world` luôn là pixel nội bộ; không được sao chép giá trị giữa hai nhóm.

## Era

ID hợp lệ: `present`, `ly_1077`, `le`, `nguyen_1845`, `twentieth_century`. Chỉ hai ID đầu có `enabled: true` trong Sprint 01.

## Save v1

```ts
interface GameState {
  schemaVersion: 1;
  player: { mapId: 'placeholder_village'; x: number; y: number };
  activeEra: EraId;
  quest: {
    guideSpoken: boolean;
    visitedLocations: LocationId[];
    portalUsed: boolean;
    completed: boolean;
  };
  discoveredLocations: LocationId[];
  started: boolean;
}
```

Validation runtime kiểm tra version, enum, mảng ID, kiểu boolean và tọa độ hữu hạn trước khi chấp nhận save.
