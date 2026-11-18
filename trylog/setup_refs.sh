#!/bin/bash
# 参考リポジトリを /home/user/refs に浅く複製する（読むだけ。中のスクリプトは実行しない）
set -e; mkdir -p /home/user/refs; cd /home/user/refs
for r in Vincentwei1021/mg-styles-15 JohnHeibel/ClaudeAnimationBase JohnHeibel/PDoomVideo yihui-dev/awesome-opus5-5-videos athemeroy/awesome-claude-5-5-videos; do
  [ -d "${r#*/}" ] || git clone -q --depth 1 "https://github.com/$r.git"; done
ls
