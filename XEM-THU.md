# XEM THỬ WEBSITE — Đọc cái này trước

## ⚠️ VIỆC CẦN LÀM NGAY: đổi API key
Key RapidAPI của bạn đã hiện trong ảnh chụp màn hình bạn gửi. Bất kỳ ai thấy ảnh đó đều dùng được.
→ Vào RapidAPI → app của bạn → **Regenerate / tạo key mới**. Key cũ coi như bỏ.

---

## CÁCH 1 — Xem nhanh nhất, KHÔNG cần API (khuyên dùng để xem giao diện)

Code đang để sẵn `USE_MOCK: true`, nên chỉ cần:

```bash
cd livearena
npm run dev          # mở http://localhost:3000
```

Bạn sẽ thấy ĐẦY ĐỦ: trang chủ, tỷ số mẫu, phòng live có video chạy thật (link test),
chat + bảng 100 icon, hiệu ứng icon bay, và trang webcam `go-live.html`.
Đây chính là "website trông như thế nào" — không tốn request API, không lộ key.

> Phải mở qua HTTP (lệnh trên tự lo). Đừng nhấp đúp file .html.

---

## CÁCH 2 — Cắm thử API bóng đá RapidAPI (chỉ thấy TỶ SỐ là thật)

Lưu ý thành thật: API "Free API Live Football Data" **chỉ trả số liệu** (tỷ số, cầu thủ).
Nó **KHÔNG có video trận đấu**. Nên cắm vào, chỉ phần *bảng tỷ số* đổi sang dữ liệu thật;
phần *video phòng live* vẫn dùng link test như Cách 1. Giao diện tổng thể gần như giống hệt.
Bản miễn phí giới hạn ~100 request/ngày.

Các bước:

1) Tạo file `.env` từ mẫu rồi điền key MỚI của bạn:
```bash
cp .env.example .env
# mở .env, dán key mới vào SPORTS_API_KEY
npm install
npm run proxy        # chạy ở http://localhost:8080
```

2) Trong `public/js/config.js` đổi:
```js
USE_MOCK: false,
API_BASE: 'http://localhost:8080/api',
```

3) Mở lại web (`npm run dev` ở cửa sổ khác).
   - Nếu tỷ số hiện ra → khớp field, xong.
   - Nếu tỷ số trống → tên trường JSON của API khác dự đoán của mình.
     Mở `public/js/api/adapters/sports.js`, in thử `console.log(raw)` để xem
     cấu trúc thật rồi sửa vài dòng map cho khớp. (Mình KHÔNG gọi mạng được nên
     không xem trước được JSON thật — chỗ này bạn hoặc dev xem log là rõ ngay.)

> Muốn quay lại bản chạy chắc chắn: đặt `USE_MOCK: true` là xong.

---

## Phần video / webcam (nhắc lại)
- Phòng live cần link `.m3u8`. API bóng đá trên KHÔNG cấp link này.
- Streamer lên sóng bằng webcam (`go-live.html`) cần server media (WHIP) — xem HUONG-DAN.md mục 3b.
- Để xem GIAO DIỆN thì không cần mấy thứ đó; link test có sẵn đã đủ.

---

## MỚI: Chat thật + Admin + ghi chú scale

### Chạy chat thật (WebSocket)
```bash
npm install        # cần mạng để cài 'ws' (môi trường demo của tôi chặn nên tôi chưa chạy thật được)
npm run chat       # ws://localhost:8090
```
Rồi trong `public/js/config.js` đặt `CHAT_WS_URL: 'ws://localhost:8090'`.
Server tự broadcast theo phòng (`?room=<id>`), có giới hạn 1 tin/giây/người và cập nhật số người xem.

### Admin dashboard — quản lý phòng
```bash
cp .env.example .env     # đặt ADMIN_TOKEN thành chuỗi ngẫu nhiên dài
npm run proxy            # http://localhost:8080
```
Mở `http://localhost:3000/admin.html` → nhập ADMIN_TOKEN → tạo/sửa/xóa phòng.
Mỗi phòng có ô **streamUrl (.m3u8)** — đây chính là link người xem sẽ phát.
Phòng lưu trong `server/rooms.data.json` (demo). Production đổi sang DB thật (chú thích sẵn trong proxy.js).

Để frontend đọc phòng từ admin thay vì mock: `config.js` đặt `USE_MOCK:false`, `API_BASE:'http://localhost:8080/api'`, và **để trống** `LIVE_API_BASE` trong `.env` (khi trống, proxy phục vụ phòng từ file local; khi có thì chuyển sang forward API ngoài).

### ⚠️ Về mục tiêu 200-300k người xem/phòng
Con số này KHÔNG do code quyết định — do **CDN phát HLS** gánh. Cụ thể:
- Video: phải đẩy `.m3u8` qua CDN (Cloudflare/Akamai/AWS CloudFront...). CDN nhân bản cho hàng trăm nghìn người. Code player đã sẵn sàng, không phải sửa.
- Chat: 1 process Node KHÔNG ôm nổi vài trăm nghìn kết nối. Phải chạy NHIỀU instance `chat.js` sau load balancer + dùng **Redis Pub/Sub** để các instance chia sẻ tin nhắn cùng phòng (đã đánh dấu chỗ cần sửa bằng `NOTE(scale)` trong `server/chat.js`).
- Phòng/admin: đổi file JSON → DB thật (Postgres/Redis).

Tức là: **code đã viết để không cản trở scale**, nhưng đạt 300k là việc của hạ tầng (CDN + nhiều instance + Redis + DB), không phải chỉ bật code lên.

> Lưu ý thành thật: môi trường của tôi không cài được package mạng nên tôi đã test logic admin store và logic broadcast chat bằng Node thuần (chạy đúng), nhưng CHƯA chạy được proxy/chat đầy đủ với express+ws. Bạn `npm install` trên máy là chạy được; nếu lỗi gì gửi tôi log.

---

## MỚI: Đăng ký/đăng nhập + giới hạn khách 5 phút

### Cách hoạt động
- Trang `auth.html` — đăng ký/đăng nhập chỉ bằng **email + mật khẩu** (không KYC).
- Mật khẩu băm bằng scrypt có salt (Node built-in), KHÔNG lưu dạng text.
- Khách CHƯA đăng nhập vào phòng live: xem **5 phút** rồi hiện màn mời đăng ký.
- Đăng nhập xong xem không giới hạn.

### ⚠️ Hai điều phải biết (đừng hiểu nhầm)
1. **Giới hạn 5 phút hiện là "chặn mềm" ở frontend.** Chặn được người dùng thường,
   nhưng người rành kỹ thuật mở DevTools tắt được, hoặc lấy thẳng link .m3u8 xem ngoài.
   Muốn chặn CỨNG: backend phải cấp "playback token có thời hạn" theo trạng thái đăng nhập,
   và CDN chỉ cho phát khi token hợp lệ. Đã đánh dấu chỗ này trong live.js.
2. **Email chưa được xác thực.** Người ta nhập email giả vẫn đăng ký được.
   Muốn email thật (để gửi quảng cáo/thông báo) phải thêm bước gửi mã xác thực
   → cần dịch vụ gửi mail (SendGrid/SES...). Đã chừa chỗ `NOTE(email-verify)` trong proxy.js.

### Chạy thử
```bash
npm install
npm run proxy            # http://localhost:8080
# config.js: USE_MOCK:false, API_BASE:'http://localhost:8080/api'
npm run dev              # http://localhost:3000
```
User lưu ở `server/users.data.json` (demo). Production đổi sang DB thật.
