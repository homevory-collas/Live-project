/**
 * 轻量 HTTP 客户端 / tiny HTTP client.
 * 所有适配器都通过它访问你的后端代理。
 * All adapters reach your backend proxy through this.
 */
import { CONFIG } from '../config.js';

export async function apiGet(path, params = {}) {
  const url = new URL(CONFIG.API_BASE + path, location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const err = new Error(`API ${res.status} @ ${path}`);
    err.status = res.status;
    try { err.body = await res.json(); } catch {}
    throw err;
  }
  return res.json();
}
