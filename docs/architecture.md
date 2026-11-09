# Kiến trúc Sprint 01

## Mục tiêu

Giữ vertical slice nhỏ, chạy hoàn toàn phía client, nhưng tách runtime game khỏi UI và nghiệp vụ để có thể thay bản đồ placeholder bằng Tiled JSON sau này.

## Luồng dữ liệu

```text
public/data/*.json → validation → GameContent
                                ↓
React UI ← typed events → GameSession ← typed commands → Phaser Scene
                            ↓
                      versioned localStorage
```

- `VillageScene` sở hữu sprite, physics body, camera và vùng tương tác.
- `GameSession` là nguồn trạng thái nghiệp vụ duy nhất, phát snapshot bất biến cho React/Phaser.
- `QuestService`, `EraService` và `SaveService` không phụ thuộc DOM hoặc Phaser nên được unit test trực tiếp.
- `TypedEventBus` ngăn React chạm vào internals của scene và tránh vòng đồng bộ hai chiều.

## Quyết định engine

Phaser được khóa ở `3.90.0`, bản cuối của nhánh 3. Phiên bản Phaser 4 mới nhất không được chọn vì đặc tả ưu tiên Phaser 3. Quyết định được xác nhận bằng typecheck, production build và Playwright smoke tests; nếu một kiểm tra thất bại, kết quả thực tế được ghi tại `sprint-01-acceptance.md`.

## Bản đồ

Bản đồ hiện dùng primitive hình học để không đưa asset không rõ giấy phép vào repository. Tọa độ `world.x/y` là pixel trong map `placeholder_village`; chúng không phải latitude/longitude. Lớp scene giữ logic marker độc lập để sau này đổi sang object layers của Tiled.

## Chuyển thời kỳ

Chỉ một `VillageScene` và một player tồn tại. Đổi era cập nhật state rồi dựng lại riêng `eraLayer`; physics bodies, player và camera được giữ nguyên. Marker hiện đại được ẩn ở cảnh 1077 để không ngầm khẳng định công trình tồn tại cùng vị trí hay kiến trúc.

## Lưu trữ

Key localStorage: `tho-duc-time-journey:save`. Schema hiện tại là version 1. Save không chứa thông tin nhận diện cá nhân. Dữ liệu sai version, JSON hỏng, enum/tọa độ sai bị bỏ qua an toàn.

## Cấu trúc tinh chỉnh

So với cây đề xuất, `src/content/loadContent.ts` được bổ sung làm cổng nạp/validate JSON và các panel nhỏ nằm ngay trong `features`. Map placeholder chưa tách thành file Tiled vì Sprint 01 dùng primitive; quyết định này giữ vertical slice nhẹ và không cản việc thay thế sau đó.
