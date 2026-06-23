/**
 * 内置示例数据 / built-in mock data.
 * CONFIG.USE_MOCK = true 时使用，方便离线预览。
 * 接入真实 API 后改为 false，此文件即被绕过。
 * Used when CONFIG.USE_MOCK = true so the site runs with zero backend.
 * Shapes here = the INTERNAL SCHEMA your adapters must map provider data into.
 */

export const MOCK = {
  liveRooms: [
    { id: 'epl-001',  title: '英超 · 曼城 vs 利物浦（中文解说）', category: '英超 / EPL', categoryKey: 'football', viewers: 482000, cover: '#3D195B', streamer: '体育频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'ucl-002',  title: '欧冠 · 皇家马德里 vs 拜仁慕尼黑', category: '欧冠 / Champions League', categoryKey: 'football', viewers: 631000, cover: '#0A1A3F', streamer: '官方解说', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'lal-003',  title: '西甲 · 巴塞罗那 vs 马德里竞技', category: '西甲 / La Liga', categoryKey: 'football', viewers: 358000, cover: '#EE8707', streamer: '体育频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'wc-004',   title: '世界杯预选赛 · 巴西 vs 阿根廷', category: '世界杯 / World Cup', categoryKey: 'football', viewers: 894000, cover: '#C8102E', streamer: 'FIFA频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'sea-005',  title: '意甲 · 国际米兰 vs 尤文图斯', category: '意甲 / Serie A', categoryKey: 'football', viewers: 271000, cover: '#008FD7', streamer: '体育频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'csl-006',  title: '中超 · 上海海港 vs 北京国安', category: '中超 / CSL', categoryKey: 'football', viewers: 205000, cover: '#D7261E', streamer: '中超频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'kpl-007',  title: 'KPL夏季赛 · 成都AG超玩会 vs KSG', category: '王者荣耀', categoryKey: 'esport', viewers: 521000, cover: '#1668DC', streamer: '官方解说', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'lpl-008',  title: 'LPL夏季赛 · JDG vs BLG', category: '英雄联盟', categoryKey: 'esport', viewers: 319000, cover: '#C21d14', streamer: 'LPL频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'nba-009',  title: 'NBA季后赛 · 湖人 vs 凯尔特人', category: 'NBA', categoryKey: 'basket', viewers: 224000, cover: '#E03127', streamer: '篮球频道', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  ],

  scores: {
    hot: [
      { league: '欧冠 / UCL', status: 'live', clock: "73'", home: '皇家马德里', away: '拜仁慕尼黑', hs: 2, as: 2 },
      { league: '世界杯 / WC', status: 'live', clock: "55'", home: '巴西', away: '阿根廷', hs: 1, as: 0 },
      { league: '英超 / EPL', status: 'live', clock: "67'", home: '曼城', away: '利物浦', hs: 2, as: 1 },
      { league: 'NBA', status: 'live', clock: 'Q3', home: '湖人', away: '凯尔特人', hs: 54, as: 58 },
    ],
    football: [
      { league: '英超 / EPL', status: 'live', clock: "67'", home: '曼城', away: '利物浦', hs: 2, as: 1 },
      { league: '西甲 / La Liga', status: 'upcoming', clock: '明 03:00', home: '皇家马德里', away: '巴塞罗那', hs: null, as: null },
      { league: '意甲 / Serie A', status: 'finished', clock: 'FT', home: '国际米兰', away: '尤文图斯', hs: 1, as: 1 },
      { league: '德甲 / Bundesliga', status: 'live', clock: "40'", home: '拜仁慕尼黑', away: '多特蒙德', hs: 3, as: 1 },
      { league: '法甲 / Ligue 1', status: 'finished', clock: 'FT', home: '巴黎圣日耳曼', away: '马赛', hs: 2, as: 0 },
      { league: '欧冠 / UCL', status: 'live', clock: "73'", home: '皇家马德里', away: '拜仁慕尼黑', hs: 2, as: 2 },
      { league: '世界杯 / WC', status: 'live', clock: "55'", home: '巴西', away: '阿根廷', hs: 1, as: 0 },
      { league: '欧洲杯 / Euro', status: 'upcoming', clock: '周六 23:00', home: '法国', away: '德国', hs: null, as: null },
      { league: '美洲杯 / Copa America', status: 'upcoming', clock: '周日 08:00', home: '阿根廷', away: '乌拉圭', hs: null, as: null },
      { league: '亚洲杯 / Asian Cup', status: 'finished', clock: 'FT', home: '日本', away: '韩国', hs: 2, as: 1 },
      { league: '中超 / CSL', status: 'finished', clock: 'FT', home: '上海海港', away: '北京国安', hs: 2, as: 1 },
    ],
    basket: [
      { league: 'NBA', status: 'live', clock: 'Q3', home: '湖人', away: '凯尔特人', hs: 54, as: 58 },
      { league: 'NBA', status: 'finished', clock: 'FT', home: '勇士', away: '掘金', hs: 112, as: 108 },
    ],
    esport: [
      { league: 'KPL', status: 'live', clock: 'BO7 1-2', home: '成都AG', away: 'KSG', hs: 1, as: 2 },
      { league: 'LPL', status: 'finished', clock: '完', home: 'JDG', away: 'BLG', hs: 2, as: 0 },
    ],
  },

  standings: {
    epl: [
      { rank: 1, team: '阿森纳', w: 18, d: 6, l: 2, pts: 60 },
      { rank: 2, team: '利物浦', w: 17, d: 5, l: 4, pts: 56 },
      { rank: 3, team: '曼城', w: 16, d: 6, l: 4, pts: 54 },
      { rank: 4, team: '切尔西', w: 14, d: 6, l: 6, pts: 48 },
      { rank: 5, team: '热刺', w: 13, d: 5, l: 8, pts: 44 },
      { rank: 6, team: '曼联', w: 12, d: 4, l: 10, pts: 40 },
    ],
  },

  news: [
    { id: 'n1', title: '世界杯预选赛：巴西 vs 阿根廷 强强对话', category: 'football', hot: true },
    { id: 'n2', title: '欧冠焦点：皇马拜仁互交白卷悬念延续', category: 'football', hot: true },
    { id: 'n3', title: '欧洲杯前瞻：法国德国周末上演榜首大战', category: 'football' },
    { id: 'n4', title: '美洲杯：阿根廷力争卫冕，乌拉圭虎视眈眈', category: 'football' },
    { id: 'n5', title: '亚洲杯：日本2-1力克韩国晋级四强', category: 'football' },
    { id: 'n6', title: '中超：上海海港主场击败北京国安', category: 'football' },
    { id: 'n7', title: 'KPL夏季赛焦点：成都AG vs 武汉eStarPro', category: 'esport', hot: true },
    { id: 'n8', title: 'NBA季后赛：湖人凯尔特人鏖战至加时', category: 'basket' },
  ],
};

export function mockRoom(id) {
  return MOCK.liveRooms.find(r => r.id === id) || null;
}
