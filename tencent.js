/**
 * ============================================================
 *  腾讯云 CDN 防盗链签名 / Tencent Cloud CDN signed URL (anti-leech)
 *
 *  腾讯云直播播放地址常需带签名（TypeA: txTime + txSecret），防止盗链。
 *  Tencent live playback URLs usually need a signature (TypeA: txTime + txSecret).
 *
 *  公式 / formula (TypeA):
 *    txTime   = 过期时间的十六进制(秒) / expiry time in hex seconds
 *    txSecret = md5( KEY + streamName + txTime )
 *    最终 / final: <playUrl>?txSecret=<...>&txTime=<...>
 *
 *  ⚠️ KEY 是你在腾讯云控制台设置的「鉴权 KEY」，必须放后端，绝不暴露前端。
 *     KEY is your Tencent console "auth key" — keep it server-side only.
 *  ⚠️ 不同鉴权方式(TypeA/B/C/D)公式不同；这里实现最常见的 TypeA。
 *     按你控制台选择的类型，可能要微调。请对照腾讯云文档确认。
 *     Different auth types differ; this is TypeA. Verify against Tencent docs.
 *  ⚠️ 我无法联网用你的真实 CDN 验证，请上线后用真实域名实测。
 * ============================================================ */
import { createHash } from 'node:crypto';
import 'dotenv/config';

const KEY = process.env.TENCENT_CDN_KEY || '';          // 鉴权 KEY
const PLAY_DOMAIN = process.env.TENCENT_PLAY_DOMAIN || ''; // 例 play.your-domain.com
const APP_NAME = process.env.TENCENT_APP_NAME || 'live';   // 应用名，通常 'live'

/**
 * 生成带签名的 HLS 播放地址。
 * Build a signed HLS playback URL for a stream name.
 * @param {string} streamName  推流的流名 / the stream key
 * @param {number} ttlSec      链接有效期秒数 / link lifetime seconds (默认 4h)
 * @returns {string} 可直接放进房间 streamUrl 的 .m3u8 地址
 */
export function tencentSignedHls(streamName, ttlSec = 4 * 3600) {
  if (!PLAY_DOMAIN) return '';            // 未配置 = 返回空，调用方自行回退
  const base = `https://${PLAY_DOMAIN}/${APP_NAME}/${streamName}.m3u8`;
  if (!KEY) return base;                  // 没设鉴权 KEY = 不签名（仅测试）

  const txTime = Math.floor((Date.now() / 1000) + ttlSec).toString(16).toUpperCase();
  const txSecret = createHash('md5').update(KEY + streamName + txTime).digest('hex');
  return `${base}?txSecret=${txSecret}&txTime=${txTime}`;
}

export const tencentConfigured = () => !!PLAY_DOMAIN;
