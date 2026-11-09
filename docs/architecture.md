# Kiến trúc Sprint 02

## Luồng dữ liệu

```text
data/raw → build-game-map → data/generated + public/data/geographic-map.json
                                            ↓
public/data/*.json → validation → GameContent
                                  ↓
React UI ← typed events → GameSession ← typed commands → Phaser Scene
                                  ↓
                         versioned localStorage
```

- `GeographicService` chuyển đổi hai chiều WGS84 ↔ world pixel và tính khoảng cách theo tỷ lệ.
- `VillageScene` vẽ generated layers, sở hữu physics/camera/player và vùng tương tác.
- `MapPanel` chỉ đọc `GameContent`/snapshot; chọn điểm đến qua `GameSession`, không chạm internals của Phaser.
- `GameSession` là nguồn trạng thái nghiệp vụ duy nhất; `SaveService` validate và migrate save.

## Bản đồ và thời kỳ

World 2.052 × 1.832 px lớn hơn viewport phổ biến, camera follow người chơi. Hai era dùng cùng hình học và tọa độ; palette/lớp trình bày khác nhau. `ly_1077` luôn được gọi là lớp tái hiện diễn giải, không khẳng định công trình hiện đại tồn tại nguyên trạng trong lịch sử.

Runtime không gọi API bản đồ. Raw OSM và dữ liệu mốc được pipeline xác định chuyển thành JSON đóng gói. Công trình sinh vùng collision; ranh world ngăn người chơi rời phạm vi.

## Lưu trữ và triển khai

Key localStorage: `tho-duc-time-journey:save`, schema hiện tại v2. Vite base `/ThoDucQueToi/`; GitHub Pages nhận artifact `dist` từ workflow. Không có backend hoặc dữ liệu nhận diện cá nhân.
