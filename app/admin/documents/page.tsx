"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell, { ComboInput, Field, inputCls, Notice, useAdmin } from "../AdminShell";
import { api, Doc, fileSize, fileUrl, fmtDate, uploadFile } from "../../lib/api";

type Draft = {
  id?: string;
  title: string;
  category: string;
  doc_date: string;
  description: string;
  tags: string;
  url: string;
  file_id: string;
  file_name: string;
};

const empty = (): Draft => ({
  title: "", category: "정관·규약", doc_date: "", description: "", tags: "", url: "", file_id: "", file_name: "",
});

function Documents() {
  const { categories } = useAdmin();
  const [rows, setRows] = useState<Doc[]>([]);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ rows: Doc[] }>("/documents", { admin: true, params: { category, q } });
      setRows(r.rows);
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "불러오기에 실패했습니다." });
    }
  }, [category, q]);

  useEffect(() => {
    load();
  }, [load]);

  const pick = async (files: FileList | null) => {
    if (!draft || !files?.length) return;
    setUploading(true);
    try {
      const f = await uploadFile(files[0]);
      setDraft({ ...draft, file_id: f.file_id, file_name: f.name, title: draft.title || f.name.replace(/\.[^.]+$/, "") });
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "올리기에 실패했습니다." });
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.file_id && !draft.url) {
      setMsg({ kind: "error", text: "파일을 올리거나 링크 주소를 넣어 주세요." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await api("/documents", { admin: true, body: draft });
      setMsg({ kind: "ok", text: "문서를 보관했습니다." });
      setDraft(null);
      load();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (d: Doc) => {
    if (!window.confirm(`문서를 삭제할까요? 첨부 파일도 함께 지워집니다.\n${d.title}`)) return;
    try {
      await api(`/documents/${encodeURIComponent(d.id)}`, { admin: true, method: "DELETE" });
      load();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "삭제에 실패했습니다." });
    }
  };

  const grouped = rows.reduce<Record<string, Doc[]>>((acc, d) => {
    (acc[d.category || "기타"] ??= []).push(d);
    return acc;
  }, {});
  const order = [...categories.document, ...Object.keys(grouped).filter((c) => !categories.document.includes(c))];

  return (
    <div className="space-y-8">
      {!draft ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setDraft(empty())} className="btn-primary">
            + 문서 보관
          </button>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-sea-200 px-3 py-2 text-sm">
            <option value="">모든 분류</option>
            {categories.document.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목·설명·태그 검색" className="w-full max-w-xs rounded-md border border-sea-200 px-3 py-2 text-sm" />
          <span className="text-sm text-sea-600">{rows.length}건</span>
        </div>
      ) : (
        <form onSubmit={save} className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sea-800">{draft.id ? "문서 정보 수정" : "문서 보관"}</h2>
            <button type="button" onClick={() => setDraft(null)} className="text-sm text-sea-600 underline">취소</button>
          </div>
          <fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className="text-sm font-medium text-sea-800">파일</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <input type="file" onChange={(e) => pick(e.target.files)} className="text-sm" />
                {uploading && <span className="text-xs text-sea-600">올리는 중…</span>}
                {draft.file_id && (
                  <span className="rounded-full bg-sea-50 px-3 py-1 text-xs text-sea-700 ring-1 ring-sea-100">
                    📎 {draft.file_name}
                    <button type="button" onClick={() => setDraft({ ...draft, file_id: "", file_name: "" })} className="ml-2 text-red-500">✕</button>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-sea-500">PDF·한글·엑셀·이미지 등 20MB 까지. 파일 대신 아래 링크만 남겨도 됩니다.</p>
            </div>
            <Field label="제목" className="sm:col-span-2">
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} />
            </Field>
            <Field label="분류">
              <ComboInput listId="doc-cat" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={categories.document} />
            </Field>
            <Field label="문서 일자 (작성·발급일)">
              <input type="date" value={draft.doc_date} onChange={(e) => setDraft({ ...draft, doc_date: e.target.value })} className={inputCls} />
            </Field>
            <Field label="링크 (구글드라이브 등 외부 보관처)" className="sm:col-span-2">
              <input type="url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className={inputCls} placeholder="https://" />
            </Field>
            <Field label="설명" className="sm:col-span-2">
              <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputCls} />
            </Field>
            <Field label="태그" hint="쉼표로 구분" className="sm:col-span-2">
              <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className={inputCls} placeholder="설립, 2026, 완도군" />
            </Field>
          </fieldset>
          <div className="mt-4 flex items-center gap-3">
            <button type="submit" disabled={busy || uploading} className="btn-primary disabled:opacity-60">
              {busy ? "저장 중…" : "보관"}
            </button>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </div>
        </form>
      )}

      {!draft && msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      {rows.length === 0 ? (
        <p className="card text-sm text-sea-600">보관된 문서가 없습니다.</p>
      ) : (
        order.filter((c) => grouped[c]?.length).map((c) => (
          <div key={c}>
            <h2 className="font-bold text-sea-800">
              {c} <span className="text-sm font-normal text-sea-500">{grouped[c].length}건</span>
            </h2>
            <ul className="mt-2 divide-y divide-sea-100 rounded-xl bg-white ring-1 ring-sea-100">
              {grouped[c].map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className="text-lg">{d.file ? "📄" : "🔗"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sea-900">
                      {d.file ? (
                        <a href={fileUrl(d.file.id, true)} className="hover:underline">{d.title}</a>
                      ) : d.url ? (
                        <a href={d.url} target="_blank" rel="noopener" className="hover:underline">{d.title} ↗</a>
                      ) : (
                        d.title
                      )}
                    </p>
                    <p className="text-xs text-sea-500">
                      {d.doc_date && <span>{fmtDate(d.doc_date)} · </span>}
                      {d.file && <span>{d.file.name} ({fileSize(d.file.size)}) · </span>}
                      {d.tags && <span>#{d.tags.split(",").map((t) => t.trim()).filter(Boolean).join(" #")} · </span>}
                      <span>보관 {fmtDate(d.created_at)}</span>
                    </p>
                    {d.description && <p className="mt-1 text-xs text-sea-700">{d.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs">
                    <button type="button" onClick={() => setDraft({ id: d.id, title: d.title, category: d.category, doc_date: d.doc_date, description: d.description, tags: d.tags, url: d.url, file_id: d.file_id ?? "", file_name: d.file?.name ?? "" })} className="text-sea-600 hover:text-sea-900">수정</button>
                    <button type="button" onClick={() => remove(d)} className="text-red-500 hover:text-red-700">삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <AdminShell title="문서 보관" sub="정관·등기·계약서·보고서 등 조합의 주요 문서를 분류해 보관합니다. 운영진만 볼 수 있습니다.">
      <Documents />
    </AdminShell>
  );
}
