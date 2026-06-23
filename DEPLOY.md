# DEPLOY — Đưa UU9体育直播站 lên Railway / Render (chạy thật)

Mục tiêu: chạy thật đăng nhập, chat, admin, quảng cáo trên Internet.
⚠️ Video trận đấu vẫn cần bản quyền + nguồn HLS riêng — KHÔNG có sẵn ở bước này.
   Trên server bạn sẽ thấy phòng chạy bằng link video test (giống bản demo).

Bạn deploy 2 dịch vụ:
  A. WEB  = proxy.js  (chạy API + phục vụ luôn giao diện public/)
  B. CHAT = chat.js   (WebSocket cho chat)

---

## CHUẨN BỊ (làm 1 lần)

1. Cài Git nếu chưa có. Tạo 1 repo trên GitHub, đẩy thư mục `livearena/` lên đó.
   ```bash
   cd livearena
   git init && git add . && git commit -m "uu9 live site"
   git branch -M main
   git remote add origin https://github.com/<bạn>/<repo>.git
   git push -u origin main
   ```
   (File .gitignore đã có sẵn — sẽ KHÔNG đẩy node_modules, .env, dữ liệu.)

---

## CÁCH 1 — RENDER (dễ nhất, có sẵn file cấu hình)

Repo đã có `render.yaml` → Render tự dựng cả 2 dịch vụ.

1. Vào https://render.com → đăng nhập bằng GitHub.
2. New → **Blueprint** → chọn repo vừa đẩy.
3. Render đọc `render.yaml`, hiện 2 dịch vụ: `uu9-web` và `uu9-chat`. Bấm Apply.
4. Đợi build xong. Bạn nhận 2 URL, ví dụ:
   - WEB:  `https://uu9-web.onrender.com`
   - CHAT: `https://uu9-chat.onrender.com`
5. **Nối chat vào web:** mở `public/js/config.js`, sửa:
   ```js
   USE_MOCK: false,
   CHAT_WS_URL: 'wss://uu9-chat.onrender.com',   // chú ý wss:// (có SSL)
   ```
   Commit + push lại → Render tự build lại.
6. Xong. Mở `https://uu9-web.onrender.com` là thấy site thật.
   - Admin: `https://uu9-web.onrender.com/admin.html` (token xem ở Render → uu9-web → Environment → ADMIN_TOKEN).

---

## CÁCH 2 — RAILWAY

Railway không đọc render.yaml, nên tạo 2 dịch vụ thủ công từ cùng 1 repo.

1. Vào https://railway.app → New Project → Deploy from GitHub → chọn repo.
2. Dịch vụ 1 (WEB): Settings → Start Command: `node server/proxy.js`
   - Variables: thêm `ADMIN_TOKEN` = (chuỗi ngẫu nhiên dài bạn tự đặt).
   - Railway tự cấp domain (Settings → Networking → Generate Domain).
3. Dịch vụ 2 (CHAT): trong cùng project → New → GitHub Repo (cùng repo)
   - Start Command: `node server/chat.js`
   - Generate Domain → ví dụ `uu9-chat.up.railway.app`.
4. Sửa `public/js/config.js`:
   ```js
   USE_MOCK: false,
   CHAT_WS_URL: 'wss://uu9-chat.up.railway.app',
   ```
   Commit + push → Railway build lại.
5. Mở domain của dịch vụ WEB là thấy site.

---

## SAU KHI LÊN — kiểm tra nhanh
- `/health` trả `{ok:true}` → backend sống.
- Đăng ký 1 tài khoản → đăng nhập được → backend + DB chạy.
- Admin tạo 1 phòng có link .m3u8 test → mở phòng xem được.
- Gõ chat → nếu CHAT_WS_URL đúng, tin nhắn realtime chạy.

## LƯU Ý THẬT
- **Gói free của Render/Railway sẽ "ngủ"** khi không có người truy cập, lần mở đầu chậm vài giây. Muốn chạy 24/7 ổn định phải lên gói trả phí.
- **Database**: gói free dùng file (SQLite/JSON) có thể MẤT khi dịch vụ restart/redeploy. Muốn dữ liệu bền phải gắn volume hoặc dùng DB ngoài (Postgres). Đây KHÔNG phải chỗ lưu dữ liệu thật lâu dài.
- **Email**: muốn gửi mã thật, thêm biến `MAIL_PROVIDER=resend` + `MAIL_API_KEY` trong dashboard.
- **Video thật**: vẫn cần CDN + nguồn HLS + bản quyền — không nằm ở Railway/Render.
- **Đây là môi trường để XEM THẬT / chạy thử có thật**, không phải hạ tầng chịu tải lớn. Đông người xem vẫn cần CDN riêng cho video.
