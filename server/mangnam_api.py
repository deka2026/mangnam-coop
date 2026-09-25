"""
망남마을협동조합 운영 백엔드 — 사교원 자체 서버(app.py) 확장 모듈

월별 회계 · 회의록 · 문서 보관 · 경영공시/실적 게시를 처리한다.
사교원 자체 서버(FastAPI + SQLite, /opt/sakyowon/server/app.py)에 붙여 쓰도록 만들었고,
DB 연결·관리자 인증(관리자 키 또는 통합 계정 세션)은 app.py의 것을 그대로 빌려 쓴다.

app.py 끝에 아래 세 줄을 넣으면 붙는다 (install-on-server.sh 가 자동으로 넣어 준다):

    from mangnam_api import install as install_mangnam
    install_mangnam(app, db=db, admin_ok=admin_ok, current_user=current_user,
                    now_iso=now_iso, new_id=new_id, s=s, db_path=DB_PATH)

로컬 개발용으로 혼자서도 돈다 (인증은 SAKYOWON_ADMIN_KEY 하나만):

    SAKYOWON_ADMIN_KEY=devkey SAKYOWON_DB=./dev.db \
    uvicorn mangnam_api:standalone_app --factory --port 8787

엔드포인트 (모두 /api/mangnam 아래. ★=공개, 나머지는 관리자)
  ★ GET  health                         모듈 상태
    GET  me                             인증 확인 (키 또는 세션)
    GET  ledger?month=YYYY-MM|year=YYYY 회계 전표 목록
    POST ledger                         전표 저장 (id 있으면 수정)
    DELETE ledger/{id}
    GET  ledger/summary?year=YYYY       월별·항목별 집계
    GET  ledger.csv?year=&month=        CSV 내려받기
    POST ledger/months/{YYYY-MM}        월 마감/재개, 공개 여부, 메모
    GET  meetings?year=&kind=&q=        회의록 목록
    GET  meetings/{id}
    POST meetings                       회의록 저장 (id 있으면 수정)
    DELETE meetings/{id}
    GET  documents?category=&q=         보관 문서 목록
    POST documents                      문서 저장 (id 있으면 수정)
    DELETE documents/{id}
    POST files                          파일 올리기 (JSON base64)
  ★ GET  files/{id}                     내려받기 (공개 게시물 첨부만 공개, 나머지는 관리자)
    DELETE files/{id}
    GET  posts?board=&status=           게시물 목록 (공시·실적)
    GET  posts/{id}
    POST posts                          게시물 저장 (id 있으면 수정)
    DELETE posts/{id}
  ★ GET  public/posts?board=&year=      게시된 공시·실적
  ★ GET  public/posts/{id}
  ★ GET  public/finance?year=           공개로 표시한 달의 수입·지출 합계
  ★ GET  public/meetings?year=          공개로 표시한 회의 결과

환경변수
  SAKYOWON_FILES        첨부 저장 폴더 (기본: DB 폴더/files/mangnam)
  MANGNAM_MAX_FILE_MB   첨부 최대 크기 MB (기본 20)
"""

import base64
import csv
import hashlib
import io
import json
import os
import re
import sqlite3
from datetime import datetime, timezone

from fastapi import APIRouter, FastAPI, Query, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

VERSION = "1.0.0"
PREFIX = "/api/mangnam"
MAX_FILE_MB = int(os.environ.get("MANGNAM_MAX_FILE_MB", "20") or "20")

LEDGER_KINDS = ("income", "expense")
MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _valid_date(v: str) -> bool:
    """YYYY-MM-DD 이고 실제 존재하는 날짜인지."""
    if not DATE_RE.match(v or ""):
        return False
    try:
        datetime.strptime(v, "%Y-%m-%d")
        return True
    except ValueError:
        return False


BOARDS = ("disclosure", "performance")
POST_STATUSES = ("draft", "published")
MEETING_KINDS = ("총회", "이사회", "운영회의", "분과회의", "기타")

# 화면에서 고르는 기본 항목. 자유 입력도 허용하므로 서버는 검증하지 않는다.
DEFAULT_CATEGORIES = {
    "income": ["출자금", "조합비", "사업수입", "보조금", "후원·기부", "이자·잡수입", "기타수입"],
    "expense": ["인건비", "재료비", "운영비", "임차료", "공과금", "행사비", "교육비", "세금·수수료", "기타지출"],
    "business": ["공통", "마을식당·편의점", "별달물멍잠자리", "마을학교", "플로깅", "고향사랑기부"],
    "document": ["정관·규약", "등기·인허가", "총회·이사회", "계약서", "회계·세무", "보조금·사업", "보고서", "기타"],
    "disclosure": ["정관·규약", "총회·이사회 활동", "사업결산보고", "사업결과보고", "기타 공시"],
    "performance": ["월간 실적", "연간 실적", "사업별 실적", "기타"],
}


# ───────────────────────── 유틸 ─────────────────────────

def _err(msg: str, status: int = 400):
    return JSONResponse({"ok": False, "error": msg}, status_code=status)


def _int(v, default=0):
    try:
        if v in (None, ""):
            return default
        return int(round(float(str(v).replace(",", ""))))
    except (TypeError, ValueError):
        return default


def _json_list(v):
    """DB의 JSON 문자열 → 리스트 (깨졌으면 빈 리스트)."""
    if isinstance(v, list):
        return v
    try:
        out = json.loads(v or "[]")
        return out if isinstance(out, list) else []
    except Exception:
        return []


