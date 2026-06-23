/** DOM 渲染小工具 / small render helpers */

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 中文习惯：万 / 亿；英文：K / M */
export function fmtViewers(n, lang) {
  n = Number(n) || 0;
  if (lang === 'zh') {
    if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
    return String(n);
  }
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function qs(name) {
  return new URLSearchParams(location.search).get(name);
}
