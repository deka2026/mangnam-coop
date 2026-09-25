"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell, { Field, inputCls, Notice } from "../AdminShell";
import { api, FileRef, fileSize, fileUrl, fmtDate, Meeting, today, uploadFile } from "../../lib/api";

const KINDS = ["총회", "이사회", "운영회의", "분과회의", "기타"];

type Draft = Omit<Meeting, "id" | "created_at" | "updated_at" | "created_by" | "published"> & {
  id?: string;
  published: boolean;
};

const empty = (): Draft => ({
  date: today(), kind: "운영회의", title: "", place: "", chair: "", recorder: "", attendees: "",
  agenda: "", content: "", decisions: "", followups: "", attachments: [], published: false,
});

function Meetings() {
  const [rows, setRows] = useState<Meeting[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState("");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ rows: Meeting[]; years: string[] }>("/meetings", { admin: true, params: { year, kind, q } });
      setRows(r.rows);
      setYears(r.years);
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "불러오기에 실패했습니다." });
    }
  }, [year, kind, q]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    try {
      await api("/meetings", { admin: true, body: draft });
      setMsg({ kind: "ok", text: "회의록을 저장했습니다." });
      setDraft(null);
      load();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: Meeting) => {
    if (!window.confirm(`회의록을 삭제할까요?\n${m.date} ${m.title}`)) return;
    try {
      await api(`/meetings/${encodeURIComponent(m.id)}`, { admin: true, method: "DELETE" });
      load();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "삭제에 실패했습니다." });
    }
  };

  const attach = async (files: FileList | null) => {
    if (!draft || !files?.length) return;
    setUploading(true);
    try {
      const added: FileRef[] = [];
      for (const f of Array.from(files)) added.push(await uploadFile(f));
      setDraft({ ...draft, attachments: [...draft.attachments, ...added] });
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "첨부에 실패했습니다." });
    } finally {
      setUploading(false);
    }
  };

  const edit = (m: Meeting) => {
    setDraft({ ...m, published: !!m.published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {!draft ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setDraft(empty())} className="btn-primary">
            + 새 회의록
          </button>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-md border border-sea-200 px-3 py-2 text-sm">
            <option value="">전체 연도</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-md border border-sea-200 px-3 py-2 text-sm">
            <option value="">모든 종류</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목·안건·결정사항 검색" className="w-full max-w-xs rounded-md border border-sea-200 px-3 py-2 text-sm" />
          <span className="text-sm text-sea-600">{rows.length}건</span>
        </div>
      ) : (
        <form onSubmit={save} className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sea-800">{draft.id ? "회의록 수정" : "새 회의록"}</h2>
            <button type="button" onClick={() => setDraft(null)} className="text-sm text-sea-600 underline">
              취소
            </button>
          </div>
          <fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="회의 일자">
              <input type="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} />
            </Field>
            <Field label="종류">
              <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className={inputCls}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="제목" className="sm:col-span-2">
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} placeholder="예: 2026년 제3차 이사회" />
            </Field>
            <Field label="장소">
              <input value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} className={inputCls} />
            </Field>
            <Field label="의장(진행)">
              <input value={draft.chair} onChange={(e) => setDraft({ ...draft, chair: e.target.value })} className={inputCls} />
            </Field>
            <Field label="기록자">
              <input value={draft.recorder} onChange={(e) => setDraft({ ...draft, recorder: e.target.value })} className={inputCls} />
            </Field>
            <Field label="참석자" hint="쉼표로 구분">
              <input value={draft.attendees} onChange={(e) => setDraft({ ...draft, attendees: e.target.value })} className={inputCls} placeholder="홍길동, 김철수, …" />
            </Field>
            <Field label="안건" className="sm:col-span-2 lg:col-span-4">
              <textarea rows={3} value={draft.agenda} onChange={(e) => setDraft({ ...draft, agenda: e.target.value })} className={inputCls} placeholder={"1. …\n2. …"} />
            </Field>
            <Field label="회의 내용 (논의 경과)" className="sm:col-span-2 lg:col-span-4">
              <textarea rows={8} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} className={inputCls} />
            </Field>
            <Field label="결정 사항" className="sm:col-span-2" hint="공개로 표시하면 이 부분과 안건·첨부만 사이트에 나갑니다.">
              <textarea rows={5} value={draft.decisions} onChange={(e) => setDraft({ ...draft, decisions: e.target.value })} className={inputCls} />
            </Field>
            <Field label="후속 조치 (담당·기한)" className="sm:col-span-2">
              <textarea rows={5} value={draft.followups} onChange={(e) => setDraft({ ...draft, followups: e.target.value })} className={inputCls} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-4">
              <span className="text-sm font-medium text-sea-800">첨부 (서명본 스캔, 자료 등)</span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input type="file" multiple onChange={(e) => attach(e.target.files)} className="text-sm" />
                {uploading && <span className="text-xs text-sea-600">올리는 중…</span>}
              </div>
              {draft.attachments.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                  {draft.attachments.map((a) => (
                    <li key={a.file_id} className="flex items-center gap-1 rounded-full bg-sea-50 px-3 py-1 text-sea-700 ring-1 ring-sea-100">
                      <a href={fileUrl(a.file_id, true)} className="hover:underline">{a.name}</a>
                      <span className="text-sea-400">{fileSize(a.size)}</span>
                      <button type="button" onClick={() => setDraft({ ...draft, attachments: draft.attachments.filter((x) => x.file_id !== a.file_id) })} className="ml-1 text-red-500">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-sea-800 sm:col-span-2 lg:col-span-4">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              회의 결과(일자·제목·안건·결정사항·첨부)를 경영공시 페이지에 공개
            </label>
          </fieldset>
          <div className="mt-4 flex items-center gap-3">
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? "저장 중…" : "저장"}
            </button>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </div>
        </form>
      )}

      {!draft && msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      <ul className="space-y-3">
        {rows.length === 0 && <li className="card text-sm text-sea-600">기록된 회의가 없습니다.</li>}
        {rows.map((m) => (
          <li key={m.id} className="card">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded bg-sea-50 px-1.5 py-0.5 text-sea-600">{m.kind}</span>
                  <span className="text-sea-500">{fmtDate(m.date)}</span>
                  {m.place && <span className="text-sea-500">· {m.place}</span>}
                  {m.published ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">공개</span> : null}
                  {m.attachments.length > 0 && <span className="text-sea-500">📎 {m.attachments.length}</span>}
                </div>
                <h3 className="mt-1 font-bold text-sea-900">{m.title}</h3>
                {m.attendees && <p className="mt-1 text-xs text-sea-600">참석: {m.attendees}</p>}
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <button type="button" onClick={() => setOpenId(openId === m.id ? null : m.id)} className="text-sea-600 hover:text-sea-900">
                  {openId === m.id ? "접기" : "펼치기"}
                </button>
                <button type="button" onClick={() => edit(m)} className="text-sea-600 hover:text-sea-900">수정</button>
                <button type="button" onClick={() => remove(m)} className="text-red-500 hover:text-red-700">삭제</button>
              </div>
            </div>
            {openId === m.id && (
              <dl className="mt-4 grid gap-4 border-t border-sea-100 pt-4 text-sm sm:grid-cols-2">
                {[
                  ["안건", m.agenda], ["회의 내용", m.content], ["결정 사항", m.decisions], ["후속 조치", m.followups],
                ].map(([k, v]) => (
                  <div key={k} className={k === "회의 내용" ? "sm:col-span-2" : ""}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">{k}</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sea-800">{v || "—"}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">의장 · 기록</dt>
                  <dd className="mt-1 text-sea-800">{m.chair || "—"} · {m.recorder || "—"}</dd>
                </div>
                {m.attachments.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">첨부</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {m.attachments.map((a) => (
                        <a key={a.file_id} href={fileUrl(a.file_id, true)} className="rounded-full bg-sea-50 px-3 py-1 text-xs text-sea-700 ring-1 ring-sea-100 hover:bg-sea-100">
                          📎 {a.name}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <AdminShell title="회의록" sub="총회·이사회·운영회의의 안건, 논의 내용, 결정 사항을 기록하고 보관합니다.">
      <Meetings />
    </AdminShell>
  );
}
