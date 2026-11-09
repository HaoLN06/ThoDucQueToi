# Nghiệm thu Sprint 01

Ngày kiểm tra: 2026-11-09

## Automated checks

- `npm ci --no-audit --no-fund`: pass, cài sạch 134 packages.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run test`: pass, 4 files / 10 unit tests.
- `npm run build`: pass với Vite 8.3.6; artifact production được tạo trong `dist/`.
- `npm run test:e2e`: pass, 6/6 smoke tests trên desktop Chromium và cấu hình Pixel 7, phục vụ từ `/ThoDucQueToi/`.
- `npm run screenshots`: pass; ảnh nằm trong `docs/screenshots/`.

Build có cảnh báo bundle chính khoảng 1.44 MB (gzip khoảng 395 KB), phần lớn do Phaser. Đây không phải lỗi build nhưng là đầu việc tối ưu code splitting cho sprint sau.

## Functional checklist

- [x] Start screen, hướng dẫn và Continue theo save hợp lệ.
- [x] WASD/mũi tên và điều khiển cảm ứng tương đương joystick.
- [x] Va chạm, camera follow, idle/walk state.
- [x] Ba marker, NPC hư cấu và cổng thời gian.
- [x] Quest event-driven, idempotent, ba địa điểm không ép thứ tự.
- [x] Present và 1077 có ngoại hình khác; ba era còn lại đăng ký/disabled.
- [x] Journal, timeline, versioned localStorage, reset có xác nhận.
- [x] Nội dung game bằng tiếng Việt và placeholder được gắn nhãn.
- [x] Production build chạy đúng dưới repository subpath.
- [x] Browser smoke tests desktop/mobile không có uncaught error trong luồng được kiểm tra.
- [ ] Kiểm tra thủ công trên thiết bị Android/iPhone thật.
- [ ] URL GitHub Pages công khai được xác nhận.

## Known limitations

Xem README. Mục hiệu năng 60/30 FPS vẫn là target kỹ thuật cho đến khi có kết quả thiết bị thật.
