# Quy tắc nội dung và kiểm chứng

## Nguyên tắc

- Không tự suy diễn lịch sử, địa lý, niên đại, kiến trúc hoặc độ chính xác.
- Mỗi claim phải có nguồn; truyền khẩu và lớp 1077 phải ghi rõ bản chất diễn giải.
- Raw source bất biến, tách khỏi generated output; không dùng Google imagery hoặc nguồn không rõ giấy phép.
- Không trình bày khoảng cách minimap như chỉ dẫn đường thực địa.

## Trạng thái

- `verified`: đã có nguồn đủ mạnh và kiểm tra phù hợp với claim.
- `provisional`: có nguồn nhưng độ chính xác/đồng nhất đối tượng còn cần xác minh.
- `unverified`: chưa kiểm tra.
- `placeholder`: chỉ phục vụ kỹ thuật.

Ba mốc Sprint 02 là `provisional`: Thông tư 05/2018/TT-BTNMT gọi đây là tọa độ vị trí tương đối và không công bố sai số mét. Riêng “chùa Thọ Đức”/“Chùa Tháp Linh” còn cần xác minh đồng nhất tên.

## Quy trình cập nhật

1. Ghi URL, giấy phép, ngày truy cập và phạm vi sử dụng vào manifest nguồn.
2. Lưu dữ liệu thô, chạy pipeline/validation, review diff generated.
3. Gán trạng thái và ghi chú bất định trong nội dung game-facing.
4. Chạy unit/E2E và chỉ nâng trạng thái khi có bằng chứng mới.
