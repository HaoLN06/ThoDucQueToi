# Nghiệm thu Sprint 02

## Tiêu chí

- [x] Kế hoạch được viết trước thay đổi runtime.
- [x] Dữ liệu nguồn và đầu ra sinh tách riêng; pipeline chạy xác định.
- [x] WGS84 → mét cục bộ → world pixel và phép nghịch đảo có unit test round-trip.
- [x] Scene lớn hơn viewport, camera follow và collision công trình.
- [x] Ba di tích có provenance và trạng thái provisional hiển thị rõ.
- [x] Hai thời kỳ dùng cùng hệ tọa độ; năm 1077 được ghi rõ là tái hiện.
- [x] Minimap desktop/mobile có người chơi, di tích, đường, chú giải, điểm đến và khoảng cách.
- [x] Save schema 1 được migrate, giữ tiến trình nhiệm vụ và khám phá.
- [x] Lớp 1077 loại bỏ đường, lối đi, công trình và land-use hiện đại; thủy hệ có nhãn mốc tham chiếu.
- [x] Navigation polygon/segment kiểm tra sông, ao kín và công trình; không dùng bounding box bao toàn bộ công trình.
- [x] E2E dùng bàn phím đi thực tế tới NPC, ba di tích và cổng; xác nhận đổi thời kỳ lặp lại không làm mất tiến trình.
- [x] E2E kiểm tra minimap/điều khiển trên Pixel 7.
- [x] Runtime không gọi API bản đồ hoặc backend.
- [ ] Kiểm chứng thực địa tọa độ, ranh giới và tên Chùa Tháp Linh.

## Lệnh xác minh

`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`.

Kết quả chạy cuối được ghi trong báo cáo bàn giao của Sprint 02; không đánh dấu kiểm chứng thực địa khi chưa có khảo sát.
