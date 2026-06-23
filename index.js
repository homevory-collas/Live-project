/**
 * 统一内部接口 / Unified internal API.
 * 整个前端只调用这里的方法，不直接接触任何服务商。
 * The whole UI talks ONLY to this module, never to a provider directly.
 * 这样换/加数据源时，UI 一行都不用改。
 * So swapping/adding providers never touches UI code.
 */
import { getLiveRooms, getRoom } from './adapters/liveRooms.js';
import { getScores, getStandings } from './adapters/sports.js';
import { getNews } from './adapters/news.js';

export const api = { getLiveRooms, getRoom, getScores, getStandings, getNews };
