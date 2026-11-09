# Kế hoạch Sprint 02 - Geographic Foundation

## Hiện trạng Sprint 01

- Phaser `VillageScene` đang dựng trực tiếp map hình học 1200×800, marker và collision.
- React UI, dialogue, journal, mobile controls và timeline giao tiếp với game qua event bus typed.
- `GameSession`, quest và era service độc lập với renderer, có thể giữ nguyên phần lớn.
- Nội dung được nạp từ JSON và đã có trường geography/world nhưng geography đang `null`.
- Save schema v1 khóa `mapId = placeholder_village`; cần migration thay vì làm mất tiến trình.
- Vite/Playwright đã dùng GitHub Pages base path `/ThoDucQueToi/`.

## Phạm vi triển khai

1. Thu thập có giới hạn dữ liệu OSM cho một development extent đã review; lưu raw source, timestamp, license và truy vấn.
2. Lập hồ sơ ba địa điểm. Chỉ dùng tọa độ có nguồn; vị trí chưa đủ chứng cứ sẽ giữ `provisional` hoặc `unverified` và hiển thị rõ.
3. Thêm phép chiếu Web Mercator cục bộ, chuyển đổi hai chiều WGS84 ↔ world pixel và unit test round-trip/bounds.
4. Tạo pipeline deterministic raw → validate → normalize → generated map JSON; không render GeoJSON thô mỗi frame.
5. Tách map loader/renderer/layers, thay map hình học Sprint 01 bằng generated roads, water, land use và building blocks.
6. Thêm minimap/map panel React, legend, chọn đích và khoảng cách xấp xỉ trong world pixel.
7. Migrate save v1 sang v2, bảo toàn quest/discovered/era và đưa player về spawn hợp lệ trên map mới.
8. Giữ hai era trên cùng hệ tọa độ; cảnh 1077 luôn mang nhãn tái dựng dựa trên vị trí tham chiếu hiện nay.
9. Mở rộng unit/E2E tests, chạy full quality gates và chụp lại desktop/mobile.

## Thành phần tái sử dụng

- `GameSession`, `QuestService`, `EraService`, `LocationRegistry`.
- Typed command/event bridge giữa React và Phaser.
- Start screen, dialogue/location panels, journal, timeline, mobile controls.
- CI, production build và GitHub Pages workflow.

## Rủi ro và biện pháp

- **Không tìm được ranh giới làng tin cậy:** dùng development extent dạng bounding box, không tạo polygon hành chính.
- **Thiếu tọa độ di sản có nguồn:** giữ marker provisional với nguồn/độ chính xác rõ ràng; không nâng thành verified.
- **OSM coverage không đầy đủ:** chỉ dùng geometry có trong extract; scenery bổ sung phải ghi là stylization.
- **Map mới làm quest quá dài:** chọn scale/spawn và tốc độ để vertical slice vẫn ngắn, nhưng không làm sai quan hệ tương đối.
- **Save cũ đặt player ngoài map:** migration bảo toàn tiến trình và đưa player về spawn hợp lệ.
- **Pages chưa được bật:** không thay đổi gameplay để lách deployment; ghi rõ blocker và không push theo yêu cầu người dùng.

## Điều kiện dừng

Nếu nguồn không đủ để xác lập cả ba vị trí, Sprint 02 sẽ được báo cáo là geographically partial. Không bịa tọa độ, ranh giới hoặc dữ kiện lịch sử để đạt acceptance.
