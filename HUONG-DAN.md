# HƯỚNG DẪN (Tiếng Việt) — LIVE ARENA

Tài liệu này dành riêng cho bạn (chủ dự án). Giao diện sản phẩm để **中文 (chính) + English (phụ)**; phần này tiếng Việt để bạn dễ làm việc với đội kỹ thuật.

---

## 1. Chạy thử ngay (chế độ demo, không cần API)

Mặc định `public/js/config.js` để `USE_MOCK: true` nên mở lên là chạy luôn với dữ liệu mẫu.

```bash
cd livearena
npm run dev        # mở http://localhost:3000
```

Lưu ý: phải mở qua HTTP (lệnh trên tự lo việc đó). **Đừng** nhấp đúp mở thẳng file `.html` — vì code dùng ES Modules, mở kiểu file:// trình duyệt sẽ chặn.

---

## 2. Cắm API thật mà đội của bạn mua (3 bước)

**Bước 1 — Chạy proxy giữ API key an toàn.**
API key KHÔNG được để ở frontend (ai mở trình duyệt cũng thấy). Tất cả request có key đi qua `server/proxy.js`.

```bash
cp .env.example .env     # điền địa chỉ + key của nhà cung cấp bạn mua
npm install
npm run proxy            # chạy ở http://localhost:8080
```

**Bước 2 — Tắt dữ liệu mẫu.** Mở `public/js/config.js`:
```js
USE_MOCK: false,
API_BASE: 'http://localhost:8080/api',   // khi lên production đổi thành tên miền proxy của bạn
```

**Bước 3 — Khớp tên trường dữ liệu.** Mỗi nhà cung cấp trả về cấu trúc khác nhau. Mở file adapter tương ứng trong `public/js/api/adapters/` và sửa chỗ có ghi chú `TODO` để ánh xạ trường của họ về "cấu trúc nội bộ". Đổi nhà cung cấp về sau **chỉ sửa đúng 1 file adapter**, không đụng phần còn lại.

Đó chính là lý do hệ thống tương thích được nhiều API: UI chỉ nói chuyện với `api/index.js` (API nội bộ), còn adapter làm cầu nối tới từng nhà cung cấp.

---

## 3. ⭐ Luồng "người xem vào phòng live" — rõ ràng từng bước

Đây là phần bạn hỏi. Cơ chế trong code đã viết sẵn:

```
[Trang chủ index.html]
      │  người xem bấm vào 1 thẻ phòng live
      ▼
live.html?room=<ID>           ← mỗi phòng có 1 ID riêng
      │  live.js đọc ID từ địa chỉ URL
      ▼
api.getRoom(ID)               ← gọi API nội bộ
      │  adapter trả về streamUrl dạng .m3u8 (HLS)
      ▼
hls.js gắn streamUrl vào thẻ <video>  → video bắt đầu phát
      │
      ▼
Kết nối chat (WebSocket) cho phòng đó
```

Điểm mấu chốt: **mỗi phòng live phải có một `streamUrl` là link HLS (`.m3u8`)**. Đó là thứ quyết định người xem "vào" được luồng. Nhà cung cấp streaming (hoặc hệ thống tự dựng RTMP→HLS của bạn) phải trả về link này; bạn map nó vào trường `streamUrl` trong `adapters/liveRooms.js`.

Cách hoạt động thực tế của một nền tảng live:
1. Streamer đẩy luồng lên server của bạn bằng **RTMP/SRT** (từ OBS, điện thoại, thiết bị phòng thu).
2. Server **transcode** ra nhiều độ phân giải và đóng gói thành **HLS (.m3u8)**.
3. Phát qua **CDN** để chịu được nhiều người xem cùng lúc.
4. API danh sách phòng trả về `streamUrl` (link .m3u8) cho mỗi phòng → website phát như trên.

Phần 1–3 là hạ tầng đội bạn tự dựng/mua. Phần 4 (website nhận link và phát) đã làm sẵn trong code này. Muốn đổi sang SDK player của nhà cung cấp khác, chỉ cần thay đoạn `playStream()` trong `public/js/pages/live.js`.

---

## 3b. ⭐ Streamer tự lên sóng bằng WEBCAM — trang `go-live.html`

Đã thêm sẵn trang **`public/go-live.html`** (logic ở `public/js/pages/golive.js`). Mở từ trang chủ bằng nút **开播 (Go Live)**. Streamer chỉ cần một cái webcam (hoặc share màn hình):

```
[go-live.html]
   bấm "开启摄像头 / Start camera"   → trình duyệt xin quyền webcam (getUserMedia)
   bấm "共享屏幕 / Share screen"     → phát màn hình thay vì webcam (tùy chọn)
   chọn BỐ CỤC (scene)              → 6 giao diện: 极简/竞技场/霓虹/球场/演播室/复古
   dán chữ + Logo quảng cáo         → kéo thả tự do, double-click để xóa
   bấm "开播 / Go Live"              → bắt đầu đếm giờ + tạo link cho người xem
```

