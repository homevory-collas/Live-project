/**
 * 前端账号助手 / Frontend auth helper.
 * 负责保存登录令牌、调用 /api/auth/*。
 * Stores the session token and calls the /api/auth/* endpoints.
 *
 * 令牌存在 localStorage，便于跨页保持登录。
 * Token kept in localStorage so login persists across pages.
 */
import { CONFIG } from './config.js';

const BASE = CONFIG.API_BASE.replace(/\/$/, '');
const KEY = 'la_token';

export const auth = {
  token: () => localStorage.getItem(KEY) || '',
  isLoggedIn: () => !!localStorage.getItem(KEY),
  setToken: t => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),

  async register(email, password) {
    const r = await fetch(`${BASE}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'register_failed');
    if (data.needVerify) return { needVerify: true, email: data.email };   // 需要验证码 / needs code
    auth.setToken(data.token);
    return data;
  },

  async verify(email, code) {
    const r = await fetch(`${BASE}/auth/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'verify_failed');
    auth.setToken(data.token);
    return data;
  },

  async login(email, password) {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'login_failed');
    auth.setToken(data.token);
    return data;
  },

  async me() {
    if (!auth.isLoggedIn()) return null;
    try {
      const r = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${auth.token()}` } });
      if (!r.ok) { auth.clear(); return null; }
      return await r.json();
    } catch { return null; }
  },

  async logout() {
    try { await fetch(`${BASE}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${auth.token()}` } }); } catch {}
    auth.clear();
  },
};
