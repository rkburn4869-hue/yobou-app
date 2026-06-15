// 疾患ケア・モジュール（医学ガイドライン土台: DASH / ADA 等）
// ⚠️ 一般的な生活習慣の情報であり、医療アドバイス・診断ではない。
// 服薬・食事制限の指示がある人はそれを優先し、必ず主治医に相談すること。
window.YOBOU_CONDITIONS = {
  hypertension: {
    name: "高血圧", icon: "ti-heartbeat", guideline: "DASH食・減塩",
    overview: "減塩とDASH食（野菜・果物・豆・全粒穀物・低脂肪乳）、有酸素運動、節酒、適正体重で血圧は下げられます。",
    redFlags: [
      "上が180/下が110以上、または強い頭痛・胸痛・息切れ・手足のしびれ・ろれつが回らない → すぐ受診/救急",
      "降圧薬を飲んでいる人は自己判断で中断しない（減塩で効きすぎることもあるため主治医に相談）"
    ],
    weekly: {
      diet: [
        "塩分は1日6g未満を目安（麺の汁を残す・汁物は具沢山で汁少なめ・漬物/練り物/加工食品を減らす）",
        "カリウムの多い野菜・果物・豆・いもを増やす ※腎臓病や薬がある人は主治医に確認",
        "低脂肪の乳製品・全粒穀物・青魚を取り入れる",
        "減塩でも出汁・酢・レモン・香辛料で満足感を出す"
      ],
      exercise: [
        "中強度の有酸素30分×週5（計150分）。速歩・自転車など",
        "アイソメトリック運動（ハンドグリップ握り or 壁ぎわスクワットを2分×4回）は降圧に有効",
        "続けられる強度で。高血圧が未治療で高い人は強い運動前に受診"
      ],
      lifestyle: ["節酒（飲むなら少量）", "禁煙", "睡眠を整える", "ストレス管理（5分の呼吸法）", "適正体重を目指す"]
    },
    foods: {
      good: ["野菜全般", "果物", "豆・大豆製品", "いも", "無塩ナッツ", "青魚", "低脂肪ヨーグルト", "全粒穀物", "酢・レモン・香辛料"],
      avoid: ["漬物・梅干し", "ハム・ベーコン・練り物", "カップ麺・インスタント", "スナック菓子", "汁物の飲み干し", "しょうゆ・ソースのかけすぎ"]
    },
    habits: [
      { id: "salt", label: "減塩を意識できた" },
      { id: "veg", label: "野菜・果物を食べた" },
      { id: "move", label: "30分以上動いた" },
      { id: "alcohol", label: "お酒を控えた" }
    ]
  },

  diabetes: {
    name: "糖尿病・血糖", icon: "ti-droplet", guideline: "ADA・低GI・食物繊維",
    overview: "食物繊維をしっかり、低GI中心、食後に動く、適正体重（5〜10%減でA1c改善）で血糖は安定します。",
    redFlags: [
      "強い口渇・多尿・急な体重減少・意識がもうろう → すぐ受診",
      "薬やインスリンを使う人は低血糖に注意（冷や汗・動悸・手の震え時はブドウ糖を）。食事/運動を変える前に主治医に相談"
    ],
    weekly: {
      diet: [
        "食物繊維を1日30〜50g（うち水溶性10〜20g：海藻・オーツ・豆・きのこ）",
        "白い炭水化物より茶色い炭水化物（玄米・全粒粉・そば）。食べる順は野菜→タンパク質→主食",
        "甘い飲料・菓子・精製穀物・加工肉を減らす",
        "毎食タンパク質。豆・魚・卵・鶏を中心に"
      ],
      exercise: [
        "中強度の運動 計150分/週（速歩でOK）",
        "食後20〜30分以内の軽い散歩10分で食後血糖が下がりやすい",
        "週2回の自重筋トレで筋肉(糖の受け皿)を維持"
      ],
      lifestyle: ["体重を5〜10%減らす（該当者）", "規則的な食事時間", "睡眠不足を避ける", "禁煙・節酒"]
    },
    foods: {
      good: ["葉物・野菜", "海藻・きのこ", "豆・大豆製品", "オーツ・全粒穀物", "青魚", "卵", "ナッツ", "酢"],
      avoid: ["砂糖入り飲料・ジュース", "菓子パン・白い主食の大盛り", "お菓子", "加工肉", "揚げ物の食べすぎ"]
    },
    habits: [
      { id: "fiber", label: "食物繊維を先に食べた" },
      { id: "walk", label: "食後に歩いた" },
      { id: "sugar", label: "甘い飲料を避けた" },
      { id: "move", label: "運動した" }
    ]
  },

  cholesterol: {
    name: "高コレステロール", icon: "ti-heart", guideline: "飽和脂肪↓・食物繊維↑",
    overview: "飽和脂肪を減らし、水溶性食物繊維・植物ステロール・オメガ3・運動でLDLコレステロールを下げます。",
    redFlags: [
      "胸の痛み・圧迫感・締め付け、息切れ、左腕や顎への放散痛 → すぐ受診/救急",
      "脂質の薬（スタチン等）を飲んでいる人は自己中断しない。家族性高コレステロール血症が疑われる場合は専門医へ"
    ],
    weekly: {
      diet: [
        "飽和脂肪を減らす（脂身・バター・生クリーム・揚げ物・加工肉を控える）",
        "水溶性食物繊維を1日10〜20g（オーツ・大麦・豆・りんご・海藻）",
        "良い油へ置き換え（オリーブオイル・青魚のオメガ3・くるみ・アボカド）",
        "植物ステロール（野菜・豆・全粒穀物）を増やす"
      ],
      exercise: [
        "中強度の有酸素 計150分/週（速歩・ジョグ・自転車）→ HDL↑・中性脂肪↓",
        "週2回の自重筋トレ",
        "座りすぎを避け、こまめに動く"
      ],
      lifestyle: ["適正体重", "禁煙", "節酒", "睡眠とストレス管理"]
    },
    foods: {
      good: ["オーツ・大麦", "豆・大豆製品", "青魚", "オリーブオイル", "くるみ・アーモンド", "アボカド", "野菜・果物", "海藻・きのこ"],
      avoid: ["脂身の多い肉・加工肉", "バター・生クリーム・洋菓子", "揚げ物・スナック", "トランス脂肪（マーガリン等）"]
    },
    habits: [
      { id: "satfat", label: "飽和脂肪・揚げ物を控えた" },
      { id: "fiber", label: "水溶性食物繊維を摂った" },
      { id: "goodfat", label: "良い油（青魚/オリーブ/ナッツ）" },
      { id: "move", label: "運動した" }
    ]
  }
};

