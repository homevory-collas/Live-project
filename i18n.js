/**
 * 多语言 / i18n  ——  zh = 主语言 / primary, en = 次语言 / secondary
 * 以后接入越南语等新市场，只需在 DICT 里加一个语言键。
 * To add a new market language later, just add one key in DICT.
 */
import { CONFIG } from './config.js';

const DICT = {
  zh: {
    app_download: '客户端下载', login: '登录', register: '注册',
    search_ph: '搜索球队、赛事、主播…', data_center: '数据中心', go_live: '开播',
    nav_home: '首页', nav_live: '直播', nav_football: '足球', nav_basket: '篮球',
    nav_esport: '电竞', nav_news: '资讯', nav_quan: '圈子', nav_data: '数据',
    sec_live: '正在直播', sec_scores: '赛程比分', sec_standings: '积分榜', sec_news: '热门资讯',
    more: '查看全部', watching: '人在看', live: '直播中', vs: '对阵',
    tab_hot: '热门', tab_football: '足球', tab_basket: '篮球', tab_esport: '电竞',
    enter_room: '进入直播间', back_home: '返回首页', chat_title: '聊天室',
    chat_ph: '说点什么…', send: '发送', loading: '加载中…',
    stream_error: '直播信号暂时无法加载，请稍后重试。',
    no_room: '未找到该直播间。', col_team: '球队', col_pts: '积分',
    footer_about: '大型体育与电竞直播平台 · 实时比分 · 赛事直播 · 社区',
    on_air: '直播中', cam_hint: '点击「开启摄像头」开始', cam_denied: '无法访问摄像头，请检查浏览器权限。',
    start_cam: '开启摄像头', share_screen: '共享屏幕', stop_live: '下播', save_frame: '保存封面',
    scenes: '直播间布景', overlay_tools: '贴字 & Logo（广告位）', ov_text_ph: '输入广告文字…',
    add_text: '加文字', add_ticker: '底部滚动条', add_logo: '加 Logo/图', clear_ov: '清空',
    ov_tip: '提示：拖动可移动；双击可删除该元素。', ticker_default: '欢迎来到 UU9直播站',
    room_info: '房间信息', rm_title_ph: '直播标题…', share_link: '观众观看链接：',
    email: '邮箱 / Email', password: '密码 / Password',
    auth_sub: '免费观看 · 注册只需邮箱', auth_tip: '注册即表示同意条款。无需实名认证。',
    gate_title: '免费试看已结束', gate_desc: '注册或登录后可继续免费观看全场（仅需邮箱）。',
    banner_text: '免费试看 · 注册（仅需邮箱）即可观看全场。剩余',
    geo_blocked: '该直播在你所在地区不可观看。', verify_sub: '我们已发送验证码到你的邮箱', verify_code: '验证码', verify_btn: '验证', ad_label: '广告',
    chat_pledge: '🤝 文明观赛：请友善交流，禁止辱骂、歧视、刷屏与广告。',
  },
  en: {
    app_download: 'Download App', login: 'Log in', register: 'Sign up',
    search_ph: 'Search teams, matches, streamers…', data_center: 'Data Center', go_live: 'Go Live',
    nav_home: 'Home', nav_live: 'Live', nav_football: 'Football', nav_basket: 'Basketball',
    nav_esport: 'Esports', nav_news: 'News', nav_quan: 'Community', nav_data: 'Data',
    sec_live: 'Live Now', sec_scores: 'Schedule & Scores', sec_standings: 'Standings', sec_news: 'Top Stories',
    more: 'See all', watching: 'watching', live: 'LIVE', vs: 'VS',
    tab_hot: 'Hot', tab_football: 'Football', tab_basket: 'Basketball', tab_esport: 'Esports',
    enter_room: 'Enter Room', back_home: 'Back to Home', chat_title: 'Live Chat',
    chat_ph: 'Say something…', send: 'Send', loading: 'Loading…',
    stream_error: 'Stream is temporarily unavailable. Please try again later.',
    no_room: 'Live room not found.', col_team: 'Team', col_pts: 'Pts',
    footer_about: 'Sports & esports live platform · real-time scores · live matches · community',
    on_air: 'ON AIR', cam_hint: 'Click "Start camera" to begin', cam_denied: 'Cannot access camera. Check browser permissions.',
    start_cam: 'Start camera', share_screen: 'Share screen', stop_live: 'End', save_frame: 'Save cover',
    scenes: 'Room scenes', overlay_tools: 'Text & Logo (ad space)', ov_text_ph: 'Type ad text…',
    add_text: 'Add text', add_ticker: 'Bottom ticker', add_logo: 'Add logo/image', clear_ov: 'Clear',
    ov_tip: 'Tip: drag to move; double-click to delete an item.', ticker_default: '欢迎来到 UU9直播站 / Welcome to UU9',
    room_info: 'Room info', rm_title_ph: 'Stream title…', share_link: 'Viewer link:',
    email: 'Email', password: 'Password',
    auth_sub: 'Free to watch · email only', auth_tip: 'By signing up you agree to the terms. No KYC required.',
    gate_title: 'Free preview ended', gate_desc: 'Register or log in to keep watching the full stream free (email only).',
    banner_text: 'Free preview · Register (email only) to watch the full stream. Left:',
    geo_blocked: 'This stream is not available in your region.', verify_sub: 'We sent a verification code to your email', verify_code: 'Code', verify_btn: 'Verify', ad_label: 'Ad',
    chat_pledge: '🤝 Be civil: be kind, no insults, discrimination, spam or ads.',
  },

  // ===== Tiếng Việt / Vietnamese (bản dịch chuẩn) =====
  vi: {
    app_download: 'Tải ứng dụng', login: 'Đăng nhập', register: 'Đăng ký',
    search_ph: 'Tìm đội bóng, trận đấu, streamer…', data_center: 'Trung tâm dữ liệu', go_live: 'Lên sóng',
    nav_home: 'Trang chủ', nav_live: 'Trực tiếp', nav_football: 'Bóng đá', nav_basket: 'Bóng rổ',
    nav_esport: 'Thể thao điện tử', nav_news: 'Tin tức', nav_quan: 'Cộng đồng', nav_data: 'Dữ liệu',
    sec_live: 'Đang trực tiếp', sec_scores: 'Lịch & Tỷ số', sec_standings: 'Bảng xếp hạng', sec_news: 'Tin nổi bật',
    more: 'Xem tất cả', watching: 'người xem', live: 'TRỰC TIẾP', vs: 'gặp',
    tab_hot: 'Nổi bật', tab_football: 'Bóng đá', tab_basket: 'Bóng rổ', tab_esport: 'Thể thao điện tử',
    enter_room: 'Vào phòng', back_home: 'Về trang chủ', chat_title: 'Trò chuyện',
    chat_ph: 'Nhập bình luận…', send: 'Gửi', loading: 'Đang tải…',
    stream_error: 'Tín hiệu trực tiếp tạm thời chưa tải được, vui lòng thử lại sau.',
    no_room: 'Không tìm thấy phòng trực tiếp.', col_team: 'Đội', col_pts: 'Điểm',
    footer_about: 'Nền tảng trực tiếp thể thao & esports · tỷ số trực tiếp · phát trực tiếp · cộng đồng',
    on_air: 'ĐANG PHÁT', cam_hint: 'Bấm "Mở camera" để bắt đầu', cam_denied: 'Không truy cập được camera, vui lòng kiểm tra quyền trình duyệt.',
    start_cam: 'Mở camera', share_screen: 'Chia sẻ màn hình', stop_live: 'Dừng', save_frame: 'Lưu ảnh bìa',
    scenes: 'Bố cục phòng', overlay_tools: 'Chữ & Logo (vị trí quảng cáo)', ov_text_ph: 'Nhập chữ quảng cáo…',
    add_text: 'Thêm chữ', add_ticker: 'Dải chữ chạy', add_logo: 'Thêm Logo/ảnh', clear_ov: 'Xóa hết',
    ov_tip: 'Mẹo: kéo để di chuyển; nhấp đúp để xóa phần tử.', ticker_default: 'Chào mừng đến UU9直播站',
    room_info: 'Thông tin phòng', rm_title_ph: 'Tiêu đề buổi phát…', share_link: 'Link xem cho khán giả:',
    email: 'Email', password: 'Mật khẩu',
    auth_sub: 'Xem miễn phí · Đăng ký chỉ cần email', auth_tip: 'Đăng ký nghĩa là bạn đồng ý điều khoản. Không cần xác minh danh tính.',
    gate_title: 'Hết thời gian xem thử', gate_desc: 'Đăng ký hoặc đăng nhập để xem trọn vẹn miễn phí (chỉ cần email).',
    banner_text: 'Xem thử miễn phí · Đăng ký (chỉ cần email) để xem trọn vẹn. Còn lại:',
    geo_blocked: 'Buổi phát này không khả dụng ở khu vực của bạn.', verify_sub: 'Chúng tôi đã gửi mã xác minh đến email của bạn', verify_code: 'Mã xác minh', verify_btn: 'Xác minh', ad_label: 'Quảng cáo',
    chat_pledge: '🤝 Văn minh: trò chuyện lịch sự, cấm lăng mạ, kỳ thị, spam, quảng cáo.',
  },

  // ===== Bahasa Melayu / Malay  (⚠ nên nhờ người bản địa soát thuật ngữ thể thao) =====
  ms: {
    app_download: 'Muat turun App', login: 'Log masuk', register: 'Daftar',
    search_ph: 'Cari pasukan, perlawanan, streamer…', data_center: 'Pusat Data', go_live: 'Siaran Langsung',
    nav_home: 'Utama', nav_live: 'Langsung', nav_football: 'Bola Sepak', nav_basket: 'Bola Keranjang',
    nav_esport: 'Esukan', nav_news: 'Berita', nav_quan: 'Komuniti', nav_data: 'Data',
    sec_live: 'Sedang Langsung', sec_scores: 'Jadual & Skor', sec_standings: 'Kedudukan', sec_news: 'Berita Hangat',
    more: 'Lihat semua', watching: 'menonton', live: 'LANGSUNG', vs: 'lwn',
    tab_hot: 'Hangat', tab_football: 'Bola Sepak', tab_basket: 'Bola Keranjang', tab_esport: 'Esukan',
    enter_room: 'Masuk Bilik', back_home: 'Kembali ke Utama', chat_title: 'Sembang',
    chat_ph: 'Tulis sesuatu…', send: 'Hantar', loading: 'Memuatkan…',
    stream_error: 'Siaran tidak tersedia buat sementara. Sila cuba lagi nanti.',
    no_room: 'Bilik siaran tidak dijumpai.', col_team: 'Pasukan', col_pts: 'Mata',
    footer_about: 'Platform siaran langsung sukan & esukan · skor langsung · perlawanan langsung · komuniti',
    on_air: 'SEDANG SIARAN', cam_hint: 'Klik "Buka kamera" untuk mula', cam_denied: 'Tidak dapat akses kamera. Sila semak kebenaran pelayar.',
    start_cam: 'Buka kamera', share_screen: 'Kongsi skrin', stop_live: 'Tamat', save_frame: 'Simpan kulit',
    scenes: 'Suasana Bilik', overlay_tools: 'Teks & Logo (ruang iklan)', ov_text_ph: 'Taip teks iklan…',
    add_text: 'Tambah teks', add_ticker: 'Teks berjalan', add_logo: 'Tambah Logo/imej', clear_ov: 'Kosongkan',
    ov_tip: 'Petua: seret untuk gerak; klik dua kali untuk padam.', ticker_default: 'Selamat datang ke UU9直播站',
    room_info: 'Maklumat bilik', rm_title_ph: 'Tajuk siaran…', share_link: 'Pautan tontonan:',
    email: 'E-mel', password: 'Kata laluan',
    auth_sub: 'Tonton percuma · Daftar dengan e-mel sahaja', auth_tip: 'Dengan mendaftar anda bersetuju dengan terma. Tiada pengesahan identiti diperlukan.',
    gate_title: 'Tontonan percuma tamat', gate_desc: 'Daftar atau log masuk untuk terus menonton penuh secara percuma (e-mel sahaja).',
    banner_text: 'Tontonan percuma · Daftar (e-mel sahaja) untuk tonton penuh. Baki:',
    geo_blocked: 'Siaran ini tidak tersedia di wilayah anda.', verify_sub: 'Kami telah menghantar kod pengesahan ke e-mel anda', verify_code: 'Kod', verify_btn: 'Sahkan', ad_label: 'Iklan',
    chat_pledge: '🤝 Beradab: berbual sopan, dilarang menghina, diskriminasi, spam atau iklan.',
  },

  // ===== Bahasa Indonesia / Indonesian  (⚠ nên nhờ người bản địa soát thuật ngữ thể thao) =====
  id: {
    app_download: 'Unduh Aplikasi', login: 'Masuk', register: 'Daftar',
    search_ph: 'Cari tim, pertandingan, streamer…', data_center: 'Pusat Data', go_live: 'Siaran Langsung',
    nav_home: 'Beranda', nav_live: 'Langsung', nav_football: 'Sepak Bola', nav_basket: 'Bola Basket',
    nav_esport: 'Esports', nav_news: 'Berita', nav_quan: 'Komunitas', nav_data: 'Data',
    sec_live: 'Sedang Langsung', sec_scores: 'Jadwal & Skor', sec_standings: 'Klasemen', sec_news: 'Berita Populer',
    more: 'Lihat semua', watching: 'menonton', live: 'LANGSUNG', vs: 'vs',
    tab_hot: 'Populer', tab_football: 'Sepak Bola', tab_basket: 'Bola Basket', tab_esport: 'Esports',
    enter_room: 'Masuk Ruang', back_home: 'Kembali ke Beranda', chat_title: 'Obrolan',
    chat_ph: 'Tulis sesuatu…', send: 'Kirim', loading: 'Memuat…',
    stream_error: 'Siaran sementara tidak tersedia. Silakan coba lagi nanti.',
    no_room: 'Ruang siaran tidak ditemukan.', col_team: 'Tim', col_pts: 'Poin',
    footer_about: 'Platform siaran langsung olahraga & esports · skor langsung · pertandingan langsung · komunitas',
    on_air: 'SEDANG SIARAN', cam_hint: 'Klik "Buka kamera" untuk mulai', cam_denied: 'Tidak bisa mengakses kamera. Periksa izin browser.',
    start_cam: 'Buka kamera', share_screen: 'Bagikan layar', stop_live: 'Selesai', save_frame: 'Simpan sampul',
    scenes: 'Tata Ruang', overlay_tools: 'Teks & Logo (ruang iklan)', ov_text_ph: 'Ketik teks iklan…',
    add_text: 'Tambah teks', add_ticker: 'Teks berjalan', add_logo: 'Tambah Logo/gambar', clear_ov: 'Bersihkan',
    ov_tip: 'Tips: seret untuk memindahkan; klik dua kali untuk menghapus.', ticker_default: 'Selamat datang di UU9直播站',
    room_info: 'Info ruang', rm_title_ph: 'Judul siaran…', share_link: 'Tautan tonton:',
    email: 'Email', password: 'Kata sandi',
    auth_sub: 'Tonton gratis · Daftar cukup dengan email', auth_tip: 'Dengan mendaftar Anda menyetujui ketentuan. Tanpa verifikasi identitas.',
    gate_title: 'Pratinjau gratis berakhir', gate_desc: 'Daftar atau masuk untuk terus menonton penuh secara gratis (cukup email).',
    banner_text: 'Pratinjau gratis · Daftar (cukup email) untuk menonton penuh. Sisa:',
    geo_blocked: 'Siaran ini tidak tersedia di wilayah Anda.', verify_sub: 'Kami telah mengirim kode verifikasi ke email Anda', verify_code: 'Kode', verify_btn: 'Verifikasi', ad_label: 'Iklan',
    chat_pledge: '🤝 Sopan: mengobrol dengan santun, dilarang menghina, diskriminasi, spam, atau iklan.',
  },
};

