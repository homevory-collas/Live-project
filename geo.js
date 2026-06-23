/**
 * ============================================================
 *  地理识别 / Geo detection (for geo-blocking)
 *  从 CDN/反代注入的请求头读取国家代码。
 *  Reads the visitor country code from headers injected by your CDN/proxy.
 *
 *  常见来源 / common sources:
 *    Cloudflare:        CF-IPCountry
 *    阿里云/腾讯云 CDN:  自定义回源头（在 CDN 控制台配置）
 *    通用反代:          X-Country / X-Geo-Country
 *
 *  ⚠️ 重要：网页层 geo-blocking 只能挡普通用户。真正的硬限制必须在 CDN/媒体层做
 *     （按地区签发播放令牌、CDN 区域封锁），否则可用 VPN 或直接取 .m3u8 绕过。
 *     Web-layer geo-blocking only deters casual users. HARD enforcement must
 *     happen at the CDN/media layer (geo token, regional block), or it's
 *     bypassable via VPN or by grabbing the .m3u8 directly.
 *
 *  ⚠️ 若需要从 IP 自行解析国家，请接入 GeoIP 库/服务（MaxMind GeoLite2 等），
 *     在 countryFromIp() 里实现。本文件默认只读 CDN 头。
 * ============================================================ */

export function visitorCountry(req) {
  const h = req.headers;
  const c = h['cf-ipcountry'] || h['x-country'] || h['x-geo-country'] || h['x-vercel-ip-country'];
  return (c ? String(c).toUpperCase() : '') || 'XX';   // XX = 未知 / unknown
}

/**
 * 房间是否允许该国家观看。
 * geoAllow 为空数组 = 不限制（全部允许）。
 * Is the room watchable from this country?
 * Empty geoAllow = no restriction (allow all).
 */
export function isAllowed(room, country) {
  const allow = room?.geoAllow || [];
  if (!allow.length) return true;            // 未设置 = 全开 / unset = open
  if (country === 'XX') return true;         // 未知国家时放行（避免误杀）；要严格可改为 false
  return allow.includes(country);
}
