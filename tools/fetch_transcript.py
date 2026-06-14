#!/usr/bin/env python3
"""
YouTube字幕取得スクリプト（予防アプリ 知識ベース用）

使い方:
  python3 fetch_transcript.py <YouTube URL or 動画ID> [<URL2> ...]
  python3 fetch_transcript.py --file urls.txt   # 1行1URLのファイルから一括取得

取得した字幕は data/transcripts/ に Markdown で保存される。
日本語(ja) → 英語(en) の優先順で、手動字幕が無ければ自動生成字幕にフォールバック。
要約・分類は Claude（このセッション）が保存済みファイルを読んで行う。
"""
import sys
import re
import json
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = BASE_DIR / "data" / "transcripts"
SUB_LANGS = ["ja", "en"]  # 優先順


def vtt_to_text(vtt: str) -> str:
    """WebVTT字幕から純粋なテキストだけを抽出（タイムスタンプ・タグ・重複を除去）"""
    lines = []
    seen_last = None
    for raw in vtt.splitlines():
        line = raw.strip()
        if not line or line == "WEBVTT":
            continue
        if "-->" in line:  # タイムスタンプ行
            continue
        if line.isdigit():  # キュー番号
            continue
        if line.startswith(("Kind:", "Language:", "NOTE")):
            continue
        # インラインタグ <00:00:00.000><c> 等を除去
        line = re.sub(r"<[^>]+>", "", line).strip()
        if not line:
            continue
        # 自動字幕にありがちな直前行との重複を除去
        if line == seen_last:
            continue
        seen_last = line
        lines.append(line)
    return "\n".join(lines)


def fetch_one(url: str) -> Path | None:
    print(f"\n▶ 取得中: {url}")
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        cmd = [
            sys.executable, "-m", "yt_dlp",
            "--skip-download",
            "--write-subs", "--write-auto-subs",
            "--sub-langs", ",".join(SUB_LANGS),
            "--sub-format", "vtt",
            "--convert-subs", "vtt",
            "--print-json",
            "-o", str(tmp / "%(id)s.%(ext)s"),
            url,
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        except subprocess.TimeoutExpired:
            print("  ✗ タイムアウト")
            return None

        meta = {}
        for jline in result.stdout.splitlines():
            try:
                meta = json.loads(jline)
                break
            except json.JSONDecodeError:
                continue
        if not meta:
            print(f"  ✗ メタデータ取得失敗\n{result.stderr[-400:]}")
            return None

        vtts = sorted(tmp.glob("*.vtt"))
        if not vtts:
            print("  ✗ 字幕が見つかりませんでした（字幕無し動画の可能性）")
            return None

        # 優先言語順に1つ選ぶ
        chosen = None
        for lang in SUB_LANGS:
            for v in vtts:
                if f".{lang}." in v.name:
                    chosen = v
                    break
            if chosen:
                break
        chosen = chosen or vtts[0]

        text = vtt_to_text(chosen.read_text(encoding="utf-8", errors="ignore"))

        OUT_DIR.mkdir(parents=True, exist_ok=True)
        vid = meta.get("id", "unknown")
        safe_title = re.sub(r"[^\w\- ]", "_", meta.get("title", vid))[:60].strip()
        out_path = OUT_DIR / f"{vid}_{safe_title}.md"

        header = (
            f"# {meta.get('title', '')}\n\n"
            f"- URL: https://www.youtube.com/watch?v={vid}\n"
            f"- チャンネル: {meta.get('uploader', '')}\n"
            f"- 長さ: {meta.get('duration', '')}秒\n"
            f"- 字幕言語: {chosen.name}\n"
            f"- 取得日: {datetime.now():%Y-%m-%d}\n\n"
            f"---\n\n## 文字起こし\n\n"
        )
        out_path.write_text(header + text + "\n", encoding="utf-8")
        print(f"  ✓ 保存: {out_path.relative_to(BASE_DIR)}  ({len(text)}文字)")
        return out_path


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    urls = []
    if argv[0] == "--file":
        urls = [l.strip() for l in Path(argv[1]).read_text().splitlines() if l.strip()]
    else:
        urls = argv
    ok = 0
    for u in urls:
        if fetch_one(u):
            ok += 1
    print(f"\n完了: {ok}/{len(urls)} 本を取得")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
