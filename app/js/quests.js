// 日々のクエスト（ゲーム感覚の習慣化システム）
// core=毎日の基本クエスト、focus=日替りの「今日のフォーカス」。
window.YOBOU_QUESTS = {
  core: [
    { id: "water", icon: "ti-droplet", title: "水をしっかり飲む", detail: "1.5〜2Lを目安にこまめに" },
    { id: "move", icon: "ti-walk", title: "30分以上からだを動かす", detail: "速歩でOK。食後の散歩も◎" },
    { id: "veg", icon: "ti-salad", title: "野菜＋発酵食品を食べる", detail: "腸を育てる。色と種類を意識" },
    { id: "protein", icon: "ti-meat", title: "毎食タンパク質をとる", detail: "魚・卵・豆・鶏など" },
    { id: "uv", icon: "ti-sun", title: "UVケア（日焼け止め）", detail: "光老化対策。曇り・室内窓際でも" },
    { id: "breath", icon: "ti-wind", title: "5分の呼吸・瞑想", detail: "自律神経を整える" },
    { id: "sleep", icon: "ti-moon", title: "就寝3時間前までに食事", detail: "睡眠の質を守る" }
  ],
  focus: [
    { id: "f-walk-meal", icon: "ti-shoe", title: "食後に10分歩く", detail: "食後血糖を抑える" },
    { id: "f-newplant", icon: "ti-plant", title: "新しい野菜/豆を1種類", detail: "週30種の多様性で腸を育てる" },
    { id: "f-omega3", icon: "ti-fish", title: "青魚を食べる", detail: "オメガ3。心血管と肌に良い油" },
    { id: "f-sun-morning", icon: "ti-sunrise", title: "朝に日光を浴びる", detail: "体内時計とビタミンD" },
    { id: "f-strength", icon: "ti-barbell", title: "自重トレを少し", detail: "スクワット・腕立てなど" },
    { id: "f-vitc", icon: "ti-lemon-2", title: "ビタミンC食材をとる", detail: "鉄吸収＋コラーゲン(美容)" },
    { id: "f-chew", icon: "ti-mood-smile", title: "よく噛んで食べる", detail: "消化と口腔ケア" },
    { id: "f-nosugar", icon: "ti-bottle-off", title: "甘い飲料を1日ゼロ", detail: "糖化・血糖対策(美容にも)" },
    { id: "f-isometric", icon: "ti-stretching", title: "壁ぎわスクワット2分×4", detail: "血圧に最も効く運動" },
    { id: "f-gratitude", icon: "ti-heart-handshake", title: "今日よかったことを1つ書く", detail: "気分・ストレスケア" },
    { id: "f-learn", icon: "ti-bulb", title: "今日の学びを1本読む", detail: "知識を1つ増やす" },
    { id: "f-stretch", icon: "ti-yoga", title: "寝る前にストレッチ", detail: "回復と睡眠の質" }
  ]
};

// 今日のクエスト（core + 日替りfocus 2件）
window.todayQuests = function (iso) {
  iso = iso || window.YDate.today();
  const f = window.YOBOU_QUESTS.focus;
  const epoch = Date.UTC(2026, 0, 1);
  const d = new Date(iso + "T00:00:00");
  const day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - epoch) / 86400000);
  const i1 = ((day % f.length) + f.length) % f.length;
  const i2 = (i1 + 1) % f.length;
  return window.YOBOU_QUESTS.core.concat([f[i1], f[i2]]);
};

window.QUEST_GOAL = 5; // 1日にこれ以上クリアでその日を「達成」とみなす

// ストリーク（達成が連続している日数）
window.questStreak = function () {
  const goal = window.QUEST_GOAL;
  const done = d => window.Store.getQuestDay(d).length >= Math.min(goal, window.todayQuests(d).length);
  let d = new Date(window.YDate.today() + "T00:00:00");
  // 今日が未達成なら昨日から数える
  if (!done(window.YDate.iso(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  for (let i = 0; i < 400; i++) {
    if (done(window.YDate.iso(d))) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
};

// レベル＆XP（累計クリア数）。1レベル=15クエスト
window.questLevel = function () {
  const all = window.Store.getAllQuests();
  let total = 0;
  Object.values(all).forEach(arr => { total += arr.length; });
  const per = 15;
  return { total, level: Math.floor(total / per) + 1, inLevel: total % per, per };
};
