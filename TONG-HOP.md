# TỔNG HỢP DỰ ÁN LIVE ARENA — File & Cách vận hành

Tài liệu này gom tất cả lại: có những file gì, mỗi file làm gì, và **để website hoạt động thật thì cần làm gì, theo thứ tự.**

---

## A. TOÀN BỘ FILE & CHỨC NĂNG

### Trang web (public/ — phần người dùng thấy)
| File | Chức năng | Trạng thái |
|---|---|---|
| `index.html` | Trang chủ: banner, phòng live, tỷ số, tin tức | ✅ Xong |
| `live.html` | Phòng xem: player HLS + chat + 100 icon + giới hạn 5 phút | ✅ Xong |
| `go-live.html` | Streamer lên sóng bằng webcam, dán quảng cáo, 6 bố cục | ✅ Xong (cần server media để phát thật) |
| `admin.html` | Quản trị: tạo/sửa/xóa phòng, gắn link .m3u8 | ✅ Xong |
| `auth.html` | Đăng ký / đăng nhập bằng email | ✅ Xong |

### Logic frontend (public/js/)
| File | Chức năng |
|---|---|
| `config.js` | ★ File cấu hình DUY NHẤT cần sửa (bật/tắt mock, địa chỉ API, WebSocket chat) |
| `i18n.js` | Đa ngôn ngữ Trung + Anh |
| `auth.js` | Lưu token đăng nhập, gọi API auth |
| `api/index.js` | API nội bộ — UI chỉ nói chuyện với file này |
| `api/adapters/*.js` | Cầu nối tới nhà cung cấp (liveRooms / sports / news). Đổi nhà cung cấp chỉ sửa 1 file |
| `api/mock.js` | Dữ liệu mẫu để xem trước không cần API |
| `ui/emojis.js` | 100 biểu tượng chat |
| `ui/render.js` | Hàm dựng giao diện dùng chung |
| `pages/*.js` | Logic từng trang (portal, live, golive, admin, auth-page) |

### Backend (server/ — phần máy chủ)
| File | Chức năng | Cần gì để chạy |
|---|---|---|
| `proxy.js` | Giấu API key + API phòng (admin) + API tài khoản (đăng ký/đăng nhập) | `npm run proxy` |
| `chat.js` | Server chat WebSocket, broadcast theo phòng | `npm run chat` |

### Tài liệu
| File | Nội dung |
|---|---|
| `README.md` | Giới thiệu tổng thể (Trung/Anh) |
| `HUONG-DAN.md` | Hướng dẫn chi tiết tiếng Việt (luồng live, webcam, icon) |
| `XEM-THU.md` | Cách chạy thử + cắm API + auth |
| `TONG-HOP.md` | **File này** |

---

## B. ĐỂ HOẠT ĐỘNG — 3 MỨC ĐỘ

### MỨC 1 — Xem giao diện ngay (0 đồng, 0 cấu hình)
```bash
cd livearena
npm run dev      # mở http://localhost:3000
```
`config.js` đang để `USE_MOCK:true` → chạy với dữ liệu mẫu, video link test.
Thấy được TOÀN BỘ giao diện. Dùng để duyệt thiết kế, demo cho người khác.

### MỨC 2 — Chạy backend thật trên máy (vẫn miễn phí, để test)
```bash
cp .env.example .env        # điền ADMIN_TOKEN, key API (nếu có)
npm install
npm run proxy               # cửa sổ 1 — http://localhost:8080
npm run chat                # cửa sổ 2 — ws://localhost:8090
npm run dev                 # cửa sổ 3 — http://localhost:3000
```
Trong `config.js` đặt:
```js
USE_MOCK: false,
API_BASE: 'http://localhost:8080/api',
CHAT_WS_URL: 'ws://localhost:8090',
```
Giờ chạy thật: đăng ký tài khoản được, admin tạo phòng được, chat thật, giới hạn 5 phút chạy.

### MỨC 3 — Lên Internet cho người dùng thật (cần MUA/THUÊ)
Đây là phần KHÔNG phải code, mà là hạ tầng phải có:

