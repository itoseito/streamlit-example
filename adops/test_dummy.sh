#!/bin/bash
# ダミー1件で 登録→重複拒否→下書き→承認→生成記録→品質確認→送信準備→送信→返信→受注→納品物→入金→集計 を通す
set -u
export ADOPS_DATA="$(mktemp -d)"
A="python3 $(dirname "$0")/adops.py"
step(){ echo; echo "## $*"; }
step 登録; $A add --name "ダミー珈琲店" --ig "https://www.instagram.com/Dummy_Coffee/" --category 飲食 --area "テスト市" --source-url "https://example.com/dummy" --reason "投稿の写真が暗く、看板メニューが伝わりにくいと感じました。"
step "重複登録（拒否されるのが正）"; $A add --name "ダミー珈琲" --ig "@dummy_coffee" --source-url "https://example.com/x" --reason "x"
step 下書き; $A draft S001
step "未承認での生成（拒否が正）"; $A gen S001 --count 2
step 承認と生成記録; $A approve S001 --count 2 --note "写真なし・一般イメージのみ"; $A gen S001 --count 2
step "承認枚数超え（拒否が正）"; $A gen S001 --count 1
D=$(ls -d "$ADOPS_DATA"/shops/S001_*); printf x > "$D/outputs/a.png"; printf y > "$D/outputs/b.png"
step "品質確認前の送信準備（拒否が正）"; $A ready S001
step 品質確認; $A qc S001 --file a.png --artifact ok --text ok --match ok; $A qc S001 --file b.png --artifact ok --text ok --match ok
step 送信準備と一覧; $A ready S001; $A queue
step 送信記録; $A sent S001
step "二重送信・再提案（拒否が正）"; $A sent S001; $A draft S001
step 返信; $A reply S001 --text "素敵ですね。料金はいくらですか？"
step 受注から入金; $A order S001 --amount 5000; $A deliver S001; $A delivered S001; $A paid S001 --amount 5000
$A time S001 --min 40 --kind 営業; $A time S001 --min 20 --kind 制作
step 集計; $A report
step ファイル; (cd "$ADOPS_DATA" && find . -type f | sort)
