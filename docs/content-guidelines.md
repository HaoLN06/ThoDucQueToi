# Quy tắc nội dung và kiểm chứng

## Nguyên tắc

- Không tự suy diễn lịch sử, địa lý, niên đại hoặc kiến trúc.
- Không biến truyền khẩu thành sự kiện đã được xác minh.
- Mỗi claim tương lai phải có `sources` chứa ID nguồn đã kiểm tra.
- Khi thiếu nguồn, dùng mô tả trung lập và trạng thái `placeholder`/`unverified`.
- Không đặt công trình hiện đại vào cảnh lịch sử nếu chưa có chứng cứ.

## Trạng thái

- `verified`: có bằng chứng đã kiểm tra.
- `oral_history`: lời kể/truyền thống địa phương, phải ghi rõ bản chất.
- `interpretive`: diễn giải hoặc phục dựng, không trình bày như sự kiện chắc chắn.
- `placeholder`: chỉ phục vụ kỹ thuật.
- `unverified`: chưa kiểm tra.
- `location_unverified`: vị trí cụ thể chưa kiểm tra.

## Nguồn và tài sản

Không tạo nguồn giả. Ảnh, âm thanh và font chỉ được thêm khi có giấy phép phù hợp và thông tin attribution. Sprint 01 dùng hình học do ứng dụng tự vẽ và không tải asset/runtime CDN.

## Quy trình bổ sung nội dung

1. Product/historical reviewer cung cấp nguồn và phạm vi claim.
2. Gán ID nguồn, trạng thái và ghi chú bất định.
3. Kiểm tra schema và review nội dung.
4. Chỉ sau đó cập nhật mô tả game-facing và available eras.
