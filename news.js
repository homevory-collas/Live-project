/**
 * 适配器：资讯 / Adapter: news.
 * 内部结构 / internal: { id, title, category, hot }
 */
import { CONFIG } from '../config.js';
import { apiGet } from './client.js';
import { MOCK } from './mock.js';

export async function getNews(category = '') {
  if (CONFIG.USE_MOCK) {
    return category ? MOCK.news.filter(n => n.category === category) : MOCK.news;
  }
  const raw = await apiGet(CONFIG.ENDPOINTS.news, { category });
  return (raw.articles || raw.data || []).map(a => ({
    id: a.id,
    title: a.title ?? a.headline,
    category: a.category ?? '',
    hot: !!(a.hot ?? a.top),
  }));
}
