# Thọ Đức – Dấu Ấn Thời Gian

Mini game khám phá 2D chạy trong trình duyệt. Sprint 02 thay bản đồ hình học của Sprint 01 bằng nền địa lý khái quát của thôn Thọ Đức, xã Tam Đa, Bắc Ninh, đồng thời giữ nguyên nhiệm vụ, hai thời kỳ, điều khiển và tiến trình đã lưu.

> Bản đồ dùng dữ liệu OpenStreetMap và tọa độ vị trí tương đối trong Thông tư 05/2018/TT-BTNMT. Ba vị trí di tích đều mang trạng thái **tạm xác định**, không dùng để dẫn đường hoặc thay thế khảo sát thực địa. Lớp năm 1077 là tái hiện diễn giải trên cùng hệ tọa độ hiện tại.

## Chạy tại máy

Yêu cầu Node.js 22.12+ và npm 11+.

```bash
npm ci
npm run dev
```

Ứng dụng không cần backend, tài khoản hoặc khóa API. Tất cả tài nguyên bản đồ được đóng gói cùng build.

## Pipeline bản đồ

```bash
npm run map:build
npm run map:validate
```

- Nguồn thô được giữ trong `data/raw`; không sửa trực tiếp để phục vụ game.
- `scripts/build-game-map.mjs` chiếu WGS84 sang hệ mét Web Mercator cục bộ rồi sang world pixel.
- Kết quả xác định được ghi vào `data/generated/tho-duc-game-map.json` và `public/data/geographic-map.json`.
- Attribution OSM được hiển thị trong minimap.

Chi tiết nguồn, phạm vi và sai số: [docs/geodata-sources.md](docs/geodata-sources.md).

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

`test:e2e` phục vụ production build tại `/ThoDucQueToi/` trên desktop và mobile Chromium. `npm run build` tự chạy lại pipeline bản đồ và kiểm tra dữ liệu.

## Điều khiển và bản đồ

- Desktop: WASD/phím mũi tên để đi; `E`/Space để tương tác; `T` để đổi thời kỳ sau khi mở khóa.
- Mobile: cụm phím hướng và nút **Tương tác**.
- Minimap cho biết người chơi, ba di tích, đường/lối đi và cho phép chọn điểm đến để xem hướng, khoảng cách theo tỷ lệ bản đồ.
- Save Sprint 01 được tự động nâng từ schema 1 lên schema 2; nhiệm vụ, khám phá và thời kỳ được giữ, còn vị trí người chơi chuyển về điểm xuất phát an toàn trên bản đồ mới.

## Cấu trúc

- `data/raw`: dữ liệu nguồn và provenance.
- `data/generated`: đầu ra pipeline dùng để kiểm tra/review.
- `public/data`: nội dung runtime đã đóng gói.
- `src/game`: Phaser scene, camera, va chạm và biểu diễn hai thời kỳ.
- `src/services`: phép chiếu, trạng thái phiên, save migration, nhiệm vụ và thời kỳ.
- `src/features/map`: minimap, chú giải và chọn điểm đến.

## Triển khai

Vite build vào `dist/` với base path `/ThoDucQueToi/`. Workflow `.github/workflows/deploy.yml` triển khai GitHub Pages khi có thay đổi trên `main` hoặc chạy thủ công. URL dự kiến: `https://haoln06.github.io/ThoDucQueToi/`.

Sprint này chưa có khảo sát thực địa, ảnh vệ tinh, dữ liệu thửa đất, phục dựng khảo cổ hay dẫn đường theo mạng đường. Xem [kế hoạch Sprint 02](docs/sprint-02-plan.md) và [nghiệm thu Sprint 02](docs/sprint-02-acceptance.md).
