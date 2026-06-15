#!/usr/bin/env python3
"""
新着チェック: sources.json の各ソースから、processed.json に無い新着を一覧表示する。
テーマ判定はしない（タイトルを見て採否はエージェントが判断する）。

使い方: python3 tools/check_new.py
出力: 新着候補を JSON で標準出力（youtube=字幕で学習可 / podcast=要文字起こし）。
"""
import json, sys, re, urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SRC = json.loads((BASE / "tools/sources.json").read_text())
PROC = set(json.loads((BASE / "tools/processed.json").read_text())["keys"])


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=60).read()


def yt_new(ch):
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={ch['channelId']}"
    root = ET.fromstring(get(url))
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
    out = []
    for e in root.findall("a:entry", ns):
        vid = e.findtext("yt:videoId", namespaces=ns)
        title = e.findtext("a:title", namespaces=ns)
        if vid in PROC or (title and title in PROC):
            continue
        out.append({"source": ch["name"], "kind": "youtube", "id": vid,
                    "title": title, "url": f"https://youtu.be/{vid}",
                    "published": e.findtext("a:published", namespaces=ns)})
    return out


def pod_new(pc, lookback):
    meta = json.loads(get(f"https://itunes.apple.com/lookup?id={pc['appleId']}"))
    feed = meta["results"][0]["feedUrl"]
    root = ET.fromstring(get(feed))
    out = []
    for it in root.findall(".//item")[:lookback]:
        title = it.findtext("title")
        guid = it.findtext("guid")
        key = guid or title
        if (key and key in PROC) or (title and title in PROC):
            continue
        enc = it.find("enclosure")
        out.append({"source": pc["name"], "kind": "podcast", "id": key, "title": title,
                    "audio": enc.get("url") if enc is not None else None,
                    "published": it.findtext("pubDate")})
    return out


def main():
    cands = []
    for ch in SRC.get("youtube", []):
        try:
            cands += yt_new(ch)
        except Exception as e:
            print(f"# youtube {ch['name']} 取得失敗: {e}", file=sys.stderr)
    for pc in SRC.get("podcasts", []):
        try:
            cands += pod_new(pc, SRC.get("podcastLookback", 20))
        except Exception as e:
            print(f"# podcast {pc['name']} 取得失敗: {e}", file=sys.stderr)
    print(json.dumps({"count": len(cands), "candidates": cands}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
