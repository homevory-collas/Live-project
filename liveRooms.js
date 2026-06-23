/**
 * 适配器：直播间 / Adapter: live rooms.
 * 把你的直播服务商（如自建 RTMP→HLS、或第三方）的返回结构
 * 映射到下面的“内部结构 internal shape”。UI 只认识内部结构。
 *
 * 内部结构 / internal room shape:
 *   { id, title, category, categoryKey, viewers, cover, streamer, streamUrl }
 *   streamUrl 必须是可播放的 HLS 地址 (.m3u8)  —— 这是“观众进入直播”的关键。
 *   streamUrl MUST be a playable HLS (.m3u8) URL — this is how viewers enter the stream.
 */
import { CONFIG } from '../config.js';
import { apiGet } from './client.js';
import { MOCK, mockRoom } from './mock.js';

export async function getLiveRooms() {
  if (CONFIG.USE_MOCK) return MOCK.liveRooms;

  const raw = await apiGet(CONFIG.ENDPOINTS.liveRooms);
  // TODO: 按你的服务商字段改这里 / map provider fields here:
  return (raw.rooms || raw.data || []).map(r => ({
    id: r.id ?? r.room_id,
    title: r.title ?? r.name,
    category: r.category ?? r.game ?? '',
    categoryKey: r.category_key ?? 'esport',
    viewers: Number(r.viewers ?? r.online ?? 0),
    cover: r.cover ?? r.thumbnail ?? '#1668DC',
    streamer: r.streamer ?? r.anchor ?? '',
    streamUrl: r.stream_url ?? r.hls ?? r.playback_url ?? '',
    geoAllow: r.geoAllow ?? [],
  }));
}

export async function getRoom(id) {
  if (CONFIG.USE_MOCK) return mockRoom(id);

  const resp = await apiGet(CONFIG.ENDPOINTS.room, { id });
  const r = resp.room ?? resp;            // proxy 返回 {room:{...}}，外部 API 可能直接返回
  if (!r || (!r.id && !r.room_id)) return null;
  return {
    id: r.id ?? r.room_id,
    title: r.title ?? r.name,
    category: r.category ?? r.game ?? '',
    categoryKey: r.category_key ?? 'esport',
    viewers: Number(r.viewers ?? r.online ?? 0),
    cover: r.cover ?? r.thumbnail ?? '#1668DC',
    streamer: r.streamer ?? r.anchor ?? '',
    // 关键：把服务商的播放地址放进 streamUrl
    streamUrl: r.stream_url ?? r.hls ?? r.playback_url ?? '',
  };
}
