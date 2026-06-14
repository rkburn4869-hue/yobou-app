#!/bin/bash
cd "/Users/rkburn/Desktop/予防アプリ" || exit 1
LOG=data/podcasts/_batch3.log
echo "START $(date)" > "$LOG"
run () { echo ">>> $1 #$2 $(date +%H:%M:%S)" >> "$LOG"; python3 tools/fetch_podcast.py grab "$1" "$2" --model base.en >> "$LOG" 2>&1; }
run Huberman 60       # 呼吸 50分
run HumanUpgrade 578  # 食をシンプルに 59分
echo "DONE $(date)" >> "$LOG"
