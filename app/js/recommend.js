// 提案エンジン（ルールベース・APIキー不要）
window.Recommend = (function () {
  const DOMAINS = ["diet", "exercise", "sleep", "rest", "meditation", "supplement"];

  function applies(card, profile) {
    const a = card.applies;
    const sexOk = a.sex === "all" || a.sex.includes(profile.sex);
    const bandOk = a.ageBand === "all" || a.ageBand.includes(profile.ageBand);
    const goalOk = a.goal === "all" || a.goal.includes(profile.goal);
    return sexOk && bandOk && goalOk;
  }

  function score(card) { return (card.priority || 1) * 2 + (card.evidence || 1); }

  // プロフィールに合うカードをドメイン別に抽出・並べ替え
  function pick(profile) {
    const out = {};
    DOMAINS.forEach(d => out[d] = []);
    window.YOBOU_CARDS.forEach(c => { if (applies(c, profile)) out[c.domain].push(c); });
    DOMAINS.forEach(d => out[d].sort((x, y) => score(y) - score(x)));
    return out;
  }

  // 週間運動スケジュール（曜日0=日〜6=土）
  function weeklySchedule(profile, picked) {
    const ex = picked.exercise.map(c => c.title);
    const has = t => ex.some(e => e.includes(t));
    const cardio = has("速歩") ? "インターバル速歩" : (has("サーキット") ? "自重サーキット" : "速歩・有酸素");
    const strength = has("スクワット") ? "自重トレ(下半身)" : "自重トレ";
    const core = has("四股") ? "自重トレ(体幹・四股)" : "自重トレ(体幹)";
    // 月〜日
    const days = [
      { d: "月", item: cardio, type: "cardio" },
      { d: "火", item: strength, type: "strength" },
      { d: "水", item: "休息・軽い散歩", type: "rest" },
      { d: "木", item: cardio, type: "cardio" },
      { d: "金", item: core, type: "strength" },
      { d: "土", item: "休息・サウナ/入浴", type: "rest" },
      { d: "日", item: "長めの散歩＋ストレッチ", type: "rest" }
    ];
    if (profile.goal === "fatloss") { days[2].item = "自重サーキット"; days[2].type = "strength"; }
    if (profile.goal === "muscle") { days[6].item = "自重トレ(上半身)"; days[6].type = "strength"; }
    return days;
  }

  // 今日のおすすめ(各ドメイン1枚)
  function todayCards(picked) {
    return DOMAINS.map(d => picked[d][0]).filter(Boolean);
  }

  function build(profile) {
    const picked = pick(profile);
    return {
      createdAt: new Date().toISOString(),
      profile: { sex: profile.sex, ageBand: profile.ageBand, goal: profile.goal },
      picked,
      schedule: weeklySchedule(profile, picked),
      today: todayCards(picked)
    };
  }

  return { build, pick, DOMAINS };
})();

window.GOAL_LABELS = { fatloss: "減量", muscle: "筋肉・体力", energy: "活力・疲労回復", longevity: "長期の健康", beauty: "美容・アンチエイジング" };
window.DOMAIN_META = {
  diet: { label: "食事", icon: "ti-salad" },
  exercise: { label: "運動", icon: "ti-run" },
  sleep: { label: "睡眠", icon: "ti-moon" },
  rest: { label: "休息", icon: "ti-bath" },
  meditation: { label: "瞑想・呼吸", icon: "ti-yoga" },
  supplement: { label: "サプリ", icon: "ti-pill" }
};
