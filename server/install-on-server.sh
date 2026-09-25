#!/usr/bin/env bash
# 망남 운영 백엔드 모듈을 사교원 자체 서버(가비아)에 붙이는 스크립트 (root 로 실행)
#
#   curl -fsSL https://raw.githubusercontent.com/deka2026/mangnam-coop/main/server/install-on-server.sh | sudo bash
#
# 하는 일
#   1) mangnam_api.py 를 /opt/sakyowon/server/ 에 내려받는다 (재실행하면 최신으로 갱신)
#   2) app.py 끝에 include 블록이 없으면 넣는다 (있으면 건너뜀)
#   3) sakyowon-api 서비스를 재시작하고 /api/mangnam/health 로 확인한다
set -euo pipefail

SRV=/opt/sakyowon/server
RAW=https://raw.githubusercontent.com/deka2026/mangnam-coop/main/server/mangnam_api.py
MARK="# --- mangnam-coop 운영 모듈 (install-on-server.sh) ---"

[ -f "$SRV/app.py" ] || { echo "!! $SRV/app.py 가 없습니다. 사교원 자체 서버가 설치된 서버에서 실행하세요."; exit 1; }

echo "[1/3] mangnam_api.py 내려받기"
curl -fsSL "$RAW" -o "$SRV/mangnam_api.py.new"
python3 -m py_compile "$SRV/mangnam_api.py.new"
mv "$SRV/mangnam_api.py.new" "$SRV/mangnam_api.py"
chown sakyowon:sakyowon "$SRV/mangnam_api.py"

echo "[2/3] app.py 에 include 블록 확인"
if grep -qF "$MARK" "$SRV/app.py"; then
  echo "    -> 이미 붙어 있음 (건너뜀)"
else
  cp "$SRV/app.py" "$SRV/app.py.bak-$(date +%Y%m%d-%H%M%S)"
  cat >>"$SRV/app.py" <<'PY'


# --- mangnam-coop 운영 모듈 (install-on-server.sh) ---
# 망남마을협동조합 월별 회계·회의록·문서 보관·경영공시/실적 게시 (/api/mangnam/*).
# 코드: https://github.com/deka2026/mangnam-coop/blob/main/server/mangnam_api.py
try:
    from mangnam_api import install as _install_mangnam
    _install_mangnam(app, db=db, admin_ok=admin_ok, current_user=current_user,
                     now_iso=now_iso, new_id=new_id, s=s, db_path=DB_PATH)
except ImportError as _e:  # 모듈 파일이 없으면 기존 기능만 그대로 돈다
    print("mangnam_api 미탑재:", _e)
PY
  echo "    -> 추가함 (백업: app.py.bak-*)"
fi
python3 -m py_compile "$SRV/app.py"

echo "[3/3] 서비스 재시작"
systemctl restart sakyowon-api
sleep 2
if curl -fs http://127.0.0.1:8787/api/mangnam/health; then
  echo
  echo "===== 설치 완료: https://sakyowon.co.kr/api/mangnam/health ====="
else
  echo
  echo "!! /api/mangnam/health 응답 없음. 로그: journalctl -u sakyowon-api -n 30 --no-pager"
  exit 1
fi