// 1週間（月〜日）の日付ISOを返す
window.weekDates = function (baseIso) {
  const d = new Date((baseIso || window.YDate.today()) + "T00:00:00");
  const dow = (d.getDay() + 6) % 7; // 月=0
  const mon = new Date(d); mon.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon); x.setDate(mon.getDate() + i); return window.YDate.iso(x);
  });
};

// 週のセルフチェックからフィードバック文を生成
window.conditionFeedback = function (condId) {
  const cond = window.YOBOU_CONDITIONS[condId];
  const dates = window.weekDates();
  const care = window.Store.getCare(condId);
  const lines = [];
  let totalDone = 0, totalSlots = 0;
  cond.habits.forEach(h => {
    const n = dates.filter(dt => (care[dt] || []).includes(h.id)).length;
    totalDone += n; totalSlots += 7;
    let msg;
    if (n >= 6) msg = `◎ ${h.label}: ${n}/7 すばらしい習慣化です`;
    else if (n >= 3) msg = `○ ${h.label}: ${n}/7 いい調子。あと数日増やすと効果が出やすい`;
    else msg = `△ ${h.label}: ${n}/7 まずは週3日を目標に`;
    lines.push(msg);
  });
  const rate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
  let head;
  if (rate >= 80) head = `今週の実践率 ${rate}%。この調子で続けましょう。`;
  else if (rate >= 40) head = `今週の実践率 ${rate}%。できている所を伸ばしていきましょう。`;
  else head = `今週の実践率 ${rate}%。1つだけ選んで毎日やるのがおすすめです。`;
  return { head, lines, rate };
};
