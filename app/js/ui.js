// 画面描画
window.UI = (function () {
  const el = id => document.getElementById(id);
  const esc = s => (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const stars = n => "★★★".slice(0, n) + "☆☆☆".slice(0, 3 - n);

  function domainChip(d) {
    const m = window.DOMAIN_META[d];
    return `<span class="chip"><i class="ti ${m.icon}"></i>${m.label}</span>`;
  }

  function cardHTML(c, opts) {
    opts = opts || {};
    return `<article class="card domain-${c.domain}">
      <div class="card-head">${domainChip(c.domain)}<span class="ev" title="信頼度">${stars(c.evidence)}</span></div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.body)}</p>
      ${opts.source ? `<div class="src">出典: ${esc(c.source)}</div>` : ""}
    </article>`;
  }

  // ---- オンボーディング ----
  function onboarding(state, handlers) {
    const sex = state.sex, goal = state.goal, age = state.age;
    const goals = [["fatloss", "減量"], ["muscle", "筋肉・体力"], ["energy", "活力・疲労回復"], ["longevity", "長期の健康"]];
    el("app").innerHTML = `
      <div class="onb">
        <div class="onb-card">
          <div class="step"><i class="ti ti-user-plus"></i> はじめの設定</div>
          <h2>あなたに合わせます</h2>

          <label class="lbl">性別</label>
          <div class="seg">
            <button class="seg-b ${sex === "male" ? "on" : ""}" data-sex="male">男性</button>
            <button class="seg-b ${sex === "female" ? "on" : ""}" data-sex="female">女性</button>
          </div>

          <label class="lbl">年齢 <span class="muted">${age}歳（${bandLabel(window.ageToBand(age))}）</span></label>
          <input type="range" id="age" min="18" max="80" step="1" value="${age}">

          <label class="lbl">目的</label>
          <div class="goal-grid">
            ${goals.map(([v, t]) => `<button class="goal-b ${goal === v ? "on" : ""}" data-goal="${v}">${t}</button>`).join("")}
          </div>

          <button class="primary" id="make">プランを作る</button>
        </div>
      </div>`;
    el("app").querySelectorAll("[data-sex]").forEach(b => b.onclick = () => handlers.setSex(b.dataset.sex));
    el("app").querySelectorAll("[data-goal]").forEach(b => b.onclick = () => handlers.setGoal(b.dataset.goal));
    el("age").oninput = e => handlers.setAge(+e.target.value);
    el("make").onclick = handlers.make;
  }

  function bandLabel(b) { return { "20s": "20代", "30s": "30代", "40s": "40代", "50s": "50代", "60s": "60代以上" }[b]; }

  // ---- ホーム ----
  function home(profile, plan, log, handlers) {
    const date = window.YDate.today();
    const tcards = plan.today;
    const doneSet = new Set((log && log.done) || []);
    const ringN = tcards.filter(c => doneSet.has(c.domain)).length;
    const art = window.todaysArticle();
    const artRead = window.Store.isRead(art.id);
    el("app").innerHTML = `
      <header class="top">
        <div><div class="muted sm">${window.YDate.label(date)}</div><h2>今日のプラン</h2></div>
        <div class="head-right">
          <div class="ring">${ringN}/${tcards.length}</div>
          <button class="iconbtn" id="goSettings" aria-label="設定"><i class="ti ti-settings"></i></button>
        </div>
      </header>
      <div class="sub">${{male:"男性",female:"女性"}[profile.sex]} · ${bandLabel(profile.ageBand)} · ${window.GOAL_LABELS[profile.goal]}</div>

      <button class="learn-card" id="goLearn">
        <div class="learn-tag"><i class="ti ti-bulb"></i> 今日の学び · ${art.min}分 ${artRead ? '<span class="readbadge"><i class="ti ti-check"></i>読了</span>' : ""}</div>
        <div class="learn-title">${esc(art.title)}</div>
        <div class="learn-cat">${art.cat}</div>
      </button>

      <div class="today-list">
        ${tcards.map(c => `
          <button class="today-item ${doneSet.has(c.domain) ? "done" : ""}" data-domain="${c.domain}">
            <i class="ti ${doneSet.has(c.domain) ? "ti-circle-check" : "ti-circle"}"></i>
            <span class="ti-area">
              <span class="t">${window.DOMAIN_META[c.domain].label} · ${esc(c.title)}</span>
              <span class="d">${esc(c.body).slice(0, 38)}…</span>
            </span>
          </button>`).join("")}
      </div>
      <button class="ghost" id="goLog"><i class="ti ti-pencil"></i> 今日の記録をつける</button>
    `;
    el("app").querySelectorAll("[data-domain]").forEach(b => b.onclick = () => handlers.toggle(b.dataset.domain));
    el("goLog").onclick = () => handlers.nav("log");
    el("goSettings").onclick = () => handlers.nav("settings");
    el("goLearn").onclick = () => handlers.openArticle(art.id);
  }

  // ---- 週間プラン ----
  function plan(profile, plan) {
    const tip = profile.goal === "muscle" ? "タンパク質を毎食しっかり＋漸進的に負荷を上げる。"
      : profile.goal === "fatloss" ? "野菜・タンパク質を先に。夜の炭水化物は控えめ。"
      : profile.goal === "energy" ? "鉄分と睡眠を最優先。速歩でミトコンドリア活性。"
      : "地中海食＋食物繊維。速歩・筋トレ・柔軟をバランスよく。";
    el("app").innerHTML = `
      <header class="top"><div><h2>週間プラン</h2><div class="muted sm">${window.GOAL_LABELS[profile.goal]}向け</div></div></header>
      <div class="week">
        ${plan.schedule.map(s => `<div class="wrow">
          <span class="wd">${s.d}</span>
          <span class="witem type-${s.type}">${esc(s.item)}</span>
        </div>`).join("")}
      </div>
      <div class="tip"><i class="ti ti-bulb"></i> ${tip}</div>
      <h3 class="sec">領域別のおすすめ</h3>
      <div class="cards">
        ${window.Recommend.DOMAINS.map(d => (plan.picked[d][0] ? cardHTML(plan.picked[d][0], { source: true }) : "")).join("")}
      </div>
    `;
  }

  // ---- 献立 ----
  function meals(profile, handlers) {
    const m = window.YOBOU_MEALS[profile.goal];
    const w = window.YOBOU_WOMEN;
    const showMeno = ["40s", "50s", "60s"].includes(profile.ageBand);
    const womenBlock = profile.sex === "female" ? `
      <div class="women-box">
        <div class="women-head"><i class="ti ti-venus"></i> 女性へのポイント</div>
        <ul class="points">${w.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
        <div class="cycle-head">月経周期に合わせて</div>
        ${w.cycle.map(c => `<div class="cycle-row"><span class="cycle-ph">${esc(c.phase)}</span><span>${esc(c.note)}</span></div>`).join("")}
        ${showMeno ? `<div class="meno"><i class="ti ti-info-circle"></i> ${esc(w.menopause)}</div>` : ""}
      </div>` : "";
    el("app").innerHTML = `
      <header class="top"><div><h2>目的別の献立</h2><div class="muted sm">${m.label}向け${profile.sex === "female" ? " · 女性" : ""}</div></div></header>
      <div class="tip"><i class="ti ti-bulb"></i> ${esc(m.intro)}</div>
      ${womenBlock}
      ${m.days.map((d, i) => `
        <div class="meal-day">
          <div class="meal-dayhead">DAY ${i + 1}</div>
          <div class="meal-row"><span class="meal-when"><i class="ti ti-sun"></i>朝</span><span>${esc(d.breakfast)}</span></div>
          <div class="meal-row"><span class="meal-when"><i class="ti ti-sun-high"></i>昼</span><span>${esc(d.lunch)}</span></div>
          <div class="meal-row"><span class="meal-when"><i class="ti ti-moon"></i>夜</span><span>${esc(d.dinner)}</span></div>
          ${d.snack ? `<div class="meal-row"><span class="meal-when"><i class="ti ti-coffee"></i>間食</span><span>${esc(d.snack)}</span></div>` : ""}
        </div>`).join("")}
      <h3 class="sec">この目的のポイント</h3>
      <ul class="points">${m.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      <p class="muted sm note">すべてスーパーで買える食材です。苦手なものは同じ枠の別案に置き換えてOK。</p>
    `;
  }

  // ---- 学び(記事一覧) ----
  function learn(handlers) {
    const arts = window.YOBOU_ARTICLES;
    const today = window.todaysArticle();
    const cats = {};
    arts.forEach(a => { (cats[a.cat] = cats[a.cat] || []).push(a); });
    el("app").innerHTML = `
      <header class="top"><div><h2>3分で学ぶ</h2><div class="muted sm">予防医学コラム ${arts.length}本</div></div></header>
      <button class="learn-card today" id="todayArt">
        <div class="learn-tag"><i class="ti ti-star"></i> 今日の1本 · ${today.min}分</div>
        <div class="learn-title">${esc(today.title)}</div>
        <div class="learn-cat">${today.cat}</div>
      </button>
      ${Object.keys(cats).map(cat => `
        <h3 class="sec">${cat}</h3>
        <div class="art-list">
          ${cats[cat].map(a => `<button class="art-item" data-art="${a.id}">
            <span>${esc(a.title)}</span>
            <span class="art-meta">${window.Store.isRead(a.id) ? '<i class="ti ti-check read"></i>' : ""}${a.min}分 <i class="ti ti-chevron-right"></i></span>
          </button>`).join("")}
        </div>`).join("")}
    `;
    el("todayArt").onclick = () => handlers.openArticle(today.id);
    el("app").querySelectorAll("[data-art]").forEach(b => b.onclick = () => handlers.openArticle(b.dataset.art));
  }

  function articleDetail(id, handlers) {
    const a = window.YOBOU_ARTICLES.find(x => x.id === id);
    window.Store.markRead(id);
    el("app").innerHTML = `
      <button class="back" id="back"><i class="ti ti-arrow-left"></i> 戻る</button>
      <div class="art-cat-pill">${a.cat} · ${a.min}分</div>
      <h2 class="art-h">${esc(a.title)}</h2>
      <div class="art-body">${a.body.split("\n").map(p => `<p>${esc(p)}</p>`).join("")}</div>
      <div class="art-done"><i class="ti ti-circle-check"></i> 読了しました</div>
    `;
    el("back").onclick = () => handlers.nav("learn");
  }

  // ---- 記録 ----
  function logForm(date, log, handlers) {
    log = log || {};
    el("app").innerHTML = `
      <header class="top"><div><h2>記録</h2><div class="muted sm">${window.YDate.label(date)}</div></div></header>
      <form id="logf" class="form">
        <label class="lbl">体重 (kg)</label>
        <input type="number" step="0.1" id="weight" value="${log.weightKg || ""}" placeholder="例 68.5">
        <label class="lbl">睡眠時間 (h)</label>
        <input type="number" step="0.5" id="sleep" value="${log.sleepHours || ""}" placeholder="例 7">
        <label class="lbl">睡眠の質: <span id="sqv">${log.sleepQuality || 3}</span>/5</label>
        <input type="range" id="sq" min="1" max="5" step="1" value="${log.sleepQuality || 3}">
        <label class="lbl">気分: <span id="mv">${log.mood || 3}</span>/5</label>
        <input type="range" id="mood" min="1" max="5" step="1" value="${log.mood || 3}">
        <label class="lbl">瞑想・呼吸 (分)</label>
        <input type="number" step="1" id="med" value="${log.meditationMin || ""}" placeholder="例 5">
        <label class="lbl">メモ</label>
        <textarea id="notes" rows="2" placeholder="気づいたこと">${esc(log.notes || "")}</textarea>
        <button class="primary" type="submit">保存</button>
      </form>
      <button class="ghost" id="goHist"><i class="ti ti-chart-line"></i> これまでの推移を見る</button>`;
    el("sq").oninput = e => el("sqv").textContent = e.target.value;
    el("mood").oninput = e => el("mv").textContent = e.target.value;
    el("goHist").onclick = () => handlers.nav("history");
    el("logf").onsubmit = e => {
      e.preventDefault();
      handlers.save({
        weightKg: parseFloat(el("weight").value) || null,
        sleepHours: parseFloat(el("sleep").value) || null,
        sleepQuality: +el("sq").value, mood: +el("mood").value,
        meditationMin: parseInt(el("med").value) || null,
        notes: el("notes").value
      });
    };
  }

  // ---- 履歴 ----
  function history(logs) {
    const recent = logs.slice(-14);
    el("app").innerHTML = `
      <header class="top"><div><h2>記録の推移</h2><div class="muted sm">直近${recent.length}日</div></div></header>
      ${recent.length ? `<canvas id="chart" height="160"></canvas>
      <div class="legend"><span class="lg w">体重</span><span class="lg s">睡眠h</span><span class="lg m">気分</span></div>
      <div class="histlist">${recent.slice().reverse().map(l => `<div class="hrow">
        <span>${window.YDate.label(l.date)}</span>
        <span class="muted">${l.weightKg ? l.weightKg + "kg" : "-"} · ${l.sleepHours ? l.sleepHours + "h" : "-"} · 気分${l.mood || "-"}</span>
      </div>`).join("")}</div>` : `<p class="empty">まだ記録がありません。「記録」から入力してみましょう。</p>`}
    `;
    if (recent.length) drawChart(recent);
  }

  function drawChart(logs) {
    const cv = el("chart"); if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = cv.clientWidth, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const pad = 24, n = logs.length;
    const series = [
      { key: "weightKg", color: "#378ADD" },
      { key: "sleepHours", color: "#1D9E75" },
      { key: "mood", color: "#D85A30" }
    ];
    series.forEach(s => {
      const vals = logs.map(l => l[s.key]);
      const nums = vals.filter(v => v != null);
      if (!nums.length) return;
      const mn = Math.min(...nums), mx = Math.max(...nums), rng = (mx - mn) || 1;
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.beginPath();
      let started = false;
      vals.forEach((v, i) => {
        if (v == null) return;
        const x = pad + (W - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1));
        const y = H - pad - (H - 2 * pad) * ((v - mn) / rng);
        started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true;
        ctx.fillStyle = s.color; ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      });
      ctx.stroke();
    });
  }

  // ---- 設定 ----
  function settings(profile, handlers) {
    el("app").innerHTML = `
      <header class="top"><div><h2>設定</h2></div></header>
      <div class="setrow"><span>プロフィール</span><span class="muted">${{male:"男性",female:"女性"}[profile.sex]} · ${bandLabel(profile.ageBand)} · ${window.GOAL_LABELS[profile.goal]}</span></div>
      <button class="ghost" id="edit"><i class="ti ti-edit"></i> プロフィールを編集（再設定）</button>
      <button class="ghost" id="export"><i class="ti ti-download"></i> データを書き出す</button>
      <button class="ghost danger" id="reset"><i class="ti ti-trash"></i> すべて初期化</button>
      <p class="muted sm note">データはこの端末内にのみ保存されます（サーバー送信なし）。</p>`;
    el("edit").onclick = handlers.edit;
    el("export").onclick = handlers.exportData;
    el("reset").onclick = handlers.reset;
  }

  function nav(active, handlers) {
    const items = [["home", "ホーム", "ti-home"], ["plan", "プラン", "ti-calendar"], ["meals", "献立", "ti-salad"], ["learn", "学び", "ti-bulb"], ["log", "記録", "ti-pencil"]];
    if (["history", "settings"].includes(active)) active = active === "history" ? "log" : "home";
    el("nav").innerHTML = items.map(([k, t, ic]) =>
      `<button class="${active === k ? "on" : ""}" data-nav="${k}"><i class="ti ${ic}"></i><span>${t}</span></button>`).join("");
    el("nav").querySelectorAll("[data-nav]").forEach(b => b.onclick = () => handlers.nav(b.dataset.nav));
    el("nav").style.display = "flex";
  }
  function hideNav() { el("nav").style.display = "none"; }

  return { onboarding, home, plan, meals, learn, articleDetail, logForm, history, settings, nav, hideNav };
})();
