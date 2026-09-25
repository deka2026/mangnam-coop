"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell, { ComboInput, Field, inputCls, Notice, useAdmin } from "../AdminShell";
import {
  api, ApiError, getKey, LedgerRow, LedgerSummary, MN, MonthInfo, monthLabel, thisMonth, today, won,
} from "../../lib/api";

const METHODS = ["계좌이체", "현금", "카드", "자동이체", "기타"];

type Draft = {
  id?: string;
  date: string;
  kind: "income" | "expense";
  category: string;
  business: string;
  description: string;
  amount: string;
  counterparty: string;
  method: string;
  evidence: string;
  memo: string;
};

const emptyDraft = (month: string): Draft => ({
  date: month === thisMonth() ? today() : `${month}-01`,
  kind: "expense",
  category: "",
  business: "공통",
  description: "",
  amount: "",
  counterparty: "",
  method: "계좌이체",
  evidence: "",
  memo: "",
});

function Ledger() {
  const { categories } = useAdmin();
  const [month, setMonth] = useState(thisMonth());
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [info, setInfo] = useState<MonthInfo | null>(null);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft(thisMonth()));
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [noteDraft, setNoteDraft] = useState("");

  const year = month.slice(0, 4);
  const closed = info?.status === "closed";

  const load = useCallback(async (m: string) => {
    try {
      const [l, s] = await Promise.all([
        api<{ rows: LedgerRow[]; month: MonthInfo }>("/ledger", { admin: true, params: { month: m } }),
        api<LedgerSummary>("/ledger/summary", { admin: true, params: { year: m.slice(0, 4) } }),
      ]);
      setRows(l.rows);
      setInfo(l.month);
      setNoteDraft(l.month?.note ?? "");
      setSummary(s);
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "불러오기에 실패했습니다." });
    }
  }, []);

  useEffect(() => {
    load(month);
    setDraft(emptyDraft(month));
    setEditing(false);
  }, [month, load]);

  const totals = useMemo(() => {
    const income = rows.filter((r) => r.kind === "income").reduce((a, r) => a + r.amount, 0);
    const expense = rows.filter((r) => r.kind === "expense").reduce((a, r) => a + r.amount, 0);
    return { income, expense, net: income - expense };
  }, [rows]);

  const visible = rows.filter((r) => filter === "all" || r.kind === filter);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/ledger", { admin: true, body: { ...draft, amount: draft.amount.replace(/,/g, "") } });
      setMsg({ kind: "ok", text: editing ? "전표를 수정했습니다." : "전표를 저장했습니다." });
      const keepMonth = draft.date.slice(0, 7);
      setDraft({ ...emptyDraft(keepMonth), date: draft.date, kind: draft.kind, business: draft.business });
      setEditing(false);
      if (keepMonth !== month) setMonth(keepMonth);
      else load(month);
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const edit = (r: LedgerRow) => {
    setDraft({
      id: r.id, date: r.date, kind: r.kind, category: r.category, business: r.business,
      description: r.description, amount: String(r.amount), counterparty: r.counterparty,
      method: r.method, evidence: r.evidence, memo: r.memo,
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (r: LedgerRow) => {
    if (!window.confirm(`삭제할까요?\n${r.date} ${r.description} ${won(r.amount)}`)) return;
    try {
      await api(`/ledger/${encodeURIComponent(r.id)}`, { admin: true, method: "DELETE" });
      load(month);
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "삭제에 실패했습니다." });
    }
  };

  const updateMonth = async (patch: Partial<{ status: "open" | "closed"; public: boolean; note: string }>) => {
    if (patch.status === "closed" && !window.confirm(`${monthLabel(month)}을 마감할까요?\n마감하면 전표를 고칠 수 없습니다(해제 가능).`)) return;
    try {
      const r = await api<{ month: MonthInfo }>(`/ledger/months/${month}`, { admin: true, body: patch });
      setInfo(r.month);
      setNoteDraft(r.month.note ?? "");
      load(month);
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "처리에 실패했습니다." });
    }
  };

  const csvUrl = (params: string) => {
    const key = getKey();
    return `${MN}/ledger.csv?${params}${key ? `&key=${encodeURIComponent(key)}` : ""}`;
  };

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="space-y-8">
      {/* 월 선택 + 마감 */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => shiftMonth(-1)} className="btn-outline px-3 py-1.5 text-sm">
            ‹ 이전 달
          </button>
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className="rounded-md border border-sea-200 px-3 py-1.5 text-sm" />
          <button type="button" onClick={() => shiftMonth(1)} className="btn-outline px-3 py-1.5 text-sm">
            다음 달 ›
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              closed ? "bg-earth-100 text-earth-800" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {closed ? "마감됨" : "입력 중"}
          </span>
          {info?.public ? (
            <span className="rounded-full bg-sea-100 px-3 py-1 text-xs font-semibold text-sea-700">사이트 공개</span>
          ) : null}
          <span className="ml-auto flex flex-wrap gap-2">
            <a href={csvUrl(`month=${month}`)} className="btn-outline px-3 py-1.5 text-sm">
              이 달 CSV
            </a>
            <a href={csvUrl(`year=${year}`)} className="btn-outline px-3 py-1.5 text-sm">
              {year}년 CSV
            </a>
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-sea-50 p-4">
            <p className="text-xs text-sea-600">수입</p>
            <p className="mt-1 text-xl font-bold text-sea-800">{won(totals.income)}</p>
          </div>
          <div className="rounded-xl bg-earth-50 p-4">
            <p className="text-xs text-sea-600">지출</p>
            <p className="mt-1 text-xl font-bold text-earth-800">{won(totals.expense)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-sea-100">
            <p className="text-xs text-sea-600">수지 (수입 − 지출)</p>
            <p className={`mt-1 text-xl font-bold ${totals.net < 0 ? "text-red-600" : "text-sea-800"}`}>{won(totals.net)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-sea-100 pt-4">
          <Field label="이 달 메모 (마감 소견·특이사항)" className="flex-1 min-w-[16rem]">
            <input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} onBlur={() => noteDraft !== (info?.note ?? "") && updateMonth({ note: noteDraft })} className={inputCls} placeholder="예: 마을식당 추석 매출 반영, 보조금 정산 완료" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-sea-800">
            <input type="checkbox" checked={!!info?.public} onChange={(e) => updateMonth({ public: e.target.checked })} />
            수입·지출 합계를 사이트 실적 페이지에 공개
          </label>
          {closed ? (
            <button type="button" onClick={() => updateMonth({ status: "open" })} className="btn-outline px-4 py-1.5 text-sm">
              마감 해제
            </button>
          ) : (
            <button type="button" onClick={() => updateMonth({ status: "closed" })} className="btn-primary px-4 py-1.5 text-sm">
              {monthLabel(month)} 마감
            </button>
          )}
        </div>
        {info?.closed_at && (
          <p className="mt-2 text-xs text-sea-500">
            {info.closed_by} 이(가) {info.closed_at.slice(0, 16).replace("T", " ")} 에 마감
          </p>
        )}
      </div>

      {/* 입력 폼 */}
      <form onSubmit={save} className={`card ${closed ? "opacity-60" : ""}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sea-800">{editing ? "전표 수정" : "전표 입력"}</h2>
          {editing && (
            <button type="button" onClick={() => { setDraft(emptyDraft(month)); setEditing(false); }} className="text-sm text-sea-600 underline">
              취소
            </button>
          )}
        </div>
        {closed && <p className="mt-2 text-xs text-earth-700">마감된 달입니다. 수정하려면 위에서 마감을 해제하세요.</p>}
        <fieldset disabled={closed || busy} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="일자">
            <input type="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} />
          </Field>
          <Field label="구분">
            <div className="mt-1 flex gap-2">
              {(["income", "expense"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDraft({ ...draft, kind: k, category: "" })}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ring-1 ${
                    draft.kind === k
                      ? k === "income" ? "bg-sea-600 text-white ring-sea-600" : "bg-earth-600 text-white ring-earth-600"
                      : "bg-white text-sea-700 ring-sea-200"
                  }`}
                >
                  {k === "income" ? "수입" : "지출"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="항목(계정과목)">
            <ComboInput listId="cat-list" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={categories[draft.kind]} placeholder="선택하거나 직접 입력" />
          </Field>
          <Field label="사업">
            <ComboInput listId="biz-list" value={draft.business} onChange={(v) => setDraft({ ...draft, business: v })} options={categories.business} />
          </Field>
          <Field label="적요(내용)" className="sm:col-span-2">
            <input required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputCls} placeholder="예: 9월 식자재 구입 (완도농협)" />
          </Field>
          <Field label="금액(원)">
            <input required inputMode="numeric" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/[^\d,]/g, "") })} className={`${inputCls} text-right`} placeholder="0" />
          </Field>
          <Field label="결제 방법">
            <ComboInput listId="method-list" value={draft.method} onChange={(v) => setDraft({ ...draft, method: v })} options={METHODS} />
          </Field>
          <Field label="거래처">
            <input value={draft.counterparty} onChange={(e) => setDraft({ ...draft, counterparty: e.target.value })} className={inputCls} />
          </Field>
          <Field label="증빙 (영수증·계산서 번호)">
            <input value={draft.evidence} onChange={(e) => setDraft({ ...draft, evidence: e.target.value })} className={inputCls} />
          </Field>
          <Field label="메모" className="sm:col-span-2">
            <input value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} className={inputCls} />
          </Field>
        </fieldset>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={closed || busy} className="btn-primary disabled:opacity-60">
            {busy ? "저장 중…" : editing ? "수정 저장" : "전표 저장"}
          </button>
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </div>
      </form>

      {/* 전표 목록 */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-bold text-sea-800">{monthLabel(month)} 전표 {rows.length}건</h2>
          <div className="ml-auto flex gap-1 text-sm">
            {([["all", "전체"], ["income", "수입"], ["expense", "지출"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-3 py-1 ring-1 ${filter === k ? "bg-sea-600 text-white ring-sea-600" : "bg-white text-sea-700 ring-sea-200"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-sea-100">
          <table className="w-full min-w-[52rem] bg-white text-sm">
            <thead className="bg-sea-50 text-left text-xs uppercase tracking-wide text-sea-500">
              <tr>
                <th className="px-3 py-3 font-semibold">일자</th>
                <th className="px-3 py-3 font-semibold">구분</th>
                <th className="px-3 py-3 font-semibold">항목</th>
                <th className="px-3 py-3 font-semibold">사업</th>
                <th className="px-3 py-3 font-semibold">적요</th>
                <th className="px-3 py-3 text-right font-semibold">금액</th>
                <th className="px-3 py-3 font-semibold">거래처·방법</th>
                <th className="px-3 py-3 font-semibold">증빙</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sea-100">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sea-600">전표가 없습니다.</td>
                </tr>
              )}
              {visible.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-sea-700">{r.date}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${r.kind === "income" ? "bg-sea-50 text-sea-700" : "bg-earth-50 text-earth-700"}`}>
                      {r.kind === "income" ? "수입" : "지출"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sea-700">{r.category || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-sea-700">{r.business || "—"}</td>
                  <td className="px-3 py-2 text-sea-900">
                    {r.description}
                    {r.memo && <span className="block text-xs text-sea-500">{r.memo}</span>}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${r.kind === "income" ? "text-sea-800" : "text-earth-800"}`}>
                    {won(r.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sea-700">
                    {r.counterparty || "—"}
                    <span className="block text-xs text-sea-500">{r.method}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-sea-600">{r.evidence || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                    {!closed && (
                      <>
                        <button type="button" onClick={() => edit(r)} className="font-medium text-sea-600 hover:text-sea-900">수정</button>
                        <button type="button" onClick={() => remove(r)} className="ml-2 text-red-500 hover:text-red-700">삭제</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 연간 집계 */}
      {summary && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="font-bold text-sea-800">{year}년 월별 수지</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-sea-500">
                <tr>
                  <th className="py-1.5">월</th>
                  <th className="py-1.5 text-right">수입</th>
                  <th className="py-1.5 text-right">지출</th>
                  <th className="py-1.5 text-right">수지</th>
                  <th className="py-1.5 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea-50">
                {summary.months.map((m) => (
                  <tr key={m.month} className={m.month === month ? "bg-sea-50/60" : ""}>
                    <td className="py-1.5">
                      <button type="button" onClick={() => setMonth(m.month)} className="text-sea-700 hover:text-sea-900 hover:underline">
                        {Number(m.month.slice(5))}월
                      </button>
                    </td>
                    <td className="py-1.5 text-right text-sea-800">{m.income ? won(m.income) : "—"}</td>
                    <td className="py-1.5 text-right text-earth-800">{m.expense ? won(m.expense) : "—"}</td>
                    <td className={`py-1.5 text-right font-medium ${m.net < 0 ? "text-red-600" : "text-sea-900"}`}>{m.count ? won(m.net) : "—"}</td>
                    <td className="py-1.5 text-center text-xs">
                      {m.status === "closed" ? <span className="text-earth-700">마감</span> : m.count ? <span className="text-emerald-700">입력중</span> : <span className="text-sea-300">·</span>}
                      {m.public ? <span className="ml-1 text-sea-600">공개</span> : null}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-sea-200 font-semibold">
                  <td className="py-2">합계</td>
                  <td className="py-2 text-right">{won(summary.total.income)}</td>
                  <td className="py-2 text-right">{won(summary.total.expense)}</td>
                  <td className={`py-2 text-right ${summary.total.net < 0 ? "text-red-600" : ""}`}>{won(summary.total.net)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="space-y-6">
            {(["income", "expense"] as const).map((k) => (
              <div key={k} className="card">
                <h2 className="font-bold text-sea-800">{year}년 {k === "income" ? "수입" : "지출"} 항목별</h2>
                {summary.categories[k].length === 0 ? (
                  <p className="mt-2 text-sm text-sea-600">아직 없습니다.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {summary.categories[k].map((c) => {
                      const max = summary.categories[k][0].total || 1;
                      return (
                        <li key={c.category} className="flex items-center gap-3 text-sm">
                          <span className="w-28 shrink-0 truncate text-sea-700">{c.category}</span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-sea-50">
                            <span className={`block h-full rounded-full ${k === "income" ? "bg-sea-500" : "bg-earth-400"}`} style={{ width: `${(c.total / max) * 100}%` }} />
                          </span>
                          <span className="w-28 shrink-0 text-right font-medium text-sea-800">{won(c.total)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LedgerPage() {
  return (
    <AdminShell title="월별 회계" sub="달마다 수입·지출 전표를 입력하고, 달이 끝나면 마감합니다. 공개로 표시한 달의 합계는 사이트 실적 페이지에 나타납니다.">
      <Ledger />
    </AdminShell>
  );
}

// ApiError 는 상태코드 분기가 필요할 때를 위해 재노출
export type { ApiError };