1. **Máy chủ (VPS)** chạy `proxy.js` + `chat.js` (Node). Vài chục USD/tháng.
2. **Tên miền + SSL** — SSL miễn phí (Let's Encrypt / Cloudflare). BẮT BUỘC (webcam chỉ chạy trên HTTPS).
3. **Hosting cho thư mục `public/`** — Nginx hoặc CDN tĩnh.
4. **★ NGUỒN VIDEO + CDN** — phần tốn tiền nhất:
   - Server media nhận luồng (RTMP/WebRTC) → đóng gói HLS (.m3u8).
   - CDN (Alibaba/Tencent/Cloudflare...) phân phối cho nhiều người xem.
   - Đây là thứ "mua/thuê là xong", chi phí theo lượng người xem.
5. **(Nên có)** Database thật thay file JSON khi nhiều phòng/user.

---

## C. CÒN THIẾU GÌ ĐỂ "CHẠY THẬT HOÀN CHỈNH"

| Hạng mục | Tình trạng | Là việc CODE hay MUA? |
|---|---|---|
| Giao diện, phòng, chat, admin, đăng nhập | ✅ Đã có | — |
| Nguồn video + CDN | ❌ Chưa | MUA/THUÊ hạ tầng |
| Xác thực email (chống email giả) | ❌ Chưa | CODE + dịch vụ mail |
| Giới hạn 5 phút "khóa cứng" (chống lách) | ⚠️ Mới có lớp mềm | CODE backend + CDN token |
| Database thật | ⚠️ Đang dùng file JSON | CODE (SQLite/Postgres) |
| Khu vực quảng cáo | ❌ Chưa | CODE |
| Kiểm duyệt chat | ⚠️ Có chỗ nối, chưa có bộ lọc | CODE |

---

## D. LƯU Ý TIỀN (nhắc lại ngắn)
- Chi phí KHÔNG do số phòng hay số trận quyết định, mà do **tổng người xem đồng thời**.
- Tốn nhất là **băng thông video qua CDN**. 1 người xem 720p 2 tiếng ≈ 2,25 GB.
- BẮT BUỘC khi lên thật: **bật cảnh báo/trần chi tiêu trên CDN** + **phát bitrate thấp (480p) lúc đầu**.
- Cách biết con số thật: chạy 2-3 trận đầu, xem CDN báo bao nhiêu GB, rồi nhân lên.

---

## E. QUAN TRỌNG — ĐÃ TEST ĐẾN ĐÂU
- Logic đã test chạy đúng bằng Node thuần: băm/kiểm mật khẩu, validate email, lưu/đọc/xóa phòng, broadcast chat theo phòng.
- Cú pháp toàn bộ JS: hợp lệ. Các trang đều tải được (HTTP 200).
- CHƯA test được: chạy proxy + chat đầy đủ với express/ws (môi trường tạo code chặn cài package mạng). Trên máy bạn `npm install` là chạy; có lỗi gửi log.
- Mọi link .m3u8 / API thật: phải chạy trên máy bạn mới verify được.

---

## F. CẬP NHẬT MỚI — 4 mảng vừa thêm

### 1. Database (SQLite) — server/db.js
- Tự dùng SQLite nếu đã cài `better-sqlite3`; chưa cài thì tự fallback về file JSON (chạy được ngay).
- Để bật SQLite thật: `npm install better-sqlite3` → tự tạo file `livearena.db`. Không cần đổi code.
- Lưu: users, rooms, ads. Lên quy mô lớn hơn đổi sang Postgres (chỉ thay db.js).

### 2. Xác thực email — server/mail.js + proxy
- Đăng ký sinh mã 6 số. `REQUIRE_EMAIL_VERIFY=true` trong .env thì bắt nhập mã mới đăng nhập được.
- ⚠️ Gửi mail thật cần dịch vụ: đặt `MAIL_PROVIDER=resend` + `MAIL_API_KEY`. Để trống = mã chỉ in ra console (chỉ hợp dev). KHÔNG có dịch vụ mail thì người dùng KHÔNG nhận được mã.

### 3. Geo-blocking — server/geo.js
- Mỗi phòng có ô "Allowed countries" trong admin (vd: VN,MY,ID). Trống = không giới hạn.
- Quốc gia đọc từ header CDN (CF-IPCountry...). Phải cấu hình CDN gửi header này.
- ⚠️ CỰC KỲ QUAN TRỌNG: đây là chặn MỀM ở web. Người dùng VPN hoặc lấy thẳng .m3u8 vẫn lách được.
  Chặn CỨNG (bắt buộc cho hợp đồng bản quyền) phải làm ở tầng CDN/media: token theo vùng + CDN regional block.

### 4. Quảng cáo — js/ui/ads.js + admin
- Đặt `<div data-ad-slot="home_top"></div>` ở đâu thì hiện quảng cáo ở đó. Đã đặt sẵn: home_top, live_below.
- Quản lý trong admin: tạo quảng cáo theo vị trí, ảnh/link hoặc HTML, trọng số (random theo weight), bật/tắt.
- Chế độ mock hiện ô "Ad slot" mờ để thấy vị trí.

### Đã test (Node thuần, chạy đúng):
- Database fallback (lưu/đọc/xóa rooms + ads + geo), weighted ad pick.
- Luồng đăng ký → xác thực mã → đăng nhập.
- Logic geo-blocking (cho/chặn đúng nước, nước lạ không chặn nhầm).
- Cú pháp toàn bộ JS hợp lệ; 5 ngôn ngữ đủ 68 key; mọi trang tải 200.
- CHƯA test: chạy proxy+chat đầy đủ với express/ws/sqlite (môi trường chặn cài package). Trên máy bạn `npm install` là chạy.
