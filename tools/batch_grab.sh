#!/bin/bash
# 選定したPodcast回を順番に文字起こしする（バックグラウンド実行用）
cd "/Users/rkburn/Desktop/予防アプリ" || exit 1
LOG=data/podcasts/_batch.log
echo "START $(date)" > "$LOG"

run () { # feed idx
  echo ">>> $1 #$2 $(date +%H:%M:%S)" >> "$LOG"
  python3 tools/fetch_podcast.py grab "$1" "$2" --model base.en >> "$LOG" 2>&1
}

run Huberman 136
run Huberman 77
run Huberman 60
run HumanUpgrade 578
run HumanUpgrade 657
run HumanUpgrade 12

echo "DONE $(date)" >> "$LOG"