def _dump(v):
    return json.dumps(v if v is not None else [], ensure_ascii=False)


def _safe_name(name: str) -> str:
    name = os.path.basename(name or "").strip() or "file"
    return re.sub(r"[\\/:*?\"<>|\x00-\x1f]", "_", name)[:120]


async def _read_json(request: Request):
    body = await request.body()
    if not body:
        return {}
    try:
        data = json.loads(body.decode("utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


# ───────────────────────── 설치 ─────────────────────────

def init_tables(db):
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS mn_ledger (
                id           TEXT PRIMARY KEY,
                created_at   TEXT NOT NULL,
                updated_at   TEXT,
                date         TEXT NOT NULL,
                month        TEXT NOT NULL,
                kind         TEXT NOT NULL,
                category     TEXT,
                business     TEXT,
                description  TEXT,
                amount       INTEGER NOT NULL DEFAULT 0,
                counterparty TEXT,
                method       TEXT,
                evidence     TEXT,
                memo         TEXT,
                created_by   TEXT
            );
            CREATE INDEX IF NOT EXISTS mn_ledger_month ON mn_ledger(month);

            CREATE TABLE IF NOT EXISTS mn_months (
                month        TEXT PRIMARY KEY,
                status       TEXT NOT NULL DEFAULT 'open',
                public       INTEGER NOT NULL DEFAULT 0,
                note         TEXT,
                closed_at    TEXT,
                closed_by    TEXT,
                updated_at   TEXT
            );

            CREATE TABLE IF NOT EXISTS mn_meetings (
                id           TEXT PRIMARY KEY,
                created_at   TEXT NOT NULL,
                updated_at   TEXT,
                date         TEXT NOT NULL,
                kind         TEXT,
                title        TEXT NOT NULL,
                place        TEXT,
                chair        TEXT,
                recorder     TEXT,
                attendees    TEXT,
                agenda       TEXT,
                content      TEXT,
                decisions    TEXT,
                followups    TEXT,
                attachments  TEXT,
                published    INTEGER NOT NULL DEFAULT 0,
                created_by   TEXT
            );

            CREATE TABLE IF NOT EXISTS mn_documents (
                id           TEXT PRIMARY KEY,
                created_at   TEXT NOT NULL,
                updated_at   TEXT,
                title        TEXT NOT NULL,
                category     TEXT,
                doc_date     TEXT,
                description  TEXT,
                tags         TEXT,
                url          TEXT,
                file_id      TEXT,
                created_by   TEXT
            );

            CREATE TABLE IF NOT EXISTS mn_files (
                id           TEXT PRIMARY KEY,
                created_at   TEXT NOT NULL,
                name         TEXT NOT NULL,
                mime         TEXT,
                size         INTEGER NOT NULL DEFAULT 0,
                sha256       TEXT,
                path         TEXT NOT NULL,
                scope        TEXT NOT NULL DEFAULT 'internal',
                created_by   TEXT
            );

            CREATE TABLE IF NOT EXISTS mn_posts (
                id           TEXT PRIMARY KEY,
                created_at   TEXT NOT NULL,
                updated_at   TEXT,
                published_at TEXT,
                board        TEXT NOT NULL,
                category     TEXT,
                year         INTEGER,
                period       TEXT,
                title        TEXT NOT NULL,
                summary      TEXT,
                body         TEXT,
                metrics      TEXT,
                attachments  TEXT,
                status       TEXT NOT NULL DEFAULT 'draft',
                created_by   TEXT
            );
            CREATE INDEX IF NOT EXISTS mn_posts_board ON mn_posts(board, status);
            """
        )


def install(app, *, db, admin_ok, current_user, now_iso, new_id, s, db_path="", notify=None):
    """app.py 의 FastAPI 인스턴스에 라우터를 붙인다.

    db          : contextmanager — with db() as conn (sqlite3.Row 팩토리, 자동 commit)
    admin_ok    : (request, key) -> bool — 관리자 키 또는 admin·staff 세션
    current_user: (request) -> dict|None
    now_iso/new_id/s : app.py 유틸
    db_path     : 첨부 저장 폴더를 DB 옆에 두기 위한 힌트
    """
    files_dir = os.environ.get("SAKYOWON_FILES") or os.path.join(
        os.path.dirname(os.path.abspath(db_path or "data/sakyowon.db")), "files", "mangnam"
    )
    os.makedirs(files_dir, exist_ok=True)
    init_tables(db)

    r = APIRouter(prefix=PREFIX)

    # ── 인증 ──
    def key_of(request: Request, body=None) -> str:
        return s(
            request.query_params.get("key")
            or request.headers.get("x-admin-key")
            or (body or {}).get("key")
            or ""
        )

    def who(request: Request, body=None):
        """(작성자 표시명, 오류응답). 관리자 키 또는 admin·staff 세션이면 통과."""
        if not admin_ok(request, key_of(request, body)):
            return None, _err("관리자 권한이 필요합니다. 관리자 비밀번호를 확인하거나 사교원 통합 계정으로 로그인해 주세요.", 401)
        u = current_user(request)
        return ((u.get("name") or u.get("username")) if u else "관리자"), None

    @r.get("/health")
    def health():
        return {"ok": True, "module": "mangnam", "version": VERSION, "time": now_iso()}

    @r.get("/me")
    def me(request: Request):
        name, e = who(request)
        if e:
            return e
        u = current_user(request)
        return {"ok": True, "name": name, "via": "session" if u else "key", "categories": DEFAULT_CATEGORIES}

    # ── 회계 ──
    def month_info(conn, month: str) -> dict:
        row = conn.execute("SELECT * FROM mn_months WHERE month = ?", (month,)).fetchone()
        if row is None:
            return {"month": month, "status": "open", "public": 0, "note": "", "closed_at": None, "closed_by": None}
        d = dict(row)
        d["note"] = d.get("note") or ""
        return d

    def month_closed(conn, month: str) -> bool:
        return month_info(conn, month)["status"] == "closed"

    @r.get("/ledger")
    def ledger_list(request: Request, month: str = Query(""), year: str = Query("")):
        name, e = who(request)
        if e:
            return e
        sql, args = "SELECT * FROM mn_ledger", []
        if month:
            if not MONTH_RE.match(month):
                return _err("month 형식은 YYYY-MM 입니다.")
            sql += " WHERE month = ?"; args.append(month)
        elif year:
            sql += " WHERE month LIKE ?"; args.append(f"{_int(year):04d}-%")
        sql += " ORDER BY date DESC, created_at DESC"
        with db() as conn:
            rows = [dict(x) for x in conn.execute(sql, args).fetchall()]
            info = month_info(conn, month) if month else None
        return {"ok": True, "rows": rows, "month": info}

    @r.post("/ledger")
    async def ledger_save(request: Request):
        body = await _read_json(request)
        name, e = who(request, body)
        if e:
            return e
        date = s(body.get("date"))
        if not _valid_date(date):
            return _err("날짜는 YYYY-MM-DD 형식이어야 합니다.")
        kind = s(body.get("kind"))
        if kind not in LEDGER_KINDS:
            return _err("kind 는 income(수입) 또는 expense(지출) 이어야 합니다.")
        amount = _int(body.get("amount"), -1)
        if amount < 0:
            return _err("금액은 0 이상의 정수(원)여야 합니다.")
        description = s(body.get("description"))
        if not description:
            return _err("적요(내용)를 입력해 주세요.")
        month = date[:7]
        row_id = s(body.get("id"))
        with db() as conn:
            if month_closed(conn, month):
                return _err(f"{month} 은 마감된 달입니다. 마감을 해제한 뒤 수정해 주세요.", 409)
            if row_id:
                old = conn.execute("SELECT month FROM mn_ledger WHERE id = ?", (row_id,)).fetchone()
                if old is None:
                    return _err("전표를 찾을 수 없습니다.", 404)
                if old["month"] != month and month_closed(conn, old["month"]):
                    return _err(f"{old['month']} 은 마감된 달입니다.", 409)
                conn.execute(
                    "UPDATE mn_ledger SET updated_at=?, date=?, month=?, kind=?, category=?, business=?,"
                    " description=?, amount=?, counterparty=?, method=?, evidence=?, memo=? WHERE id=?",
                    (now_iso(), date, month, kind, s(body.get("category")), s(body.get("business")),
                     description, amount, s(body.get("counterparty")), s(body.get("method")),
                     s(body.get("evidence")), s(body.get("memo")), row_id),
                )
            else:
                row_id = new_id("LED")
                conn.execute(
                    "INSERT INTO mn_ledger (id, created_at, updated_at, date, month, kind, category, business,"
                    " description, amount, counterparty, method, evidence, memo, created_by)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (row_id, now_iso(), now_iso(), date, month, kind, s(body.get("category")),
                     s(body.get("business")), description, amount, s(body.get("counterparty")),
                     s(body.get("method")), s(body.get("evidence")), s(body.get("memo")), name),
                )
            row = dict(conn.execute("SELECT * FROM mn_ledger WHERE id = ?", (row_id,)).fetchone())
        return {"ok": True, "id": row_id, "row": row}

    @r.delete("/ledger/{row_id}")
    def ledger_delete(row_id: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            old = conn.execute("SELECT month FROM mn_ledger WHERE id = ?", (row_id,)).fetchone()
            if old is None:
                return _err("전표를 찾을 수 없습니다.", 404)
            if month_closed(conn, old["month"]):
                return _err(f"{old['month']} 은 마감된 달입니다.", 409)
            conn.execute("DELETE FROM mn_ledger WHERE id = ?", (row_id,))
        return {"ok": True}

    def summarize(conn, year: int) -> dict:
        like = f"{year:04d}-%"
        months = {}
        for m in range(1, 13):
            key = f"{year:04d}-{m:02d}"
            months[key] = {"month": key, "income": 0, "expense": 0, "net": 0, "count": 0, "status": "open", "public": 0}
        for row in conn.execute(
            "SELECT month, kind, SUM(amount) AS total, COUNT(*) AS n FROM mn_ledger"
            " WHERE month LIKE ? GROUP BY month, kind", (like,)
        ).fetchall():
            m = months.setdefault(row["month"], {"month": row["month"], "income": 0, "expense": 0, "net": 0, "count": 0, "status": "open", "public": 0})
            m[row["kind"]] = row["total"] or 0
            m["count"] += row["n"]
        for row in conn.execute("SELECT * FROM mn_months WHERE month LIKE ?", (like,)).fetchall():
            if row["month"] in months:
                months[row["month"]]["status"] = row["status"]
                months[row["month"]]["public"] = row["public"]
                months[row["month"]]["note"] = row["note"] or ""
        for m in months.values():
            m["net"] = m["income"] - m["expense"]
        cats = {"income": [], "expense": []}
        for row in conn.execute(
            "SELECT kind, COALESCE(NULLIF(category,''),'(미분류)') AS category, SUM(amount) AS total, COUNT(*) AS n"
            " FROM mn_ledger WHERE month LIKE ? GROUP BY kind, category ORDER BY total DESC", (like,)
        ).fetchall():
            cats[row["kind"]].append({"category": row["category"], "total": row["total"] or 0, "count": row["n"]})
        biz = {}
        for row in conn.execute(
            "SELECT COALESCE(NULLIF(business,''),'공통') AS business, kind, SUM(amount) AS total"
            " FROM mn_ledger WHERE month LIKE ? GROUP BY business, kind", (like,)
        ).fetchall():
            b = biz.setdefault(row["business"], {"business": row["business"], "income": 0, "expense": 0})
            b[row["kind"]] = row["total"] or 0
        for b in biz.values():
            b["net"] = b["income"] - b["expense"]
        total_income = sum(m["income"] for m in months.values())
        total_expense = sum(m["expense"] for m in months.values())
        return {
            "year": year,
            "months": [months[k] for k in sorted(months)],
            "categories": cats,
            "businesses": sorted(biz.values(), key=lambda x: -(x["income"] + x["expense"])),
            "total": {"income": total_income, "expense": total_expense, "net": total_income - total_expense},
        }

    @r.get("/ledger/summary")
    def ledger_summary(request: Request, year: str = Query("")):
        name, e = who(request)
        if e:
            return e
        y = _int(year) or datetime.now().year
        with db() as conn:
            years = [row[0] for row in conn.execute(
                "SELECT DISTINCT substr(month,1,4) FROM mn_ledger ORDER BY 1 DESC").fetchall()]
            data = summarize(conn, y)
        data["years"] = years
        return {"ok": True, **data}

    @r.get("/ledger.csv")
    def ledger_csv(request: Request, year: str = Query(""), month: str = Query("")):
        name, e = who(request)
        if e:
            return e
        sql, args = "SELECT * FROM mn_ledger", []
        if month:
            sql += " WHERE month = ?"; args.append(month)
        elif year:
            sql += " WHERE month LIKE ?"; args.append(f"{_int(year):04d}-%")
        sql += " ORDER BY date, created_at"
        with db() as conn:
            rows = [dict(x) for x in conn.execute(sql, args).fetchall()]
        buf = io.StringIO()
        buf.write("﻿")  # 엑셀 한글 깨짐 방지 BOM
        w = csv.writer(buf)
        w.writerow(["일자", "구분", "항목", "사업", "적요", "금액", "거래처", "결제방법", "증빙", "메모", "전표번호"])
        for x in rows:
            w.writerow([x["date"], "수입" if x["kind"] == "income" else "지출", x["category"], x["business"],
                        x["description"], x["amount"], x["counterparty"], x["method"], x["evidence"], x["memo"], x["id"]])
        label = month or year or "all"
        return StreamingResponse(
            iter([buf.getvalue()]), media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename=mangnam-ledger-{label}.csv"},
        )

    @r.post("/ledger/months/{month}")
    async def ledger_month_update(month: str, request: Request):
        body = await _read_json(request)
        name, e = who(request, body)
        if e:
            return e
        if not MONTH_RE.match(month):
            return _err("month 형식은 YYYY-MM 입니다.")
        status = s(body.get("status"))
        if status and status not in ("open", "closed"):
            return _err("status 는 open 또는 closed 입니다.")
        with db() as conn:
            cur = month_info(conn, month)
            new_status = status or cur["status"]
            public = 1 if body.get("public") in (True, 1, "1", "true") else (0 if "public" in body else cur["public"])
            note = s(body.get("note")) if "note" in body else cur["note"]
            closed_at = cur.get("closed_at")
            closed_by = cur.get("closed_by")
            if new_status == "closed" and cur["status"] != "closed":
                closed_at, closed_by = now_iso(), name
            if new_status == "open":
                closed_at, closed_by = None, None
            conn.execute(
                "INSERT INTO mn_months (month, status, public, note, closed_at, closed_by, updated_at)"
                " VALUES (?,?,?,?,?,?,?) ON CONFLICT(month) DO UPDATE SET status=excluded.status,"
                " public=excluded.public, note=excluded.note, closed_at=excluded.closed_at,"
                " closed_by=excluded.closed_by, updated_at=excluded.updated_at",
                (month, new_status, public, note, closed_at, closed_by, now_iso()),
            )
            info = month_info(conn, month)
        return {"ok": True, "month": info}

    # ── 회의록 ──
    def meeting_row(x) -> dict:
        d = dict(x)
        d["attachments"] = _json_list(d.get("attachments"))
        return d

    @r.get("/meetings")
    def meetings_list(request: Request, year: str = Query(""), kind: str = Query(""), q: str = Query("")):
        name, e = who(request)
        if e:
            return e
        sql, where, args = "SELECT * FROM mn_meetings", [], []
        if year:
            where.append("date LIKE ?"); args.append(f"{_int(year):04d}-%")
        if kind:
            where.append("kind = ?"); args.append(kind)
        if q:
            where.append("(title LIKE ? OR agenda LIKE ? OR content LIKE ? OR decisions LIKE ? OR attendees LIKE ?)")
            args.extend([f"%{q}%"] * 5)
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += " ORDER BY date DESC, created_at DESC"
        with db() as conn:
            rows = [meeting_row(x) for x in conn.execute(sql, args).fetchall()]
            years = [row[0] for row in conn.execute(
                "SELECT DISTINCT substr(date,1,4) FROM mn_meetings ORDER BY 1 DESC").fetchall()]
        return {"ok": True, "rows": rows, "years": years, "kinds": list(MEETING_KINDS)}

    @r.get("/meetings/{mid}")
    def meeting_get(mid: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            row = conn.execute("SELECT * FROM mn_meetings WHERE id = ?", (mid,)).fetchone()
        if row is None:
            return _err("회의록을 찾을 수 없습니다.", 404)
        return {"ok": True, "row": meeting_row(row)}

    @r.post("/meetings")
    async def meeting_save(request: Request):
        body = await _read_json(request)
        name, e = who(request, body)
        if e:
            return e
        date = s(body.get("date"))
        title = s(body.get("title"))
        if not _valid_date(date):
            return _err("회의 날짜는 YYYY-MM-DD 형식이어야 합니다.")
        if not title:
            return _err("회의 제목을 입력해 주세요.")
        attachments = [a for a in _json_list(body.get("attachments")) if isinstance(a, dict) and a.get("file_id")]
        published = 1 if body.get("published") in (True, 1, "1", "true") else 0
        fields = (date, s(body.get("kind")) or "기타", title, s(body.get("place")), s(body.get("chair")),
                  s(body.get("recorder")), s(body.get("attendees")), s(body.get("agenda")), s(body.get("content")),
                  s(body.get("decisions")), s(body.get("followups")), _dump(attachments), published)
        mid = s(body.get("id"))
        with db() as conn:
            if mid:
                if conn.execute("SELECT 1 FROM mn_meetings WHERE id = ?", (mid,)).fetchone() is None:
                    return _err("회의록을 찾을 수 없습니다.", 404)
                conn.execute(
                    "UPDATE mn_meetings SET updated_at=?, date=?, kind=?, title=?, place=?, chair=?, recorder=?,"
                    " attendees=?, agenda=?, content=?, decisions=?, followups=?, attachments=?, published=? WHERE id=?",
                    (now_iso(), *fields, mid),
                )
            else:
                mid = new_id("MTG")
                conn.execute(
                    "INSERT INTO mn_meetings (id, created_at, updated_at, date, kind, title, place, chair, recorder,"
                    " attendees, agenda, content, decisions, followups, attachments, published, created_by)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (mid, now_iso(), now_iso(), *fields, name),
                )
            sync_file_scopes(conn)
            row = meeting_row(conn.execute("SELECT * FROM mn_meetings WHERE id = ?", (mid,)).fetchone())
        return {"ok": True, "id": mid, "row": row}

    @r.delete("/meetings/{mid}")
    def meeting_delete(mid: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            if conn.execute("SELECT 1 FROM mn_meetings WHERE id = ?", (mid,)).fetchone() is None:
                return _err("회의록을 찾을 수 없습니다.", 404)
            conn.execute("DELETE FROM mn_meetings WHERE id = ?", (mid,))
            sync_file_scopes(conn)
        return {"ok": True}

    # ── 파일 ──
    def sync_file_scopes(conn):
        """게시(published)된 공시·실적·회의록이 참조하는 첨부만 'public', 나머지는 'internal'."""
        public_ids = set()
        for row in conn.execute("SELECT attachments FROM mn_posts WHERE status = 'published'").fetchall():
            for a in _json_list(row["attachments"]):
                if isinstance(a, dict) and a.get("file_id"):
                    public_ids.add(a["file_id"])
        for row in conn.execute("SELECT attachments FROM mn_meetings WHERE published = 1").fetchall():
            for a in _json_list(row["attachments"]):
                if isinstance(a, dict) and a.get("file_id"):
                    public_ids.add(a["file_id"])
        conn.execute("UPDATE mn_files SET scope = 'internal' WHERE scope != 'internal'")
        for fid in public_ids:
            conn.execute("UPDATE mn_files SET scope = 'public' WHERE id = ?", (fid,))

    @r.post("/files")
    async def file_upload(request: Request):
        body = await _read_json(request)
        name, e = who(request, body)
        if e:
            return e
        fname = _safe_name(s(body.get("name")))
        data = s(body.get("data"))
        if not data:
            return _err("파일 내용(data, base64)이 비어 있습니다.")
        if "," in data[:80] and data.startswith("data:"):
            data = data.split(",", 1)[1]  # data URL 이면 헤더 제거
        try:
            raw = base64.b64decode(data, validate=False)
        except Exception:
            return _err("base64 를 해석할 수 없습니다.")
        if len(raw) > MAX_FILE_MB * 1024 * 1024:
            return _err(f"파일이 너무 큽니다 (최대 {MAX_FILE_MB}MB).", 413)
        fid = new_id("FIL")
        sub = datetime.now().strftime("%Y")
        os.makedirs(os.path.join(files_dir, sub), exist_ok=True)
        rel = os.path.join(sub, f"{fid}_{fname}")
        with open(os.path.join(files_dir, rel), "wb") as fh:
            fh.write(raw)
        digest = hashlib.sha256(raw).hexdigest()
        with db() as conn:
            conn.execute(
                "INSERT INTO mn_files (id, created_at, name, mime, size, sha256, path, scope, created_by)"
                " VALUES (?,?,?,?,?,?,?,?,?)",
                (fid, now_iso(), fname, s(body.get("mime")) or "application/octet-stream",
                 len(raw), digest, rel, "internal", name),
            )
        return {"ok": True, "id": fid, "name": fname, "size": len(raw), "sha256": digest}

    @r.get("/files/{fid}")
    def file_download(fid: str, request: Request):
        with db() as conn:
            row = conn.execute("SELECT * FROM mn_files WHERE id = ?", (fid,)).fetchone()
        if row is None:
            return _err("파일을 찾을 수 없습니다.", 404)
        if row["scope"] != "public" and not admin_ok(request, key_of(request)):
            return _err("이 파일은 운영진만 내려받을 수 있습니다.", 401)
        path = os.path.join(files_dir, row["path"])
        if not os.path.isfile(path):
            return _err("서버에 파일 실체가 없습니다.", 410)
        return FileResponse(path, media_type=row["mime"] or "application/octet-stream", filename=row["name"])

    @r.delete("/files/{fid}")
    def file_delete(fid: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            row = conn.execute("SELECT * FROM mn_files WHERE id = ?", (fid,)).fetchone()
            if row is None:
                return _err("파일을 찾을 수 없습니다.", 404)
            used = conn.execute("SELECT 1 FROM mn_documents WHERE file_id = ?", (fid,)).fetchone()
            if used:
                return _err("보관 문서가 쓰고 있는 파일입니다. 문서를 먼저 지워 주세요.", 409)
            conn.execute("DELETE FROM mn_files WHERE id = ?", (fid,))
        try:
            os.remove(os.path.join(files_dir, row["path"]))
        except OSError:
            pass
        return {"ok": True}

    # ── 문서 보관 ──
    def document_row(conn, x) -> dict:
        d = dict(x)
        d["file"] = None
        if d.get("file_id"):
            f = conn.execute("SELECT id, name, mime, size, created_at FROM mn_files WHERE id = ?", (d["file_id"],)).fetchone()
            d["file"] = dict(f) if f else None
        return d

    @r.get("/documents")
    def documents_list(request: Request, category: str = Query(""), q: str = Query("")):
        name, e = who(request)
        if e:
            return e
        sql, where, args = "SELECT * FROM mn_documents", [], []
        if category:
            where.append("category = ?"); args.append(category)
        if q:
            where.append("(title LIKE ? OR description LIKE ? OR tags LIKE ?)"); args.extend([f"%{q}%"] * 3)
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += " ORDER BY COALESCE(NULLIF(doc_date,''), created_at) DESC, created_at DESC"
        with db() as conn:
            rows = [document_row(conn, x) for x in conn.execute(sql, args).fetchall()]
        return {"ok": True, "rows": rows, "categories": DEFAULT_CATEGORIES["document"]}

    @r.post("/documents")
    async def document_save(request: Request):
        body = await _read_json(request)
        name, e = who(request, body)
        if e:
            return e
        title = s(body.get("title"))
        if not title:
            return _err("문서 제목을 입력해 주세요.")
        doc_date = s(body.get("doc_date"))
        if doc_date and not _valid_date(doc_date):
            return _err("문서 일자는 YYYY-MM-DD 형식이어야 합니다.")
        file_id = s(body.get("file_id"))
        did = s(body.get("id"))
        with db() as conn:
            if file_id and conn.execute("SELECT 1 FROM mn_files WHERE id = ?", (file_id,)).fetchone() is None:
                return _err("첨부 파일을 찾을 수 없습니다.", 404)
            fields = (title, s(body.get("category")) or "기타", doc_date, s(body.get("description")),
                      s(body.get("tags")), s(body.get("url")), file_id or None)
            if did:
                if conn.execute("SELECT 1 FROM mn_documents WHERE id = ?", (did,)).fetchone() is None:
                    return _err("문서를 찾을 수 없습니다.", 404)
                conn.execute(
                    "UPDATE mn_documents SET updated_at=?, title=?, category=?, doc_date=?, description=?, tags=?,"
                    " url=?, file_id=? WHERE id=?", (now_iso(), *fields, did),
                )
            else:
                did = new_id("MDOC")
                conn.execute(
                    "INSERT INTO mn_documents (id, created_at, updated_at, title, category, doc_date, description,"
                    " tags, url, file_id, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    (did, now_iso(), now_iso(), *fields, name),
                )
            row = document_row(conn, conn.execute("SELECT * FROM mn_documents WHERE id = ?", (did,)).fetchone())
        return {"ok": True, "id": did, "row": row}

    @r.delete("/documents/{did}")
    def document_delete(did: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            row = conn.execute("SELECT file_id FROM mn_documents WHERE id = ?", (did,)).fetchone()
            if row is None:
                return _err("문서를 찾을 수 없습니다.", 404)
            conn.execute("DELETE FROM mn_documents WHERE id = ?", (did,))
            fid = row["file_id"]
            f = conn.execute("SELECT path FROM mn_files WHERE id = ?", (fid,)).fetchone() if fid else None
            if f:
                conn.execute("DELETE FROM mn_files WHERE id = ?", (fid,))
        if f:
            try:
                os.remove(os.path.join(files_dir, f["path"]))
            except OSError:
                pass
        return {"ok": True}

    # ── 게시물 (경영공시 · 실적) ──
    def post_row(x, public=False) -> dict:
        d = dict(x)
        d["metrics"] = [m for m in _json_list(d.get("metrics")) if isinstance(m, dict)]
        d["attachments"] = [a for a in _json_list(d.get("attachments")) if isinstance(a, dict)]
        if public:
            d.pop("created_by", None)
        return d

    @r.get("/posts")
    def posts_list(request: Request, board: str = Query(""), status: str = Query("")):
        name, e = who(request)
        if e:
            return e
        sql, where, args = "SELECT * FROM mn_posts", [], []
        if board:
            where.append("board = ?"); args.append(board)
        if status:
            where.append("status = ?"); args.append(status)
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += " ORDER BY COALESCE(year, 0) DESC, COALESCE(period,'') DESC, created_at DESC"
        with db() as conn:
            rows = [post_row(x) for x in conn.execute(sql, args).fetchall()]
        return {"ok": True, "rows": rows}

    @r.get("/posts/{pid}")
    def post_get(pid: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            row = conn.execute("SELECT * FROM mn_posts WHERE id = ?", (pid,)).fetchone()
        if row is None:
            return _err("게시물을 찾을 수 없습니다.", 404)
        return {"ok": True, "row": post_row(row)}

    @r.post("/posts")
    async def post_save(request: Request):
        body = await _read_json(request)
        name, e = who(request, body)
        if e:
            return e
        board = s(body.get("board"))
        if board not in BOARDS:
            return _err("board 는 disclosure(경영공시) 또는 performance(실적) 입니다.")
        title = s(body.get("title"))
        if not title:
            return _err("제목을 입력해 주세요.")
        status = s(body.get("status")) or "draft"
        if status not in POST_STATUSES:
            return _err("status 는 draft 또는 published 입니다.")
        year = _int(body.get("year"), 0) or None
        metrics = []
        for m in _json_list(body.get("metrics")):
            if isinstance(m, dict) and s(m.get("label")):
                metrics.append({"label": s(m.get("label")), "value": s(m.get("value")), "unit": s(m.get("unit")),
                                "note": s(m.get("note"))})
        attachments = []
        with db() as conn:
            for a in _json_list(body.get("attachments")):
                if isinstance(a, dict) and s(a.get("file_id")):
                    f = conn.execute("SELECT id, name FROM mn_files WHERE id = ?", (s(a.get("file_id")),)).fetchone()
                    if f:
                        attachments.append({"file_id": f["id"], "name": s(a.get("name")) or f["name"]})
            pid = s(body.get("id"))
            fields = (board, s(body.get("category")), year, s(body.get("period")), title, s(body.get("summary")),
                      s(body.get("body")), _dump(metrics), _dump(attachments), status)
            if pid:
                old = conn.execute("SELECT status, published_at FROM mn_posts WHERE id = ?", (pid,)).fetchone()
                if old is None:
                    return _err("게시물을 찾을 수 없습니다.", 404)
                published_at = old["published_at"]
                if status == "published" and not published_at:
                    published_at = now_iso()
                conn.execute(
                    "UPDATE mn_posts SET updated_at=?, published_at=?, board=?, category=?, year=?, period=?, title=?,"
                    " summary=?, body=?, metrics=?, attachments=?, status=? WHERE id=?",
                    (now_iso(), published_at, *fields, pid),
                )
            else:
                pid = new_id("POST")
                conn.execute(
                    "INSERT INTO mn_posts (id, created_at, updated_at, published_at, board, category, year, period,"
                    " title, summary, body, metrics, attachments, status, created_by)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (pid, now_iso(), now_iso(), now_iso() if status == "published" else None, *fields, name),
                )
            sync_file_scopes(conn)
            row = post_row(conn.execute("SELECT * FROM mn_posts WHERE id = ?", (pid,)).fetchone())
        return {"ok": True, "id": pid, "row": row}

    @r.delete("/posts/{pid}")
    def post_delete(pid: str, request: Request):
        name, e = who(request)
        if e:
            return e
        with db() as conn:
            if conn.execute("SELECT 1 FROM mn_posts WHERE id = ?", (pid,)).fetchone() is None:
                return _err("게시물을 찾을 수 없습니다.", 404)
            conn.execute("DELETE FROM mn_posts WHERE id = ?", (pid,))
            sync_file_scopes(conn)
        return {"ok": True}

    # ── 공개 조회 (인증 없음) ──
    @r.get("/public/posts")
    def public_posts(board: str = Query("disclosure"), year: str = Query("")):
        if board not in BOARDS:
            return _err("board 는 disclosure 또는 performance 입니다.")
        sql = "SELECT * FROM mn_posts WHERE status = 'published' AND board = ?"
        args = [board]
        if year:
            sql += " AND year = ?"; args.append(_int(year))
        sql += " ORDER BY COALESCE(year, 0) DESC, COALESCE(period,'') DESC, published_at DESC"
        with db() as conn:
            rows = [post_row(x, public=True) for x in conn.execute(sql, args).fetchall()]
            years = [row[0] for row in conn.execute(
                "SELECT DISTINCT year FROM mn_posts WHERE status='published' AND board=? AND year IS NOT NULL ORDER BY year DESC",
                (board,)).fetchall()]
        return {"ok": True, "rows": rows, "years": years, "categories": DEFAULT_CATEGORIES[board]}

    @r.get("/public/posts/{pid}")
    def public_post(pid: str):
        with db() as conn:
            row = conn.execute("SELECT * FROM mn_posts WHERE id = ? AND status = 'published'", (pid,)).fetchone()
        if row is None:
            return _err("게시물을 찾을 수 없습니다.", 404)
        return {"ok": True, "row": post_row(row, public=True)}

    @r.get("/public/finance")
    def public_finance(year: str = Query("")):
        """운영진이 '공개'로 표시한 달만 수입·지출 합계를 내보낸다 (전표 개별 내용은 비공개)."""
        with db() as conn:
            years = [row[0] for row in conn.execute(
                "SELECT DISTINCT substr(month,1,4) FROM mn_months WHERE public = 1 ORDER BY 1 DESC").fetchall()]
            y = _int(year) or (int(years[0]) if years else datetime.now().year)
            pub = {row["month"]: dict(row) for row in conn.execute(
                "SELECT month, note FROM mn_months WHERE public = 1 AND month LIKE ?", (f"{y:04d}-%",)).fetchall()}
            months = []
            if pub:
                totals = {}
                for row in conn.execute(
                    "SELECT month, kind, SUM(amount) AS total FROM mn_ledger WHERE month LIKE ? GROUP BY month, kind",
                    (f"{y:04d}-%",)
                ).fetchall():
                    totals.setdefault(row["month"], {"income": 0, "expense": 0})[row["kind"]] = row["total"] or 0
                for m in sorted(pub):
                    t = totals.get(m, {"income": 0, "expense": 0})
                    months.append({"month": m, "income": t["income"], "expense": t["expense"],
                                   "net": t["income"] - t["expense"], "note": pub[m].get("note") or ""})
        total_income = sum(m["income"] for m in months)
        total_expense = sum(m["expense"] for m in months)
        return {"ok": True, "year": y, "years": years, "months": months,
                "total": {"income": total_income, "expense": total_expense, "net": total_income - total_expense}}

    @r.get("/public/meetings")
    def public_meetings(year: str = Query("")):
        """공개로 표시한 회의의 결과만(제목·일자·종류·결정사항·첨부). 회의 본문은 내보내지 않는다."""
        sql, args = "SELECT * FROM mn_meetings WHERE published = 1", []
        if year:
            sql += " AND date LIKE ?"; args.append(f"{_int(year):04d}-%")
        sql += " ORDER BY date DESC"
        with db() as conn:
            rows = []
            for x in conn.execute(sql, args).fetchall():
                rows.append({"id": x["id"], "date": x["date"], "kind": x["kind"], "title": x["title"],
                             "agenda": x["agenda"] or "", "decisions": x["decisions"] or "",
                             "attachments": _json_list(x["attachments"])})
            years = [row[0] for row in conn.execute(
                "SELECT DISTINCT substr(date,1,4) FROM mn_meetings WHERE published = 1 ORDER BY 1 DESC").fetchall()]
        return {"ok": True, "rows": rows, "years": years}

    app.include_router(r)
    return r


# ───────────────── 로컬 개발용 단독 실행 ─────────────────

def standalone_app() -> FastAPI:
    """app.py 없이 이 모듈만 띄운다. 인증은 SAKYOWON_ADMIN_KEY 하나(세션 없음)."""
    import time
    from contextlib import contextmanager
    from fastapi.middleware.cors import CORSMiddleware

    db_path = os.environ.get("SAKYOWON_DB", os.path.join(os.path.dirname(__file__), "data", "dev.db"))
    admin_key = os.environ.get("SAKYOWON_ADMIN_KEY", "")
    origins = [o.strip() for o in os.environ.get("SAKYOWON_ALLOW_ORIGINS", "").split(",") if o.strip()]

    @contextmanager
    def db():
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        conn = sqlite3.connect(db_path, timeout=20)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA journal_mode=WAL")
            yield conn
            conn.commit()
        finally:
            conn.close()

    def s(v):
        return "" if v is None else str(v).strip()

    def now_iso():
        return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

    def new_id(prefix):
        return prefix + "-" + datetime.now().strftime("%y%m%d-%H%M%S") + "-" + str(int(time.time() * 1000) % 1000).zfill(3)

    def admin_ok(request, key=""):
        return bool(admin_key) and s(key) == admin_key

    def current_user(request):
        return None

    app = FastAPI(title="망남 운영 백엔드 (단독 개발용)", docs_url=None, redoc_url=None)
    if origins:
        app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
                           allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
                           allow_headers=["Content-Type", "X-Admin-Key"])

    @app.get("/api/health")
    def health():
        return {"ok": True, "service": "망남 단독 개발 서버", "time": now_iso()}

    @app.get("/api/auth/me")
    def auth_me():
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    install(app, db=db, admin_ok=admin_ok, current_user=current_user, now_iso=now_iso,
            new_id=new_id, s=s, db_path=db_path)
    return app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(standalone_app(), host="127.0.0.1", port=int(os.environ.get("PORT", "8787")))
