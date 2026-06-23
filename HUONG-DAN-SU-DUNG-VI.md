# HƯỚNG DẪN SỬ DỤNG — UU9体育直播站

> Tài liệu dành cho người vận hành và streamer.

---

## 0. Ba vai trò

| Vai trò | Trang dùng | Làm gì |
|---|---|---|
| Người xem | `index.html`, `live.html` | Xem trực tiếp & chat |
| Streamer | `go-live.html` | Lên sóng bằng webcam |
| Quản trị | `admin.html` | Tạo phòng, quản quảng cáo |

---

## 1. Người xem dùng thế nào

1. Mở trang chủ, xem các khu: Đang trực tiếp, Tỷ số, Bảng xếp hạng, Tin nóng.
2. Bấm vào một phòng → vào `live.html`, video tự phát (HLS).
3. Chat bên phải: gõ chữ, bấm 😀 chọn 1 trong 100 icon để gửi.
4. Khách chưa đăng nhập xem thử **5 phút**, hết giờ sẽ mời đăng ký.
5. Đổi ngôn ngữ ở góc trên: 中文 / EN / VI / MS / ID.

---

## 2. Đăng ký – Đăng nhập

- Bấm "Đăng ký" góc trên → nhập email + mật khẩu (≥6 ký tự) → gửi.
- Nếu bật xác thực email (`REQUIRE_EMAIL_VERIFY=true` ở backend), nhập mã 6 số trong email.
- Đăng nhập xong xem không giới hạn.

---

## 3. Streamer lên sóng — `go-live.html`

1. Trang chủ bấm nút đỏ "Lên sóng", hoặc mở `go-live.html`.
2. Bấm "Mở camera" → trình duyệt xin quyền webcam → Cho phép (**bắt buộc HTTPS**).
   Hoặc bấm "Chia sẻ màn hình" để phát màn hình thay vì webcam.
3. Chọn bố cục: Tối giản / Đấu trường / Neon / Sân vận động / Phòng thu / Cổ điển.
4. Dán quảng cáo:
   - "Thêm chữ": nhập câu quảng cáo, chọn màu + cỡ chữ, **kéo** đặt bất kỳ đâu.
   - "Dải chữ chạy": chữ chạy ngang đáy (kiểu bảng tài trợ).
   - "Thêm Logo/ảnh": tải ảnh lên, kéo vào góc. **Nhấp đúp** để xóa phần tử.
5. Nhập tiêu đề + phân loại, bấm "Lên sóng" → bắt đầu đếm giờ + tạo link cho người xem.
6. "Lưu ảnh bìa" để chụp khung hình hiện tại làm bìa.

> ⚠️ Trang này chỉ **thu hình + xem trước**. Muốn người xem thấy thật, phải đẩy hình lên
> server media/CDN (WebRTC-WHIP hoặc RTMP→HLS). Riêng trang này không phát ra ngoài.

---

## 4. Trang quản trị — `admin.html`

1. Mở `admin.html`, nhập `ADMIN_TOKEN` (đặt trong `.env` của server) để đăng nhập.
2. **Tạo phòng live**: nhập tiêu đề, phân loại, tên streamer; chọn 1 trong 2 nguồn phát:
   - "Stream .m3u8": dán thẳng link HLS đầy đủ; hoặc
   - "Tencent stream name": chỉ điền tên luồng (vd `match001`), backend tự ký link.
   - "Allowed countries": vd `VN,MY,ID`; để trống = không giới hạn.
   - Tích "Published" thì người xem mới thấy. Bấm "Save".
3. **Quản quảng cáo**: chọn vị trí (home_top / live_below…), loại (ảnh/HTML), điền ảnh + link, trọng số, bật/tắt.
4. Danh sách có nút Sửa / Xóa / Xem.

---

## 5. Nội quy phòng live
Phía trên khung chat hiện nội quy: trò chuyện lịch sự, cấm lăng mạ, kỳ thị, spam, quảng cáo.

---

## 6. Đổi & thêm ngôn ngữ
Hiện có: 中文, EN, Tiếng Việt, Bahasa Melayu, Bahasa Indonesia.
Thêm ngôn ngữ mới: thêm 1 khối vào `DICT` trong `i18n.js` + thêm mã vào `LANGS` trong `config.js`.

---

## 7. Cần gì để lên thật
- Tên miền + SSL (SSL miễn phí Let's Encrypt, bắt buộc phải có).
- Backend chạy trên Railway/Render (xem `DEPLOY.md`).
- Nguồn video + CDN (Tencent...; cần **bản quyền** giải đấu).
- Dịch vụ email (khi cần gửi mã xác thực).
- Geo chặn cứng ở tầng CDN (theo yêu cầu hợp đồng bản quyền).

> Chi tiết kỹ thuật xem: `TONG-HOP.md`, `HUONG-DAN.md`, `DEPLOY.md`, `XEM-THU.md`.
