/**
 * 适配器：体育数据 / Adapter: sports data (scores + standings).
 * 不同服务商（Sportradar / BetsAPI / SportMonks / Opta…）字段各异，
 * 在这里统一映射到内部结构。换服务商=只改这一个文件。
 *
 * 内部比分 / internal score:
 *   { league, status:'live'|'finished'|'upcoming', clock, home, away, hs, as }
 * 内部积分 / internal standing:
 *   { rank, team, w, d, l, pts }
 */
import { CONFIG } from '../config.js';
import { apiGet } from './client.js';
import { MOCK } from './mock.js';

export async function getScores(group = 'hot') {
  if (CONFIG.USE_MOCK) return MOCK.scores[group] || MOCK.scores.hot;

  const raw = await apiGet(CONFIG.ENDPOINTS.scores, { league: group });
  // RapidAPI「Free API Live Football Data」常见结构：{ response:{ live:[...] } }
  // 也兼容 { matches:[...] } / { data:[...] }。换服务商时改这里即可。
  const list = raw?.response?.live ?? raw?.response?.matches ?? raw?.response
            ?? raw.matches ?? raw.data ?? [];
  // 取名字：有的服务商把队名放在对象里 (home.name)，有的直接字符串。
  const teamName = t => (t && typeof t === 'object') ? (t.name ?? t.shortName ?? '') : (t ?? '');
  return (Array.isArray(list) ? list : []).map(m => ({
    league: teamName(m.league) || m.competition || m.leagueName || '',
    status: normStatus(m.status?.type ?? m.status ?? m.state),
    clock: m.status?.liveTime?.short ?? m.clock ?? m.minute ?? m.time ?? '',
    home: teamName(m.home ?? m.home_team ?? m.teams?.home ?? m.team1),
    away: teamName(m.away ?? m.away_team ?? m.teams?.away ?? m.team2),
    hs: pickScore(m.home?.score ?? m.goals?.home ?? m.home_score ?? m.hs ?? m.score_home),
    as: pickScore(m.away?.score ?? m.goals?.away ?? m.away_score ?? m.as ?? m.score_away),
  }));
}

export async function getStandings(league = 'epl') {
  if (CONFIG.USE_MOCK) return MOCK.standings[league] || MOCK.standings.epl;

  const raw = await apiGet(CONFIG.ENDPOINTS.standings, { league });
  return (raw.table || raw.standings || raw.data || []).map((row, i) => ({
    rank: row.rank ?? row.position ?? i + 1,
    team: row.team ?? row.name,
    w: Number(row.w ?? row.win ?? 0),
    d: Number(row.d ?? row.draw ?? 0),
    l: Number(row.l ?? row.loss ?? 0),
    pts: Number(row.pts ?? row.points ?? 0),
  }));
}

function normStatus(s) {
  s = String(s || '').toLowerCase();
  if (['live', 'inprogress', 'playing', '1', '进行中'].includes(s)) return 'live';
  if (['finished', 'ended', 'ft', 'closed', '完'].includes(s)) return 'finished';
  return 'upcoming';
}
function pickScore(v) { return v === undefined || v === null || v === '' ? null : Number(v); }
