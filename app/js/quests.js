// 日々のクエスト（ゲーム感覚の習慣化システム）
// core=毎日の基本クエスト、focus=日替りの「今日のフォーカス」。
// why=タップで開く軽い説明。
window.YOBOU_QUESTS = {
  core: [
    { id: "water", icon: "ti-droplet", title: "水をしっかり飲む", detail: "1.5〜2Lを目安にこまめに", why: "水分は血流・代謝・肌・便通の土台。のどが渇く前にこまめに飲むのがコツ。" },
    { id: "move", icon: "ti-walk", title: "30分以上からだを動かす", detail: "速歩でOK。食後の散歩も◎", why: "歩くだけで血糖・気分・心血管に効く。まとめて30分でも、こまめに分けてもOK。" },
    { id: "veg", icon: "ti-salad", title: "野菜＋発酵食品を食べる", detail: "腸を育てる。色と種類を意識", why: "食物繊維と発酵食品が腸内細菌のエサと菌になり、免疫・肌・メンタルを支える。" },
    { id: "protein", icon: "ti-meat", title: "毎食タンパク質をとる", detail: "魚・卵・豆・鶏など", why: "毎食のタンパク質で筋肉・肌・髪・ホルモンの材料を確保。1食で手のひら1枚分が目安。" },
    { id: "uv", icon: "ti-sun", title: "UVケア（日焼け止め）", detail: "光老化対策。曇り・室内窓際でも", why: "紫外線は見た目老化の最大要因。毎日塗ると肌老化が約24%少なかったという研究も。" },
    { id: "breath", icon: "ti-wind", title: "5分の呼吸・瞑想", detail: "自律神経を整える", why: "ゆっくりした呼吸(特に長く吐く)は自律神経を整え、ストレスと血圧を下げる。" },
    { id: "sleep", icon: "ti-moon", title: "就寝3時間前までに食事", detail: "睡眠の質を守る", why: "寝る直前の食事や飲酒は深部体温を上げ睡眠を浅くする。就寝3時間前までに済ませる。" }
  ],
  focus: [
    { id: "f-walk-meal", icon: "ti-shoe", title: "食後に10分歩く", detail: "食後血糖を抑える", why: "食後の軽い散歩は食後血糖の急上昇を抑える。眠気やだるさも減る。" },
    { id: "f-newplant", icon: "ti-plant", title: "新しい野菜/豆を1種類", detail: "週30種の多様性で腸を育てる", why: "植物の種類が多いほど腸内細菌が多様に。週30種を目標に、今日は新顔を1つ。" },
    { id: "f-omega3", icon: "ti-fish", title: "青魚を食べる", detail: "オメガ3。心血管と肌に良い油", why: "青魚のEPA/DHAは炎症を抑え、心血管・脳・肌に良い“良い油”。" },
    { id: "f-sun-morning", icon: "ti-sunrise", title: "朝に日光を浴びる", detail: "体内時計とビタミンD", why: "朝の光は体内時計をリセットし、夜の眠気とビタミンDづくりを助ける。" },
    { id: "f-strength", icon: "ti-barbell", title: "自重トレを少し", detail: "スクワット・腕立てなど", why: "自重トレで筋肉=糖の受け皿と代謝を維持。短時間でOK。" },
    { id: "f-vitc", icon: "ti-lemon-2", title: "ビタミンC食材をとる", detail: "鉄吸収＋コラーゲン(美容)", why: "ビタミンCは鉄の吸収を高め、肌のハリを作るコラーゲン生成にも必須。" },
    { id: "f-chew", icon: "ti-mood-smile", title: "よく噛んで食べる", detail: "消化と口腔ケア", why: "よく噛むと消化を助け、満腹感が出やすく、唾液で口の中も清潔に。" },
    { id: "f-nosugar", icon: "ti-bottle-off", title: "甘い飲料を1日ゼロ", detail: "糖化・血糖対策(美容にも)", why: "甘い飲料は血糖を急上昇させ糖化(老化)を進める。まずは1日ゼロから。" },
    { id: "f-isometric", icon: "ti-stretching", title: "壁ぎわスクワット2分×4", detail: "血圧に最も効く運動", why: "壁ぎわスクワット等のアイソメトリックは、降圧に最も効く運動と報告されている。息は止めない。" },
    { id: "f-gratitude", icon: "ti-heart-handshake", title: "今日よかったことを1つ書く", detail: "気分・ストレスケア", why: "良かったことを書き出すと、ストレスが和らぎ気分が安定しやすい。" },
    { id: "f-learn", icon: "ti-bulb", title: "今日の学びを1本読む", detail: "知識を1つ増やす", why: "1日1本の学びで知識が積み上がり、日々の選択が少しずつ変わる。" },
    { id: "f-stretch", icon: "ti-yoga", title: "寝る前にストレッチ", detail: "回復と睡眠の質", why: "寝る前のストレッチは体の緊張をほぐし、睡眠の質と回復を高める。" }
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
