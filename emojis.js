/**
 * 100 个聊天表情 / 100 chat emojis.
 * 用于直播间评论区的表情面板与“弹幕飘屏”反应。
 * Used by the live-room comment emoji panel and the floating reaction layer.
 *
 * 分组方便面板分标签 / grouped so the panel can show tabs.
 * 想换成你自己的自定义贴纸图片？把对应项改成 { e:'<img>HTML', n:'名称' } 即可，
 * 面板与飘屏都按 .e 字段原样渲染。
 * To use custom sticker images, replace an item's `e` with an <img> HTML string.
 */
export const EMOJI_GROUPS = [
  {
    key: 'react', label_zh: '常用', label_en: 'Hot',
    items: ['👍','❤️','🔥','👏','😂','😮','😭','🎉','💪','🙌','🤩','😍','😎','🥳','😱','🤯','😤','🫶','🤝','🙏']
  },
  {
    key: 'sport', label_zh: '体育', label_en: 'Sports',
    items: ['⚽','🏀','🏈','⚾','🎾','🏐','🏓','🏸','🥅','🏆','🥇','🥈','🥉','🎯','🚩','⏱️','📣','🟥','🟨','🧤']
  },
  {
    key: 'esport', label_zh: '电竞', label_en: 'Esports',
    items: ['🎮','🕹️','👾','🖱️','⌨️','💻','🛡️','⚔️','🗡️','🏹','💥','🧨','🚀','⚡','💯','🆙','🎖️','👑','🐉','🤖']
  },
  {
    key: 'mood', label_zh: '情绪', label_en: 'Mood',
    items: ['😀','😅','😆','😉','😊','😋','😏','😐','😒','🙄','😔','😖','😡','🤬','🥺','😴','🤔','🤗','🤫','😬']
  },
  {
    key: 'fun', label_zh: '趣味', label_en: 'Fun',
    items: ['💎','🎁','🍺','🥤','🍿','🌹','💐','✨','🌟','💫','🎆','🎇','🪅','🎊','🪄','🦄','🐐','🍀','🧧','💰']
  },
];

/** 拍平成 100 个 / flatten to all 100 */
export const ALL_EMOJIS = EMOJI_GROUPS.flatMap(g => g.items);
