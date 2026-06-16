// アプリ本体（ルーティング・状態管理）
(function () {
  let onb = { sex: "male", age: 34, goal: "energy" };

  function startOnboarding() {
    UI.hideNav();
    UI.onboarding(onb, {
      setSex: s => { onb.sex = s; startOnboarding(); },
      setAge: a => { onb.age = a; const lbl = document.querySelector(".lbl .muted"); if (lbl) lbl.textContent = a + "歳（" + bandText(window.ageToBand(a)) + "）"; },
      setGoal: g => { onb.goal = g; startOnboarding(); },
      make: () => {
        const profile = { sex: onb.sex, age: onb.age, ageBand: window.ageToBand(onb.age), goal: onb.goal, createdAt: window.YDate.today() };
        Store.setProfile(profile);
        Store.setPlan(Recommend.build(profile));
        go("home");
      }
    });
  }
  function bandText(b) { return { "20s": "20代", "30s": "30代", "40s": "40代", "50s": "50代", "60s": "60代以上" }[b]; }

  const handlers = {
    nav: go,
    openArticle: id => { UI.nav("learn", handlers); UI.articleDetail(id, handlers); window.scrollTo(0, 0); },
    openGut: () => { UI.nav("gut", handlers); UI.gutGuide(handlers); window.scrollTo(0, 0); },
    openBeauty: () => { UI.nav("gut", handlers); UI.beautyGuide(handlers); window.scrollTo(0, 0); },
    makeQuest: (item, type) => {
      const icon = type === "strength" ? "ti-barbell" : type === "cardio" ? "ti-walk" : "ti-bath";
      const w = window.YOBOU_WORKOUTS[item];
      const q = { id: "wk-" + item, icon, title: item, detail: "プランの運動メニュー", why: (w && w.desc) || "今日のプランの運動。ホームでクリアできます。", custom: true };
      const added = Store.addCustomQuest(window.YDate.today(), q);
      window._toast = added ? "ホームのクエストに追加しました" : "すでに追加済みです";
      go("home");
    },
    toggleQuest: id => {
      const date = window.YDate.today();
      const wasDone = Store.getQuestDay(date).includes(id);
      Store.toggleQuest(date, id);
      window._justCleared = wasDone ? null : id;
      go("home");
    },
    openCondition: id => { UI.nav("condition", handlers); UI.conditionDetail(id, handlers); window.scrollTo(0, 0); },
    toggleCondition: id => { Store.toggleCondition(id); go("care"); },
    toggleCare: (condId, date, habitId) => {
      Store.toggleCareHabit(condId, date, habitId);
      UI.nav("condition", handlers); UI.conditionDetail(condId, handlers);
    },
    toggle: domain => {
      const date = window.YDate.today();
      const log = Store.getLog(date) || { date, done: [] };
      log.done = log.done || [];
      const i = log.done.indexOf(domain);
      if (i >= 0) log.done.splice(i, 1); else log.done.push(domain);
      Store.upsertLog(log);
      go("home");
    },
    save: data => {
      const date = window.YDate.today();
      const log = Object.assign(Store.getLog(date) || { date, done: [] }, data);
      Store.upsertLog(log);
      go("history");
    },
    edit: () => { const p = Store.getProfile(); onb = { sex: p.sex, age: p.age, goal: p.goal }; startOnboarding(); },
    exportData: () => {
      const blob = new Blob([Store.exportAll()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "yobou-data.json"; a.click();
    },
    reset: () => { if (confirm("すべてのデータを消して最初からにしますか？")) { Store.reset(); go("home"); } }
  };

  function go(route) {
    const profile = Store.getProfile();
    if (!profile) { startOnboarding(); return; }
    let plan = Store.getPlan();
    if (!plan) { plan = Recommend.build(profile); Store.setPlan(plan); }
    UI.nav(route, handlers);
    const date = window.YDate.today();
    if (route === "home") UI.home(profile, plan, Store.getLog(date), handlers);
    else if (route === "plan") UI.plan(profile, plan, handlers);
    else if (route === "meals") UI.meals(profile, handlers);
    else if (route === "learn") UI.learn(handlers);
    else if (route === "care") UI.care(handlers);
    else if (route === "log") UI.logForm(date, Store.getLog(date), handlers);
    else if (route === "history") UI.history(Store.getLogs());
    else if (route === "settings") UI.settings(profile, handlers);
    window.scrollTo(0, 0);
  }

  window.addEventListener("DOMContentLoaded", () => go("home"));
})();
