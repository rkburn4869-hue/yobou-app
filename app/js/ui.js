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
    const goals = [["fatloss", "減量"], ["muscle", "筋肉・体力"], ["energy", "活力・疲労回復"], ["longevity", "長期の健康"], ["beauty", "美容・アンチエイジング"]];
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

  // ---- ホーム（今日のクエスト） ----
  function home(profile, plan, log, handlers) {
    const date = window.YDate.today();
    const quests = window.todayQuests(date);
    const doneSet = new Set(window.Store.getQuestDay(date));
    const ringN = quests.filter(q => doneSet.has(q.id)).length;
    const pct = Math.round((ringN / quests.length) * 100);
    const streak = window.questStreak();
    const lv = window.questLevel();
    const allDone = ringN === quests.length;
    const just = window._justCleared; window._justCleared = null;
    const art = window.todaysArticle();
    const artRead = window.Store.isRead(art.id);
    el("app").innerHTML = `
      <header class="top">
        <div><div class="muted sm">${window.YDate.label(date)}</div><h2>今日のクエスト</h2></div>
        <button class="iconbtn" id="goSettings" aria-label="設定"><i class="ti ti-settings"></i></button>
      </header>

      <div class="quest-stats">
        <div class="qring" style="--p:${pct}"><div class="qring-in">${ringN}/${quests.length}</div></div>
        <div class="qmeta">
          <div class="qrow"><span class="qbadge lv">Lv.${lv.level}</span><span class="qstreak"><i class="ti ti-flame"></i> ${streak}日連続</span></div>
          <div class="qxp"><div class="qxp-bar" style="width:${Math.round((lv.inLevel / lv.per) * 100)}%"></div></div>
          <div class="qxp-lbl">次のレベルまで ${lv.per - lv.inLevel}クエスト</div>
        </div>
      </div>
      ${allDone ? `<div class="qclear"><i class="ti ti-trophy"></i> 今日のクエスト完了！おみごと</div>` : ""}

      <button class="learn-card" id="goLearn">
        <div class="learn-tag"><i class="ti ti-bulb"></i> 今日の学び · ${art.min}分 ${artRead ? '<span class="readbadge"><i class="ti ti-check"></i>読了</span>' : ""}</div>
        <div class="learn-title">${esc(art.title)}</div>
        <div class="learn-cat">${art.cat}</div>
      </button>

      <div class="today-list">
        ${quests.map(q => {
          const done = doneSet.has(q.id);
          return `<div class="quest ${done ? "done" : ""} ${q.id === just ? "just" : ""}" id="q-${q.id}">
            <button class="quest-head" data-expand="${q.id}">
              <i class="ti ${done ? "ti-circle-check" : "ti-circle"} qcheck"></i>
              <span class="ti-area">
                <span class="t"><i class="ti ${q.icon} qico"></i>${esc(q.title)}</span>
                <span class="d">${esc(q.detail)}</span>
              </span>
              <i class="ti ti-chevron-down qchev"></i>
            </button>
            <div class="quest-body" id="qb-${q.id}" hidden>
              <p class="quest-why">${esc(q.why)}</p>
              <button class="quest-clear ${done ? "undo" : ""}" data-clear="${q.id}">
                ${done ? '<i class="ti ti-rotate-2"></i> クリアを取り消す' : '<i class="ti ti-check"></i> クリアする'}
              </button>
            </div>
          </div>`;
        }).join("")}
      </div>
      <button class="ghost" id="goLog"><i class="ti ti-pencil"></i> 今日の記録をつける</button>
    `;
    el("app").querySelectorAll("[data-expand]").forEach(b => b.onclick = () => {
      const id = b.dataset.expand, body = el("qb-" + id), item = el("q-" + id);
      const opening = body.hasAttribute("hidden");
      body.toggleAttribute("hidden", !opening);
      item.classList.toggle("open", opening);
    });
    el("app").querySelectorAll("[data-clear]").forEach(b => b.onclick = () => handlers.toggleQuest(b.dataset.clear));
    el("goLog").onclick = () => handlers.nav("log");
    el("goSettings").onclick = () => handlers.nav("settings");
    el("goLearn").onclick = () => handlers.openArticle(art.id);
  }

  // ---- 週間プラン ----
  function plan(profile, plan) {
    const tip = profile.goal === "muscle" ? "タンパク質を毎食しっかり＋漸進的に負荷を上げる。"
      : profile.goal === "fatloss" ? "野菜・タンパク質を先に。夜の炭水化物は控えめ。"
      : profile.goal === "energy" ? "鉄分と睡眠を最優先。速歩でミトコンドリア活性。"
      : profile.goal === "beauty" ? "日焼け止め＋抗酸化食材＋しっかり睡眠。糖化を防ぎ血流を上げる。"
      : "地中海食＋食物繊維。速歩・筋トレ・柔軟をバランスよく。";
    el("app").innerHTML = `
      <header class="top"><div><h2>週間プラン</h2><div class="muted sm">${window.GOAL_LABELS[profile.goal]}向け</div></div></header>
      <div class="muted sm wk-hint"><i class="ti ti-hand-finger"></i> 曜日をタップすると種目・回数・セットが見られます</div>
      <div class="week">
        ${plan.schedule.map((s, i) => {
          const w = window.YOBOU_WORKOUTS[s.item];
          return `<div class="wday">
            <button class="wrow" data-wexp="${i}">
              <span class="wd">${s.d}</span>
              <span class="witem type-${s.type}">${esc(s.item)}</span>
              <i class="ti ti-chevron-down wchev"></i>
            </button>
            <div class="wdetail" id="wd-${i}" hidden>
              ${w ? `<p class="wdesc">${esc(w.desc)}</p>
                <ul class="wlist">${w.items.map(it => `<li><span class="wname">${esc(it.name)}</span><span class="wsets">${esc(it.sets)}</span></li>`).join("")}</ul>
                ${w.points && w.points.length ? `<div class="wpoints"><i class="ti ti-bulb"></i> ${w.points.map(esc).join(" ・ ")}</div>` : ""}`
                : `<p class="wdesc">この日はゆっくり休んで回復にあてましょう。</p>`}
            </div>
          </div>`;
        }).join("")}
      </div>
      <div class="tip"><i class="ti ti-bulb"></i> ${tip}</div>
      <h3 class="sec">領域別のおすすめ</h3>
      <div class="cards">
        ${window.Recommend.DOMAINS.map(d => (plan.picked[d][0] ? cardHTML(plan.picked[d][0], { source: true }) : "")).join("")}
      </div>
    `;
    el("app").querySelectorAll("[data-wexp]").forEach(b => b.onclick = () => {
      const i = b.dataset.wexp, body = el("wd-" + i), day = b.parentElement;
      const opening = body.hasAttribute("hidden");
      body.toggleAttribute("hidden", !opening);
      day.classList.toggle("open", opening);
    });
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
      <button class="gut-card" id="gutGuide">
        <div class="gut-card-l"><i class="ti ti-bug"></i></div>
        <div class="gut-card-r"><div class="gut-card-t">腸を育てる完全ガイド</div><div class="gut-card-s">腸内細菌の重要性と、最高の環境に育てる方法</div></div>
        <i class="ti ti-chevron-right"></i>
      </button>
      <button class="gut-card beauty" id="beautyGuide">
        <div class="gut-card-l"><i class="ti ti-sparkles"></i></div>
        <div class="gut-card-r"><div class="gut-card-t">美容・アンチエイジング</div><div class="gut-card-s">紫外線・糖化・睡眠…若さを保つ実践ガイド</div></div>
        <i class="ti ti-chevron-right"></i>
      </button>
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
    el("gutGuide").onclick = () => handlers.openGut();
    el("beautyGuide").onclick = () => handlers.openBeauty();
    el("app").querySelectorAll("[data-art]").forEach(b => b.onclick = () => handlers.openArticle(b.dataset.art));
  }

  // ---- 腸活ガイド ----
  function gutGuide(handlers) {
    const g = window.YOBOU_GUT;
    el("app").innerHTML = `
      <button class="back" id="back"><i class="ti ti-arrow-left"></i> 学び</button>
      <header class="top"><div><h2>腸を育てる完全ガイド</h2><div class="muted sm">腸内細菌を最高の環境に</div></div></header>
      <p class="cond-ov">${esc(g.intro)}</p>
      ${g.sections.map(s => `
        <div class="careblk">
          <div class="careblk-h"><i class="ti ${s.icon}"></i> ${esc(s.title)}</div>
          <ul>${s.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
        </div>`).join("")}

      <h3 class="sec">サプリ・ハーブ（任意・主治医と）</h3>
      <div class="supp-note"><i class="ti ti-flask"></i> 土台は“食事(発酵食品＋食物繊維)”。下記は一次情報(RCT/コホート)で確認した補助。薬がある人や免疫が弱い人は主治医に相談を。</div>
      <div class="cards">
        ${g.supplements.map(s => `
          <article class="card">
            <div class="card-head"><span class="chip"><i class="ti ti-flask"></i>${esc(s.name)}</span><span class="ev">${stars(s.evidence)}</span></div>
            <p class="supp-dose"><i class="ti ti-prescription"></i> ${esc(s.dose)}</p>
            <p>${esc(s.effect)}</p>
            <p class="supp-caution"><i class="ti ti-alert-triangle"></i> ${esc(s.caution)}</p>
            <div class="src">出典: ${esc(s.source)}</div>
          </article>`).join("")}
      </div>
      <p class="muted sm note">※ 持病・服薬・妊娠中・免疫低下のある人は、サプリ開始前に主治医に相談してください。</p>
    `;
    el("back").onclick = () => handlers.nav("learn");
  }

  // ---- 美容・アンチエイジングガイド ----
  function beautyGuide(handlers) {
    const g = window.YOBOU_BEAUTY;
    el("app").innerHTML = `
      <button class="back" id="back"><i class="ti ti-arrow-left"></i> 学び</button>
      <header class="top"><div><h2>美容・アンチエイジング</h2><div class="muted sm">若さは習慣8割</div></div></header>
      <p class="cond-ov">${esc(g.intro)}</p>
      ${g.sections.map(s => `
        <div class="careblk">
          <div class="careblk-h"><i class="ti ${s.icon}"></i> ${esc(s.title)}</div>
          <ul>${s.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
        </div>`).join("")}

      <h3 class="sec">サプリ・スキンケア（一次情報つき）</h3>
      <div class="supp-note"><i class="ti ti-flask"></i> 最優先は“日焼け止め・睡眠・食事・運動”。下記は一次情報(RCT/メタ解析)で確認。刺激や持病がある人は皮膚科/主治医に相談を。</div>
      <div class="cards">
        ${g.supplements.map(s => `
          <article class="card">
            <div class="card-head"><span class="chip"><i class="ti ti-sparkles"></i>${esc(s.name)}</span><span class="ev">${stars(s.evidence)}</span></div>
            <p class="supp-dose"><i class="ti ti-prescription"></i> ${esc(s.dose)}</p>
            <p>${esc(s.effect)}</p>
            <p class="supp-caution"><i class="ti ti-alert-triangle"></i> ${esc(s.caution)}</p>
            <div class="src">出典: ${esc(s.source)}</div>
          </article>`).join("")}
      </div>
      <p class="muted sm note">※ 化粧品・サプリは個人差があります。刺激・持病・服薬・妊娠中は専門家に相談を。</p>
    `;
    el("back").onclick = () => handlers.nav("learn");
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

  // ---- 疾患ケア 一覧 ----
  function care(handlers) {
    const conds = window.YOBOU_CONDITIONS;
    const selected = window.Store.getConditions();
    el("app").innerHTML = `
      <header class="top"><div><h2>疾患ケア</h2><div class="muted sm">ガイドライン準拠の週間ケア</div></div></header>
      <div class="disc"><i class="ti ti-alert-triangle"></i> 一般的な生活習慣の情報で、医療アドバイス・診断ではありません。服薬・食事制限の指示がある人はそれを優先し、必ず主治医に相談してください。</div>
      <h3 class="sec">対象の疾患を選ぶ</h3>
      <div class="cond-chips">
        ${Object.keys(conds).map(id => `<button class="cond-chip ${selected.includes(id) ? "on" : ""}" data-cond="${id}"><i class="ti ${conds[id].icon}"></i>${conds[id].name}</button>`).join("")}
      </div>
      ${selected.length ? `<h3 class="sec">あなたのケア</h3>
        <div class="cards">${selected.map(id => {
          const fb = window.conditionFeedback(id);
          return `<button class="cond-card" data-open="${id}">
            <div class="cond-card-h"><i class="ti ${conds[id].icon}"></i><span>${conds[id].name}</span><i class="ti ti-chevron-right"></i></div>
            <div class="cond-card-sub">${conds[id].guideline} · 今週の実践 ${fb.rate}%</div>
          </button>`; }).join("")}</div>`
        : `<p class="empty">上から疾患を選ぶと、週間のケアプランが表示されます。</p>`}
    `;
    el("app").querySelectorAll("[data-cond]").forEach(b => b.onclick = () => handlers.toggleCondition(b.dataset.cond));
    el("app").querySelectorAll("[data-open]").forEach(b => b.onclick = () => handlers.openCondition(b.dataset.open));
  }

  // ---- 疾患ケア 詳細 ----
  function conditionDetail(condId, handlers) {
    const c = window.YOBOU_CONDITIONS[condId];
    const dates = window.weekDates();
    const careData = window.Store.getCare(condId);
    const today = window.YDate.today();
    const wd = ["月", "火", "水", "木", "金", "土", "日"];
    const fb = window.conditionFeedback(condId);
    const grid = c.habits.map(h => `
      <div class="chk-row">
        <div class="chk-label">${esc(h.label)}</div>
        <div class="chk-cells">
          ${dates.map((dt, i) => {
            const on = (careData[dt] || []).includes(h.id);
            const isToday = dt === today;
            return `<button class="chk ${on ? "on" : ""} ${isToday ? "today" : ""}" data-h="${h.id}" data-dt="${dt}" aria-label="${wd[i]}">${on ? '<i class="ti ti-check"></i>' : wd[i]}</button>`;
          }).join("")}
        </div>
      </div>`).join("");
    el("app").innerHTML = `
      <button class="back" id="back"><i class="ti ti-arrow-left"></i> 疾患ケア</button>
      <header class="top"><div><h2>${esc(c.name)}</h2><div class="muted sm">${esc(c.guideline)}</div></div></header>
      <p class="cond-ov">${esc(c.overview)}</p>
      <div class="redflag"><div class="redflag-h"><i class="ti ti-alert-triangle"></i> 受診の目安・注意</div>
        <ul>${c.redFlags.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>

      <h3 class="sec">今週のセルフチェック</h3>
      <div class="chk-grid">${grid}</div>
      <div class="fb"><div class="fb-h"><i class="ti ti-bulb"></i> 今週のフィードバック</div>
        <p class="fb-head">${esc(fb.head)}</p>
        <ul>${fb.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>

      <h3 class="sec">1週間のケア</h3>
      ${careBlock("ti-salad", "食事", c.weekly.diet)}
      ${careBlock("ti-run", "運動", c.weekly.exercise)}
      ${careBlock("ti-sun", "生活習慣", c.weekly.lifestyle)}

      ${c.supplements && c.supplements.length ? `
      <h3 class="sec">サプリ・ハーブ（任意・主治医と）</h3>
      <div class="supp-note"><i class="ti ti-flask"></i> Podcast等で話題のものを一次情報(RCT/メタ解析)で確認したもの。処方薬の代わりにせず、薬を飲んでいる人は必ず主治医に相談してください。</div>
      <div class="cards">
        ${c.supplements.map(sid => { const s = window.YOBOU_SUPPLEMENTS[sid]; return s ? `
          <article class="card">
            <div class="card-head"><span class="chip"><i class="ti ti-flask"></i>${esc(s.name)}</span><span class="ev">${stars(s.evidence)}</span></div>
            <p class="supp-dose"><i class="ti ti-prescription"></i> ${esc(s.dose)}</p>
            <p>${esc(s.effect)}</p>
            <p class="supp-caution"><i class="ti ti-alert-triangle"></i> ${esc(s.caution)}</p>
            <div class="src">一次情報: ${esc(s.source)}</div>
          </article>` : ""; }).join("")}
      </div>` : ""}

      <h3 class="sec">食材の目安</h3>
      <div class="foods">
        <div class="foods-col good"><div class="foods-h"><i class="ti ti-circle-check"></i> 増やす</div>${c.foods.good.map(f => `<span>${esc(f)}</span>`).join("")}</div>
        <div class="foods-col avoid"><div class="foods-h"><i class="ti ti-circle-minus"></i> 控える</div>${c.foods.avoid.map(f => `<span>${esc(f)}</span>`).join("")}</div>
      </div>
      <p class="muted sm note">※ カリウム・タンパク質・塩分・水分などに医師の制限がある場合は、その指示が最優先です。</p>
    `;
    el("back").onclick = () => handlers.nav("care");
    el("app").querySelectorAll(".chk").forEach(b => b.onclick = () => handlers.toggleCare(condId, b.dataset.dt, b.dataset.h));
  }
  function careBlock(icon, label, items) {
    return `<div class="careblk"><div class="careblk-h"><i class="ti ${icon}"></i> ${label}</div>
      <ul>${items.map(i => `<li>${i.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</li>`).join("")}</ul></div>`;
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
    const items = [["home", "ホーム", "ti-home"], ["plan", "プラン", "ti-calendar"], ["meals", "献立", "ti-salad"], ["learn", "学び", "ti-bulb"], ["care", "ケア", "ti-stethoscope"], ["log", "記録", "ti-pencil"]];
    if (["history", "settings"].includes(active)) active = active === "history" ? "log" : "home";
    if (active === "condition") active = "care";
    if (active === "gut") active = "learn";
    el("nav").innerHTML = items.map(([k, t, ic]) =>
      `<button class="${active === k ? "on" : ""}" data-nav="${k}"><i class="ti ${ic}"></i><span>${t}</span></button>`).join("");
    el("nav").querySelectorAll("[data-nav]").forEach(b => b.onclick = () => handlers.nav(b.dataset.nav));
    el("nav").style.display = "flex";
  }
  function hideNav() { el("nav").style.display = "none"; }

  return { onboarding, home, plan, meals, learn, gutGuide, beautyGuide, articleDetail, care, conditionDetail, logForm, history, settings, nav, hideNav };
})();
