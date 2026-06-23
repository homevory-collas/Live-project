# CHECKLIST TỰ KIỂM TRA — trước khi gửi khách

> Bản đầy đủ (backend chạy trên Railway/Render). Tự bấm từng mục, so với "Kết quả mong đợi".
> Cột Đạt: tự đánh ✅ / ❌.

---

## PHẦN 0 — Chuẩn bị (bắt buộc xong trước)

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 0.1 | Deploy backend lên Railway/Render (theo DEPLOY.md) | Có 2 URL: web + chat | ☐ |
| 0.2 | Mở `<web-url>/health` | Hiện `{"ok":true,"db":...}` | ☐ |
| 0.3 | Trong `config.js`: `USE_MOCK:false`, `API_BASE` trỏ đúng web-url, `CHAT_WS_URL` trỏ đúng chat-url (wss://) | Đã sửa & deploy lại | ☐ |

> Nếu để `USE_MOCK:true` thì web chạy bằng dữ liệu mẫu (không cần backend) — chỉ hợp xem giao diện, KHÔNG phải bản đầy đủ.

---

## PHẦN 1 — Trang chủ

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 1.1 | Mở trang chủ | Logo "UU9体育直播站", header/menu/footer hiện đủ | ☐ |
| 1.2 | Xem khu "正在直播" | Có các phòng (mock: 9 phòng; thật: số phòng admin đã tạo) | ☐ |
| 1.3 | Xem "赛程比分" + "积分榜" | Có tỷ số + bảng xếp hạng | ☐ |
| 1.4 | Đổi ngôn ngữ góc trên (中文/EN/VI/MS/ID) | Toàn bộ chữ đổi theo ngôn ngữ | ☐ |
| 1.5 | Bấm tab 足球/篮球/电竞 ở khu tỷ số | Lọc đúng môn | ☐ |

---

## PHẦN 2 — Đăng ký / Đăng nhập (cần backend)

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 2.1 | Bấm "注册/Register" → nhập email + mật khẩu ≥6 ký tự | Đăng ký thành công, tự đăng nhập | ☐ |
| 2.2 | Thử mật khẩu <6 ký tự | Báo lỗi "mật khẩu ≥6" | ☐ |
| 2.3 | Đăng ký lại cùng email | Báo "email đã đăng ký" | ☐ |
| 2.4 | Đăng xuất rồi đăng nhập lại | Vào được | ☐ |
| 2.5 | Đăng nhập sai mật khẩu | Báo "sai email hoặc mật khẩu" | ☐ |
| 2.6 | (Nếu bật REQUIRE_EMAIL_VERIFY) | Yêu cầu nhập mã 6 số; mã hiện trong log server (hoặc email nếu đã gắn dịch vụ mail) | ☐ |

---

## PHẦN 3 — Phòng xem live

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 3.1 | Bấm 1 phòng từ trang chủ | Vào live.html, video phát (test hoặc thật) | ☐ |
| 3.2 | Chưa đăng nhập, xem 1 phòng | Hiện banner "xem thử 5 phút" + đồng hồ đếm ngược | ☐ |
| 3.3 | Chờ hết 5 phút (hoặc sửa tạm thời để test nhanh) | Video dừng + hiện màn mời đăng ký | ☐ |
| 3.4 | Đăng nhập rồi xem lại | Không còn giới hạn, không có banner | ☐ |
| 3.5 | Gõ tin nhắn trong chat | Tin hiện ra | ☐ |
| 3.6 | Bấm 😀 chọn icon gửi | Icon hiện trong chat + bay lên màn hình | ☐ |
| 3.7 | (2 thiết bị/2 tab cùng phòng) gõ chat | Cả hai thấy tin của nhau (chat thật qua WebSocket) | ☐ |
| 3.8 | Trên cùng khung chat | Có dòng nội quy "trò chuyện văn minh" | ☐ |

---

## PHẦN 4 — Trang quản trị (admin)

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 4.1 | Mở `/admin.html`, nhập ADMIN_TOKEN | Vào được dashboard | ☐ |
| 4.2 | Nhập token sai | Báo "token không hợp lệ" | ☐ |
| 4.3 | Tạo phòng mới (tiêu đề + link .m3u8 test) | Phòng hiện trong danh sách | ☐ |
| 4.4 | Mở phòng vừa tạo (nút "Xem") | Phòng mở, video chạy | ☐ |
| 4.5 | Đặt "Allowed countries" = 1 nước KHÁC nước bạn | Mở phòng đó → báo "không khả dụng ở khu vực" (geo chặn) | ☐ |
| 4.6 | Sửa phòng | Lưu được, cập nhật danh sách | ☐ |
| 4.7 | Xóa phòng | Mất khỏi danh sách + trang chủ | ☐ |
| 4.8 | Tạo 1 quảng cáo (slot=home_top, ảnh + link) | Lưu được | ☐ |
| 4.9 | Về trang chủ xem | Quảng cáo home_top hiện ra | ☐ |

---

## PHẦN 5 — Trang streamer (go-live)

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 5.1 | Mở `/go-live.html` | Trang hiện, có khung camera | ☐ |
| 5.2 | Bấm "Mở camera" | Trình duyệt xin quyền → cho phép → thấy hình mình (cần HTTPS) | ☐ |
| 5.3 | Đổi qua 6 bố cục | Khung đổi viền/hiệu ứng theo từng bố cục | ☐ |
| 5.4 | "Thêm chữ" + kéo | Chữ quảng cáo hiện, kéo được, nhấp đúp xóa được | ☐ |
| 5.5 | "Thêm Logo/ảnh" | Ảnh hiện, kéo được | ☐ |
| 5.6 | "Dải chữ chạy" | Chữ chạy ngang đáy | ☐ |
| 5.7 | Bấm "开播/Lên sóng" | Đếm giờ chạy + hiện link xem | ☐ |

> ⚠️ Lưu ý: go-live chỉ XEM TRƯỚC trên máy streamer. Video CHƯA phát ra cho người xem (cần media server/CDN).

---

## PHẦN 6 — Trang phụ

| # | Thao tác | Kết quả mong đợi | Đạt |
|---|---|---|---|
| 6.1 | Footer bấm "Terms" | Mở trang điều khoản | ☐ |
| 6.2 | Footer bấm "Contact" | Mở trang liên hệ | ☐ |

---

## NHỮNG GÌ SẼ CHƯA CHẠY (bình thường, không phải lỗi)
- ❌ Video TRẬN ĐẤU THẬT — cần bản quyền + nguồn HLS + CDN. Hiện là video test.
- ❌ Email mã xác thực tới hộp thư — chỉ chạy khi đã gắn dịch vụ mail (Resend/SES). Chưa gắn thì mã hiện trong log server.
- ❌ Geo chặn CỨNG (chống VPN) — geo hiện chỉ chặn mềm ở web; chặn cứng phải làm ở CDN.
- ❌ Streamer phát ra cho người xem — cần media server (WHIP/RTMP→HLS).

## NẾU MỘT MỤC ❌
- Mở DevTools (F12) → tab Console → chụp lỗi gửi lại, tôi xem.
- Lỗi mạng/đăng nhập thường do `API_BASE`/`CHAT_WS_URL` sai trong config.js, hoặc backend chưa chạy.

---

## GỢI Ý GỬI KHÁCH
Nếu khách chỉ xem demo: nói rõ "đây là bản chạy thử, video là clip mẫu, dữ liệu trận là mẫu".
Đừng để khách tự bấm rồi tưởng video test là trận thật — dễ hiểu lầm về mức độ hoàn thiện.
