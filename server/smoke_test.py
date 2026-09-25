"""망남 운영 API 스모크 테스트.

로컬 단독 서버에 대고 전 엔드포인트를 훑는다 (빈 DB 로 시작할 것):
    SAKYOWON_ADMIN_KEY=devkey SAKYOWON_DB=/tmp/mn-smoke.db python server/mangnam_api.py &
    python -X utf8 server/smoke_test.py
"""
import base64, json, sys, urllib.request, urllib.error, urllib.parse

BASE = "http://127.0.0.1:8787/api/mangnam"
KEY = "devkey"
fails = []


def call(method, path, body=None, key=KEY, expect=200):
    if "?" in path:
        p0, qs = path.split("?", 1)
        path = p0 + "?" + urllib.parse.quote(qs, safe="=&")
    url = f"{BASE}{path}"
    if key:
        url += ("&" if "?" in url else "?") + f"key={key}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            status, raw = r.status, r.read()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read()
    try:
        out = json.loads(raw)
    except Exception:
        out = raw
    mark = "OK " if status == expect else "!! "
    if status != expect:
        fails.append((method, path, status, out if isinstance(out, dict) else "(binary)"))
    print(f"{mark}{method} {path} -> {status}")
    return out


# 인증
call("GET", "/me", key="", expect=401)
call("GET", "/me")

# 회계
led = call("POST", "/ledger", {"date": "2026-08-03", "kind": "income", "category": "사업수입", "business": "마을식당·편의점", "description": "8월 식당 매출", "amount": "1,250,000", "method": "카드"})
led2 = call("POST", "/ledger", {"date": "2026-08-10", "kind": "expense", "category": "재료비", "business": "마을식당·편의점", "description": "식자재", "amount": 480000, "counterparty": "완도농협"})
call("POST", "/ledger", {"date": "2026-08-99", "kind": "expense", "description": "x", "amount": 1}, expect=400)
call("POST", "/ledger", {"date": "2026-08-11", "kind": "expense", "description": "", "amount": 1}, expect=400)
call("POST", "/ledger", {"id": led["id"], "date": "2026-08-03", "kind": "income", "category": "사업수입", "description": "8월 식당 매출(수정)", "amount": 1300000})
rows = call("GET", "/ledger?month=2026-08")
assert len(rows["rows"]) == 2 and rows["rows"][0]["amount"] in (1300000, 480000), rows
summ = call("GET", "/ledger/summary?year=2026")
aug = [m for m in summ["months"] if m["month"] == "2026-08"][0]
assert aug["income"] == 1300000 and aug["expense"] == 480000 and aug["net"] == 820000, aug
call("POST", "/ledger/months/2026-08", {"status": "closed", "public": True, "note": "8월 마감"})
call("POST", "/ledger", {"date": "2026-08-20", "kind": "expense", "description": "마감후", "amount": 1}, expect=409)
call("DELETE", f"/ledger/{led2['id']}", expect=409)
call("POST", "/ledger/months/2026-08", {"status": "open"})
call("DELETE", f"/ledger/{led2['id']}")
call("POST", "/ledger/months/2026-08", {"status": "closed"})
pub = call("GET", "/public/finance?year=2026", key="")
assert pub["months"] and pub["months"][0]["income"] == 1300000 and "note" in pub["months"][0], pub
csv_req = urllib.request.urlopen(f"{BASE}/ledger.csv?year=2026&key={KEY}")
csv_txt = csv_req.read().decode("utf-8-sig")
assert "8월 식당 매출(수정)" in csv_txt, csv_txt[:200]
print("OK  ledger.csv has rows")

# 파일 + 문서
b64 = base64.b64encode(b"%PDF-1.4 test").decode()
f = call("POST", "/files", {"name": "정관 2026.pdf", "mime": "application/pdf", "data": "data:application/pdf;base64," + b64})
call("GET", f"/files/{f['id']}", key="", expect=401)  # 비공개 파일은 관리자만
raw = urllib.request.urlopen(f"{BASE}/files/{f['id']}?key={KEY}").read()
assert raw == b"%PDF-1.4 test", raw
print("OK  file download (admin)")
doc = call("POST", "/documents", {"title": "정관", "category": "정관·규약", "doc_date": "2026-01-15", "file_id": f["id"], "tags": "정관,설립"})
docs = call("GET", "/documents?q=정관")
assert docs["rows"] and docs["rows"][0]["file"]["name"] == "정관 2026.pdf", docs
call("DELETE", f"/files/{f['id']}", expect=409)  # 문서가 쓰는 파일
link = call("POST", "/documents", {"title": "사업자등록증(드라이브)", "category": "등기·인허가", "url": "https://drive.google.com/x"})

# 회의록
mtg = call("POST", "/meetings", {"date": "2026-09-10", "kind": "이사회", "title": "제3차 이사회", "attendees": "김일영, 홍길동", "agenda": "1. 마을식당 운영", "decisions": "운영시간 연장 가결", "published": True, "attachments": [{"file_id": f["id"], "name": "정관"}]})
call("GET", "/meetings?q=이사회")
pm = call("GET", "/public/meetings", key="")
assert pm["rows"][0]["title"] == "제3차 이사회" and "content" not in pm["rows"][0], pm
# 공개 회의록 첨부는 누구나 내려받기
raw = urllib.request.urlopen(f"{BASE}/files/{f['id']}").read()
assert raw == b"%PDF-1.4 test"
print("OK  file download (public via published meeting)")

# 게시물
post = call("POST", "/posts", {"board": "disclosure", "category": "사업결산보고", "year": 2025, "period": "2025", "title": "2025년 결산보고", "summary": "요약", "body": "본문", "status": "draft"})
call("GET", "/public/posts?board=disclosure", key="")
pubposts = call("GET", "/public/posts?board=disclosure", key="")
assert not pubposts["rows"], pubposts
call("POST", "/posts", {"id": post["id"], "board": "disclosure", "category": "사업결산보고", "year": 2025, "period": "2025", "title": "2025년 결산보고", "status": "published", "attachments": [{"file_id": f["id"]}]})
pubposts = call("GET", "/public/posts?board=disclosure", key="")
assert pubposts["rows"][0]["published_at"] and "created_by" not in pubposts["rows"][0], pubposts
call("GET", f"/public/posts/{post['id']}", key="")
perf = call("POST", "/posts", {"board": "performance", "category": "월간 실적", "year": 2026, "period": "2026-08", "title": "2026년 8월 실적", "metrics": [{"label": "식당 이용", "value": "1,240", "unit": "명"}, {"label": "", "value": "x"}], "status": "published"})
pp = call("GET", "/public/posts?board=performance", key="")
assert len(pp["rows"][0]["metrics"]) == 1, pp
call("POST", "/posts", {"board": "nope", "title": "x"}, expect=400)
call("DELETE", f"/posts/{post['id']}")
call("DELETE", f"/meetings/{mtg['id']}")
call("GET", f"/files/{f['id']}", key="", expect=401)  # 게시 해제 후 다시 비공개
call("DELETE", f"/documents/{doc['id']}")
call("GET", f"/files/{f['id']}", key=KEY, expect=404)  # 문서 삭제 시 파일도 삭제
call("DELETE", f"/documents/{link['id']}")
call("DELETE", f"/posts/{perf['id']}")

print()
if fails:
    print("FAILED:", *fails, sep="\n  ")
    sys.exit(1)
print("ALL OK")
