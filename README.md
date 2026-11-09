# Thọ Đức – Dấu Ấn Thời Gian

Vertical slice Sprint 01 của game khám phá 2D chạy trực tiếp trên trình duyệt. Người chơi di chuyển trong một bản đồ làng **hoàn toàn minh họa**, trò chuyện với nhân vật hư cấu, khám phá ba điểm nội dung placeholder và mở cổng sang cảnh năm 1077 được diễn giải dưới dạng tái hiện kỹ thuật.

> Dự án không khẳng định vị trí địa lý, kiến trúc hoặc dữ kiện lịch sử về Thọ Đức. Tọa độ địa lý được để `null`; dữ liệu chỉ được bổ sung sau khi có nguồn đã kiểm tra.

## Yêu cầu

- Node.js 22.12 trở lên (CI dùng Node 24)
- npm 11 trở lên

## Chạy tại máy

```bash
npm ci
npm run dev
```

Mở URL do Vite in ra. Không cần backend, tài khoản hay biến môi trường.

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

`test:e2e` build bản production, phục vụ dưới subpath `/tho-duc-time-journey/` và chạy trên cấu hình desktop lẫn mobile Chromium.

## Điều khiển

- Desktop: WASD hoặc phím mũi tên để di chuyển; `E`/Space để tương tác; `T` để đổi thời kỳ sau khi mở khóa.
- Mobile: cụm phím định hướng và nút **Tương tác** trên màn hình.
- `Escape`: đóng hội thoại hoặc panel đang mở.

## Kiến trúc

- `src/game`: Phaser runtime, va chạm, camera, chuyển động và biểu diễn scene.
- `src/services`: trạng thái phiên chơi, nhiệm vụ, thời kỳ, registry và localStorage.
- `src/features`: panel React cho hội thoại, nhật ký và điều khiển.
- `src/shared`: event/command typed, types và validation.
- `public/data`: nội dung JSON bên ngoài runtime code.

React không chỉnh trực tiếp scene Phaser. Hai phía giao tiếp qua `TypedEventBus`; trạng thái nghiệp vụ nằm ở `GameSession` và các service thuần TypeScript. Xem [docs/architecture.md](docs/architecture.md).

## Build và triển khai

```bash
npm run build
npm run preview
```

Vite build vào `dist/` với base path `/tho-duc-time-journey/`. Workflow `.github/workflows/deploy.yml` build và triển khai artifact lên GitHub Pages khi push vào `main`. Trong repository GitHub, bật **Settings → Pages → Source: GitHub Actions**.

## Giới hạn Sprint 01

- Bản đồ, hình khối, vị trí và cảnh 1077 là placeholder kỹ thuật, không phải phục dựng lịch sử.
- Chưa có âm thanh, ảnh khảo sát, bản đồ Tiled hoặc tap-to-move.
- Lưu dữ liệu chỉ ở localStorage của từng trình duyệt; không đồng bộ nhiều thiết bị.
- Các thời kỳ Lê, 1845 và thế kỷ XX đã đăng ký nhưng chưa mở.

Tài liệu liên quan: [thiết kế game](docs/game-design.md), [quy tắc nội dung](docs/content-guidelines.md), [schema](docs/data-schema.md), [nghiệm thu Sprint 01](docs/sprint-01-acceptance.md).
