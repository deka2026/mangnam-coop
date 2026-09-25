# 망남마을협동조합 운영 백엔드 (`/api/mangnam`)

월별 회계 · 회의록 · 문서 보관 · 경영공시/실적 게시를 처리하는 서버 모듈입니다.
사교원 자체 서버(가비아, FastAPI + SQLite — `deka2026/sakyowon-server` 의 `app.py`)에 **확장 모듈로 붙여** 씁니다.
DB(`/opt/sakyowon/data/sakyowon.db`)와 관리자 인증(관리자 키 `SAKYOWON_ADMIN_KEY` 또는 사교원 통합 계정 admin·staff 세션)은 app.py 것을 그대로 빌려 쓰므로 **새 서비스·새 DB·새 비밀번호가 생기지 않습니다.**

```
브라우저 ─ sakyowon.co.kr/mangnam-coop/admin/…  (Next 정적, 이 레포 app/admin)
              │  fetch /api/mangnam/…  (같은 출처, CORS 없음)
              ▼
   Caddy ─ /api/* ─▶ FastAPI app.py ─▶ mangnam_api.install(app, …) ─▶ SQLite mn_* 테이블
                                                               └─▶ 첨부: /opt/sakyowon/data/files/mangnam/
```

## 서버에 붙이기 (이사장님 SSH, 한 줄)

```bash
curl -fsSL https://raw.githubusercontent.com/deka2026/mangnam-coop/main/server/install-on-server.sh | sudo bash
```

스크립트가 하는 일: `mangnam_api.py` 를 `/opt/sakyowon/server/` 에 내려받고 → `app.py` 끝에 include 블록을 (없을 때만) 붙이고 → `sakyowon-api` 재시작 → `/api/mangnam/health` 확인. **모듈을 고친 뒤 다시 실행하면 최신으로 갱신**됩니다(include 블록은 중복 추가되지 않음).

수동으로 할 때는 `app.py` 맨 끝에 다음을 넣습니다.

```python
from mangnam_api import install as install_mangnam
install_mangnam(app, db=db, admin_ok=admin_ok, current_user=current_user,
                now_iso=now_iso, new_id=new_id, s=s, db_path=DB_PATH)
```

> `sakyowon-server`/`haeory-cyber/sakyowon-site` 의 `setup.sh` 는 `app.py` 만 복사하므로, 서버를 처음부터 다시 설치하면 이 스크립트를 한 번 더 돌려야 합니다.

확인:

```bash
curl -s https://sakyowon.co.kr/api/mangnam/health
# {"ok":true,"module":"mangnam","version":"1.0.0",...}
```

## 로컬에서 돌려 보기

```bash
pip install "fastapi>=0.110" "uvicorn[standard]>=0.29"
SAKYOWON_ADMIN_KEY=devkey SAKYOWON_DB=/tmp/mn-dev.db SAKYOWON_ALLOW_ORIGINS=http://localhost:3000 \
  python server/mangnam_api.py            # 127.0.0.1:8787
```

프론트는 `.env.development.local` 에 `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787/api` 를 두고 `npm run dev` → `http://localhost:3000/mangnam-coop/admin/` 에서 비밀번호 `devkey`. 이 파일은 `next build` 가 읽지 않으므로 배포본은 항상 같은 출처 `/api` 를 씁니다.

## 데이터 모델 (SQLite, 접두어 `mn_`)

| 테이블 | 내용 |
|---|---|
| `mn_ledger` | 회계 전표: 일자·월·수입/지출·항목(계정과목)·사업·적요·금액·거래처·결제방법·증빙·메모 |
| `mn_months` | 월 상태: `open/closed`(마감), `public`(사이트 공개 여부), 메모, 마감자·시각 |
| `mn_meetings` | 회의록: 일자·종류(총회/이사회/운영회의/분과/기타)·제목·장소·의장·기록·참석·안건·내용·결정·후속·첨부·공개 |
| `mn_documents` | 보관 문서: 제목·분류·문서일자·설명·태그·외부링크·첨부 |
| `mn_files` | 첨부 실체 메타(이름·mime·크기·sha256·경로·scope). 파일은 `SAKYOWON_FILES`(기본 DB폴더/files/mangnam) |
| `mn_posts` | 게시물: board(`disclosure` 경영공시 / `performance` 실적)·분류·연도·기간·제목·요약·본문·지표(JSON)·첨부(JSON)·상태(초안/게시) |

규칙
- **마감된 달**의 전표는 추가·수정·삭제가 막힙니다(409). 마감 해제 후 고칩니다.
- **공개 범위**: 전표 개별 내용은 절대 공개되지 않고, `mn_months.public=1` 인 달의 **수입·지출 합계**만 `/public/finance` 로 나갑니다. 회의록은 `published=1` 일 때 일자·종류·제목·안건·결정사항·첨부만 나가고 **회의 내용(논의 경과)·참석자·후속조치는 나가지 않습니다.**
- **첨부 공개**: 게시(published) 상태의 공시·실적·회의록이 참조하는 파일만 `scope=public` 으로 바뀌어 누구나 내려받을 수 있고, 게시를 내리면 다시 운영진 전용으로 돌아갑니다(저장 때마다 재계산).
- 파일 업로드는 `python-multipart` 의존성을 피하려고 **JSON base64** 로 받습니다(기본 20MB, `MANGNAM_MAX_FILE_MB`).

## 인증

관리자 엔드포인트는 다음 중 하나면 통과합니다.
1. `?key=` 쿼리 / `X-Admin-Key` 헤더 / 본문 `key` = 서버 `SAKYOWON_ADMIN_KEY`
2. 사교원 통합 계정 세션 쿠키(`sk_session`) 의 역할이 `admin` 또는 `staff`

프론트 관리 화면은 먼저 세션을 시도하고, 없으면 비밀번호를 받아 `sessionStorage`(탭 닫으면 소멸)에 두고 `?key=` 로 보냅니다.

## 엔드포인트

`server/mangnam_api.py` 상단 docstring 참고. 공개(★) 4개: `public/posts`, `public/posts/{id}`, `public/finance`, `public/meetings` + `files/{id}`(공개 첨부).

## 백업

DB 파일 하나(`sakyowon.db`)와 첨부 폴더(`data/files/mangnam/`)를 함께 복사하면 됩니다. 회계 CSV 는 관리 화면 "이 달 CSV / 연간 CSV" 또는 `GET /api/mangnam/ledger.csv?year=2026&key=…`.
