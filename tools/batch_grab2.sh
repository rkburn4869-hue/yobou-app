#!/bin/bash
# 残りのPodcast回を短い順に文字起こし（再開用）
cd "/Users/rkburn/Desktop/予防アプリ" || exit 1
LOG=data/podcasts/_batch2.log
echo "START $(date)" > "$LOG"
run () {
  echo ">>> $1 #$2 $(date +%H:%M:%S)" >> "$LOG"
  python3 tools/fetch_podcast.py grab "$1" "$2" --model base.en >> "$LOG" 2>&1
}
run HumanUpgrade 12    # 9分
run HumanUpgrade 657   # 29分
run Huberman 60        # 50分
run HumanUpgrade 578   # 59分
echo "DONE $(date)" >> "$LOG"
