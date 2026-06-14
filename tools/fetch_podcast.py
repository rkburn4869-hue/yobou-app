#!/usr/bin/env python3
"""
ポッドキャスト取り込みスクリプト（予防アプリ 知識ベース用）

ポッドキャストは字幕が無いことが多いため、音声をDLしてWhisperで文字起こしする。
APIキー不要（ローカル faster-whisper）。

使い方:
  # 1) Apple PodcastのIDからRSSを保存（初回）
  python3 fetch_podcast.py rss <appleID> [保存名]

  # 2) タイトルでエピソードを検索
  python3 fetch_podcast.py search <保存名> <キーワード>

  # 3) 検索で出た番号を指定して文字起こし
  python3 fetch_podcast.py grab <保存名> <番号> [--minutes N] [--model base.en]

出力は data/podcasts/ に Markdown 保存。要約・分類は Claude が担当。
"""
import sys, re, json, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).resolve().parent.parent
RSS_DIR = BASE / "data" / "rss"
OUT_DIR = BASE / "data" / "podcasts"
NS = {"it": "http://www.itunes.com/dtds/podcast-1.0.dtd"}


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=120).read()


def cmd_rss(apple_id, name=None):
    meta = json.loads(_get(f"https://itunes.apple.com/lookup?id={apple_id}"))["results"][0]
    feed = meta["feedUrl"]
    name = name or re.sub(r"[^\w]", "_", meta["collectionName"])[:40]
    RSS_DIR.mkdir(parents=True, exist_ok=True)
    path = RSS_DIR / f"{name}.rss"
    path.write_bytes(_get(feed))
    print(f"✓ {meta['collectionName']} ({meta.get('trackCount')}話) -> {path.relative_to(BASE)}")
    print(f"  検索: python3 tools/fetch_podcast.py search {name} <キーワード>")


def _items(name):
    return ET.parse(RSS_DIR / f"{name}.rss").getroot().findall(".//item")


def _dur(it):
    d = it.findtext("it:duration", namespaces=NS) or "0"
    try:
        return int(d)
    except ValueError:
        parts = [int(x) for x in d.split(":")]
        return sum(p * 60 ** i for i, p in enumerate(reversed(parts)))


def cmd_search(name, keyword):
    items = _items(name)
    hits = [(i, it) for i, it in enumerate(items)
            if keyword.lower() in (it.findtext("title") or "").lower()]
    print(f"'{keyword}' : {len(hits)}件\n")
    for i, it in hits[:40]:
        m = _dur(it) // 60
        print(f"  #{i:<5} [{m}分] {(it.findtext('title') or '')[:75]}")
    if len(hits) > 40:
        print(f"  ... 他{len(hits)-40}件")


def cmd_grab(name, idx, minutes=None, model="base.en"):
    from faster_whisper import WhisperModel
    it = _items(name)[int(idx)]
    title = it.findtext("title") or "untitled"
    url = it.find("enclosure").get("url")
    print(f"▶ {title}\n  音声DL中...")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mp3 = OUT_DIR / f"_tmp_{idx}.mp3"
    mp3.write_bytes(_get(url))
    print(f"  DL完了 ({mp3.stat().st_size//1024//1024}MB)。文字起こし中 (model={model})...")

    m = WhisperModel(model, device="cpu", compute_type="int8")
    clip = f"0,{int(minutes)*60}" if minutes else None
    segments, info = m.transcribe(str(mp3), clip_timestamps=clip) if clip else m.transcribe(str(mp3))

    lines = []
    for seg in segments:
        ts = f"[{int(seg.start)//60:02d}:{int(seg.start)%60:02d}]"
        lines.append(f"{ts} {seg.text.strip()}")
    text = "\n".join(lines)

    safe = re.sub(r"[^\w\- ]", "_", title)[:55].strip()
    out = OUT_DIR / f"{idx}_{safe}.md"
    header = (
        f"# {title}\n\n- 番組: {name}\n- 長さ: {_dur(it)}秒"
        f"{'（先頭'+str(minutes)+'分のみ）' if minutes else ''}\n"
        f"- 音声: {url}\n- 文字起こし: faster-whisper {model}\n"
        f"- 取得日: {datetime.now():%Y-%m-%d}\n\n---\n\n## 文字起こし\n\n"
    )
    out.write_text(header + text + "\n", encoding="utf-8")
    mp3.unlink(missing_ok=True)
    print(f"  ✓ 保存: {out.relative_to(BASE)} ({len(text)}文字)")


def main(a):
    if not a:
        print(__doc__); return 1
    c = a[0]
    if c == "rss":
        cmd_rss(*a[1:])
    elif c == "search":
        cmd_search(a[1], " ".join(a[2:]))
    elif c == "grab":
        kw = {}
        rest = a[3:]
        if "--minutes" in rest:
            kw["minutes"] = rest[rest.index("--minutes") + 1]
        if "--model" in rest:
            kw["model"] = rest[rest.index("--model") + 1]
        cmd_grab(a[1], a[2], **kw)
    else:
        print(__doc__); return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