**Dán quảng cáo lên hình live (đúng yêu cầu của bạn):**
- "加文字 / Add text": chữ quảng cáo, đổi màu + cỡ chữ, **kéo** đặt bất kỳ đâu.
- "底部滚动条 / Bottom ticker": dải chữ chạy ngang dưới đáy (kiểu bảng tài trợ).
- "加 Logo/图 / Add logo": upload ảnh PNG/logo, kéo vào góc màn hình.
- "保存封面 / Save cover": chụp khung hình hiện tại làm ảnh bìa phòng.

**Nhiều giao diện cho streamer sáng tạo:** mỗi "scene" là một class CSS trong `app.css` (`.gl-stage.sc-neon`, `.sc-arena`…). Designer thêm scene mới chỉ cần thêm 1 dòng vào mảng `SCENES` trong `golive.js` + 1 class CSS. Không đụng logic.

**Làm sao webcam thật sự tới được người xem?** Trình duyệt chỉ *thu* được hình, không tự phân phối cho hàng nghìn người. Cách chuẩn thuần web là **WebRTC (WHIP)**:

1. `golive.js` đã có sẵn hàm `publishWHIP()` — lấy luồng webcam đẩy lên máy chủ media qua giao thức WHIP.
2. Điền địa chỉ WHIP của bạn vào `config.js` → `PUBLISH.WHIP_URL` (ví dụ MediaMTX / LiveKit / Janus / Cloudflare Stream).
3. Máy chủ media nhận WebRTC → transcode → đóng gói **HLS (.m3u8)** → CDN.
4. API phòng trả `.m3u8` đó vào `streamUrl` → người xem mở `live.html?room=<id>` là xem được.

Để trống `PUBLISH.WHIP_URL` = trang chỉ chạy xem trước tại chỗ (demo), chưa phát ra ngoài. (Lưu ý: trình duyệt **không** đẩy RTMP trực tiếp được; RTMP là cho OBS/thiết bị phòng thu. Webcam-trên-web thì dùng WebRTC/WHIP.)

> Hợp thành chữ/Logo vào video gốc: lớp overlay hiện là DOM (đè lên video). Nếu muốn "khắc" luôn quảng cáo vào luồng phát ra, hãy vẽ video + overlay lên `<canvas>` rồi `canvas.captureStream()` và đẩy luồng đó qua `publishWHIP()` — chỗ nối đã chừa sẵn trong code.

---

## 4. Chat trực tiếp + 100 biểu tượng (icon)

Người xem bình luận và **thả icon** ngay trong phòng (`live.html`):
- Nút 😀 mở bảng **100 icon** chia 5 nhóm: Thường dùng / Thể thao / Điện tử / Cảm xúc / Vui. Danh sách nằm ở `public/js/ui/emojis.js` — muốn đổi/thêm icon (kể cả dùng ảnh sticker riêng) chỉ sửa file này.
- Tin nhắn chỉ chứa icon sẽ hiển thị **to hơn**, và các icon còn **bay lên** che ngang video (hiệu ứng "reaction" như TikTok/Facebook live).
- Khi cắm WebSocket thật (`CHAT_WS_URL`), icon trong tin nhắn người khác cũng tự bay — không cần thêm code.

Trong `config.js`, để trống `CHAT_WS_URL` = dùng tin nhắn demo nội bộ. Điền địa chỉ WebSocket của bạn vào là chạy chat thật — code đã xử lý gửi/nhận và truyền số phòng (`?room=<ID>`). Đội backend chỉ cần dựng máy chủ WebSocket nhận/broadcast theo phòng. Bảng 100 icon và hiệu ứng bay đã mô tả ở mục trên.

---

## 5. Đổi / thêm ngôn ngữ (làm sau cũng được)

Hiện có 中文 + English. Khi vào một thị trường mới (vd Tiếng Việt cho người dùng cuối), mở `public/js/i18n.js`, thêm một khối ngôn ngữ mới vào `DICT` và thêm mã ngôn ngữ vào `LANGS` trong `config.js`. Không cần sửa giao diện.

---

## 6. Thiết kế

Bạn nói sẽ tự thuê thiết kế — phần CSS nằm gọn trong `public/assets/css/` (`base.css` chứa biến màu, `app.css` chứa giao diện). Designer có thể thay toàn bộ mà không ảnh hưởng logic, vì HTML và JS tách riêng khỏi CSS.

---

## 7. Tóm tắt việc đội kỹ thuật cần làm để lên production

- Dựng hạ tầng streaming RTMP→HLS + CDN (hoặc mua dịch vụ).
- Mua và cấu hình API thể thao/tin tức → điền vào `.env`, chỉnh adapter.
- Dựng máy chủ WebSocket cho chat → điền `CHAT_WS_URL`.
- Triển khai `public/` lên web (Nginx/CDN) và `server/proxy.js` lên một máy chủ Node.
- Bổ sung đăng nhập/đăng ký, thanh toán, kiểm duyệt nội dung theo nhu cầu và quy định thị trường.