let current = localStorage.getItem('la_lang') || CONFIG.DEFAULT_LANG;
if (!CONFIG.LANGS.includes(current)) current = CONFIG.DEFAULT_LANG;

export function getLang() { return current; }

export function setLang(lang) {
  if (!CONFIG.LANGS.includes(lang)) return;
  current = lang;
  localStorage.setItem('la_lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  applyDom();
  window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

/** 取一条翻译 / get a translation */
export function t(key) { return (DICT[current] && DICT[current][key]) || (DICT.zh[key] ?? key); }

/** 把页面上所有 [data-i18n] / [data-i18n-ph] 替换为当前语言 */
export function applyDom() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}

/** 语言显示名 / display label per language */
const LANG_LABEL = { zh: '中文', en: 'EN', vi: 'VI', ms: 'MS', id: 'ID' };

/** 初始化语言切换按钮 / wire up the language switcher */
export function initLangSwitch(container) {
  if (!container) return;
  container.innerHTML = CONFIG.LANGS
    .map(l => `<button data-lang="${l}" class="${l === current ? 'on' : ''}">${LANG_LABEL[l] || l.toUpperCase()}</button>`)
    .join('');
  container.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    setLang(b.dataset.lang);
    container.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.lang === current));
  });
  document.documentElement.lang = current === 'zh' ? 'zh-CN' : current;
}
