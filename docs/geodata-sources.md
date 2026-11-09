# Nguồn dữ liệu địa lý Sprint 02

## Phạm vi và phép chiếu

- Bounding box: `106.018,21.238,106.035,21.252` (WGS84 / EPSG:4326).
- Nguồn hình học: OpenStreetMap Map API, tệp `data/raw/osm/tho-duc-map.osm`, tải ngày 2026-11-09.
- Giấy phép: Open Database License 1.0; attribution bắt buộc `© OpenStreetMap contributors`.
- Phép chiếu runtime: local Web Mercator, gốc tây-nam `21.238, 106.018`, tỷ lệ `1 px = 1 m`, padding 80 px, hướng bắc ở phía trên.
- Kích thước world sinh ra: 2.052 × 1.832 px.

## Mốc di sản

Tọa độ lấy từ bảng “tọa độ vị trí tương đối của đối tượng” trong Thông tư 05/2018/TT-BTNMT, không phải kết quả đo đạc hiện trường:

| Điểm | Tọa độ nguồn | Trạng thái |
| --- | --- | --- |
| Đình Thọ Đức | 21°14'39\"N, 106°01'19\"E | provisional |
| Đền Can Vang | 21°14'46\"N, 106°01'55\"E | provisional |
| Chùa Tháp Linh | 21°14'48\"N, 106°01'23\"E | provisional; nguồn tọa độ ghi “chùa Thọ Đức” |

Không có độ chính xác mét được công bố, vì vậy trường `accuracyMeters` để `null`. Tên chính thức và cấp xếp hạng được đối chiếu với danh mục di tích xã Tam Đa năm 2026. Chùa cần xác minh thêm việc đồng nhất tên “chùa Thọ Đức” và “Chùa Tháp Linh”.

## Nguồn

- [OpenStreetMap Map API extract](https://api.openstreetmap.org/api/0.6/map?bbox=106.018,21.238,106.035,21.252)
- [Thông tư 05/2018/TT-BTNMT](https://vupc.mae.gov.vn/Data/files/05-2018-tt-btnmt.pdf)
- [Danh mục di tích xã Tam Đa](https://tamda.bacninh.gov.vn/news/-/details/65655/danh-muc-di-tich-theo-on-vi-hanh-chinh-xa-tam-a-moi-88589736)
- [Trích ngang phòng tuyến sông Như Nguyệt](https://svhttdl.bacninh.gov.vn/documents/188850/43351101/1._Trich_ngang_phong_tuyen_song_Nhu_Nguyet.pdf)

## Giới hạn

OSM có thể thiếu hoặc lệch đối tượng; hình học được giản lược để hiển thị game. Khoảng cách minimap là khoảng cách thẳng theo tỷ lệ world, không phải đường đi bộ. Không sử dụng dữ liệu Google, ảnh vệ tinh hoặc nguồn không rõ giấy phép.
