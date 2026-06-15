// localStorage ラッパー（プロフィール・記録・プラン）
window.Store = (function () {
  const K = { profile: "yobou.profile", logs: "yobou.logs", plan: "yobou.plan", read: "yobou.read", conditions: "yobou.conditions", care: "yobou.care" };

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  return {
    getProfile() { return read(K.profile, null); },
    setProfile(p) { write(K.profile, p); },

    getPlan() { return read(K.plan, null); },
    setPlan(p) { write(K.plan, p); },

    getLogs() { return read(K.logs, []); },
    getLog(date) { return this.getLogs().find(l => l.date === date) || null; },
    upsertLog(log) {
      const logs = this.getLogs();
      const i = logs.findIndex(l => l.date === log.date);
      if (i >= 0) logs[i] = log; else logs.push(log);
      logs.sort((a, b) => a.date.localeCompare(b.date));
      write(K.logs, logs);
    },

    getRead() { return read(K.read, []); },
    isRead(id) { return this.getRead().includes(id); },
    markRead(id) { const r = this.getRead(); if (!r.includes(id)) { r.push(id); write(K.read, r); } },

    getConditions() { return read(K.conditions, []); },
    toggleCondition(id) {
      const c = this.getConditions(); const i = c.indexOf(id);
      if (i >= 0) c.splice(i, 1); else c.push(id);
      write(K.conditions, c); return c;
    },
    // care: { [condId]: { [dateISO]: [habitId,...] } }
    getCare(condId) { return read(K.care, {})[condId] || {}; },
    toggleCareHabit(condId, date, habitId) {
      const all = read(K.care, {});
      const c = all[condId] || (all[condId] = {});
      const day = c[date] || (c[date] = []);
      const i = day.indexOf(habitId);
      if (i >= 0) day.splice(i, 1); else day.push(habitId);
      write(K.care, all);
    },

    exportAll() {
      return JSON.stringify({ profile: this.getProfile(), plan: this.getPlan(), logs: this.getLogs(),
        read: this.getRead(), conditions: this.getConditions(), care: read(K.care, {}) }, null, 2);
    },
    reset() { Object.values(K).forEach(k => localStorage.removeItem(k)); }
  };
})();

// 日付ユーティリティ
window.YDate = {
  today() { const d = new Date(); return this.iso(d); },
  iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); },
  label(iso) {
    const d = new Date(iso + "T00:00:00");
    const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
    return (d.getMonth() + 1) + "月" + d.getDate() + "日 " + w;
  },
  weekdayIndex(iso) { return new Date(iso + "T00:00:00").getDay(); } // 0=日
};

// 年齢→年代
window.ageToBand = function (age) {
  if (age < 30) return "20s";
  if (age < 40) return "30s";
  if (age < 50) return "40s";
  if (age < 60) return "50s";
  return "60s";
};
