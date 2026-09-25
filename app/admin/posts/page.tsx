"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminShell, { ComboInput, Field, inputCls, Notice, useAdmin } from "../AdminShell";
import { api, FileRef, fileSize, fileUrl, fmtDate, Metric, Post, uploadFile } from "../../lib/api";

type Board = "disclosure" | "performance";
const BOARD_LABEL: Record<Board, string> = { disclosure: "경영공시", performance: "실적 자료" };
const BOARD_PATH: Record<Board, string> = { disclosure: "/disclosure", performance: "/performance" };

type Draft = {
  id?: string;
  board: Board;
  category: string;
  year: string;
  period: string;
  title: string;
  summary: string;
  body: string;
  metrics: Metric[];
  attachments: FileRef[];
  status: "draft" | "published";
};

const empty = (board: Board): Draft => ({
  board, category: "", year: String(new Date().getFullYear()), period: "", title: "", summary: "", body: "",
  metrics: board === "performance" ? [{ label: "", value: "", unit: "" }] : [], attachments: [], status: "draft",
});

function Posts() {
  const { categories } = useAdmin();
  const [board, setBoard] = useState<Board>("disclosure");
  const [rows, setRows] = useState<Post[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ rows: Post[] }>("/posts", { admin: true, params: { board } });
      setRows(r.rows);
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "불러오기에 실패했습니다." });
    }
  }, [board]);

  useEffect(() => {
    load();
    setDraft(null);
  }, [load]);

  const save = async (status?: "draft" | "published") => {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    try {
      const body = { ...draft, status: status ?? draft.status, metrics: draft.metrics.filter((m) => m.label.trim()) };
      await api("/posts", { admin: true, body });
      setMsg({ kind: "ok", text: body.status === "published" ? "사이트에 게시했습니다." : "초안으로 저장했습니다." });
      setDraft(null);
      load();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (p: Post) => {
    const next = p.status === "published" ? "draft" : "published";
    if (next === "draft" && !window.confirm(`"${p.title}" 게시를 내릴까요? 사이트에서 사라지고 초안으로 남습니다.`)) return;
    try {
      await api("/posts", { admin: true, body: { ...p, status: next } });
      load();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "처리에 실패했습니다." });
    }
  };

  const remove = async (p: Post) => {
    if (!window.confirm(`삭제할까요?\n${p.title}`)) return;
    try {
      await api(`/posts/${encodeURIComponent(p.id)}`, { admin: true, method: "DELETE" });
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

  const edit = (p: Post) => {
    setDraft({
      id: p.id, board: p.board, category: p.category, year: p.year ? String(p.year) : "", period: p.period,
      title: p.title, summary: p.summary, body: p.body,
      metrics: p.metrics.length ? p.metrics : p.board === "performance" ? [{ label: "", value: "", unit: "" }] : [],
      attachments: p.attachments, status: p.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setMetric = (i: number, patch: Partial<Metric>) => {
    if (!draft) return;
    const metrics = draft.metrics.map((m, j) => (j === i ? { ...m, ...patch } : m));
    setDraft({ ...draft, metrics });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(BOARD_LABEL) as Board[]).map((b) => (
          <button key={b} type="button" onClick={() => setBoard(b)} className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${board === b ? "bg-sea-600 text-white ring-sea-600" : "bg-white text-sea-700 ring-sea-200"}`}>
            {BOARD_LABEL[b]}
          </button>
        ))}
        <Link href={BOARD_PATH[board]} target="_blank" className="text-sm text-sea-600 underline hover:text-sea-900">
          사이트에서 보기 ↗
        </Link>
        {!draft && (
          <button type="button" onClick={() => setDraft(empty(board))} className="btn-primary ml-auto">
            + 새 {BOARD_LABEL[board]} 글
          </button>
        )}
      </div>

      {board === "disclosure" && !draft && (
        <Notice kind="info">
          협동조합기본법이 정한 경영공시 항목(정관·규약, 총회·이사회 활동, 사업결산보고, 사업결과보고)을 분류별로 올리면 사이트 경영공시 페이지에 정리돼 보입니다.
          회의 결과는 회의록에서 &quot;공개&quot;로 표시하면 자동으로 함께 나갑니다.
        </Notice>
      )}
      {board === "performance" && !draft && (
        <Notice kind="info">
          실적 지표(예: 식당 이용 인원, 매출, 참여자 수)를 항목으로 넣으면 사이트 실적 페이지에 숫자 카드로 보입니다.
          월별 회계에서 &quot;공개&quot;로 표시한 달의 수입·지출 합계도 같은 페이지에 자동으로 나갑니다.
        </Notice>
      )}

      {draft && (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sea-800">{draft.id ? "글 수정" : `새 ${BOARD_LABEL[draft.board]} 글`}</h2>
            <button type="button" onClick={() => setDraft(null)} className="text-sm text-sea-600 underline">취소</button>
          </div>
          <fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="분류">
              <ComboInput listId="post-cat" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={categories[draft.board]} placeholder="선택 또는 입력" />
            </Field>
            <Field label="연도">
              <input inputMode="numeric" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value.replace(/\D/g, "").slice(0, 4) })} className={inputCls} />
            </Field>
            <Field label="기간 표시" hint="예: 2026-08, 2026 상반기, 2025 회계연도">
              <input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} className={inputCls} />
            </Field>
            <div className="hidden lg:block" />
            <Field label="제목" className="sm:col-span-2 lg:col-span-4">
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} />
            </Field>
            <Field label="요약 (목록에 보이는 한두 줄)" className="sm:col-span-2 lg:col-span-4">
              <input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} className={inputCls} />
            </Field>
            <Field label="본문" className="sm:col-span-2 lg:col-span-4" hint="줄바꿈 그대로 표시됩니다. '- ' 로 시작하는 줄은 목록으로 보입니다.">
              <textarea rows={10} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className={inputCls} />
            </Field>

            <div className="sm:col-span-2 lg:col-span-4">
              <span className="text-sm font-medium text-sea-800">실적 지표 {draft.board === "disclosure" && <span className="font-normal text-sea-500">(선택)</span>}</span>
              <div className="mt-2 space-y-2">
                {draft.metrics.map((m, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_8rem_6rem_1fr_auto]">
                    <input value={m.label} onChange={(e) => setMetric(i, { label: e.target.value })} placeholder="지표 이름 (예: 식당 이용 인원)" className={inputCls.replace("mt-1 ", "")} />
                    <input value={m.value} onChange={(e) => setMetric(i, { value: e.target.value })} placeholder="값" className={`${inputCls.replace("mt-1 ", "")} text-right`} />
                    <input value={m.unit} onChange={(e) => setMetric(i, { unit: e.target.value })} placeholder="단위" className={inputCls.replace("mt-1 ", "")} />
                    <input value={m.note ?? ""} onChange={(e) => setMetric(i, { note: e.target.value })} placeholder="비고 (예: 전월 대비 +12%)" className={inputCls.replace("mt-1 ", "")} />
                    <button type="button" onClick={() => setDraft({ ...draft, metrics: draft.metrics.filter((_, j) => j !== i) })} className="px-2 text-red-500">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setDraft({ ...draft, metrics: [...draft.metrics, { label: "", value: "", unit: "" }] })} className="btn-outline px-3 py-1.5 text-xs">
                  + 지표 추가
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <span className="text-sm font-medium text-sea-800">첨부 파일 (게시하면 누구나 내려받을 수 있습니다)</span>
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
          </fieldset>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => save("draft")} disabled={busy || uploading} className="btn-outline disabled:opacity-60">
              초안 저장
            </button>
            <button type="button" onClick={() => save("published")} disabled={busy || uploading} className="btn-primary disabled:opacity-60">
              {busy ? "저장 중…" : "사이트에 게시"}
            </button>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </div>
        </form>
      )}

      {!draft && msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      <div className="overflow-x-auto rounded-xl ring-1 ring-sea-100">
        <table className="w-full min-w-[44rem] bg-white text-sm">
          <thead className="bg-sea-50 text-left text-xs uppercase tracking-wide text-sea-500">
            <tr>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">분류</th>
              <th className="px-4 py-3 font-semibold">기간</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">게시일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sea-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sea-600">아직 글이 없습니다.</td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-sea-50 text-sea-600"}`}>
                    {p.status === "published" ? "게시 중" : "초안"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sea-700">{p.category || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sea-700">{p.period || p.year || "—"}</td>
                <td className="px-4 py-3 text-sea-900">
                  {p.title}
                  <span className="block text-xs text-sea-500">
                    {p.metrics.length > 0 && `지표 ${p.metrics.length} · `}
                    {p.attachments.length > 0 && `첨부 ${p.attachments.length} · `}
                    수정 {fmtDate(p.updated_at)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sea-600">{fmtDate(p.published_at) || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-xs">
                  <button type="button" onClick={() => toggle(p)} className="font-medium text-sea-600 hover:text-sea-900">
                    {p.status === "published" ? "게시 내림" : "게시"}
                  </button>
                  <button type="button" onClick={() => edit(p)} className="ml-2 text-sea-600 hover:text-sea-900">수정</button>
                  <button type="button" onClick={() => remove(p)} className="ml-2 text-red-500 hover:text-red-700">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <AdminShell title="공시·실적 게시" sub="경영공시 자료와 실적 자료를 작성해 사이트에 올리고 내립니다.">
      <Posts />
    </AdminShell>
  );
}
