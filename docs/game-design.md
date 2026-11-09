# Thiết kế game – vertical slice

## Vòng lặp chính

1. Gặp **Người dẫn chuyện** (nhân vật hư cấu).
2. Tự do khám phá ba marker theo thứ tự bất kỳ.
3. Mỗi điểm mở panel trung lập, nêu rõ trạng thái chưa kiểm chứng.
4. Khi đủ ba điểm và đã trò chuyện, cổng thời gian mở.
5. Qua cổng để xem cảnh 1077 tái hiện minh họa và hoàn tất nhiệm vụ.

Không có điểm số hay phần thưởng lặp. Cùng một marker chỉ ghi nhận một lần.

## Không gian

Map 1200×800 pixel gồm đường đi, mảng xanh, một nhà minh họa, ao, cây cản đường, NPC, ba marker và cổng. Bố cục được chọn để kiểm tra kỹ thuật di chuyển/va chạm, không mô phỏng địa lý thật.

## Trạng thái hình ảnh

- Hiện tại: xanh sáng, đường màu kem, marker di sản hiện diện.
- 1077: bảng màu đất trầm; marker công trình hiện đại bị ẩn; nhãn UI luôn ghi “Tái hiện”.
- Player đổi texture giữa idle và walking.

## Khả năng tiếp cận

Các action React có nhãn, focus ring, điều khiển bàn phím, touch target lớn và Escape để đóng. Trạng thái không chỉ truyền đạt bằng màu; objective dùng ký hiệu và chữ. `prefers-reduced-motion` tắt chuyển động trang trí.
