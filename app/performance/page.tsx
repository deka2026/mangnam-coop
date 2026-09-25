"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError, fmtDate, monthLabel, Post, PublicFinance, won } from "../lib/api";
import { Attachments, Body } from "../components/PostView";

function FinanceChart({ data }: { data: PublicFinance }) {
  const max = Math.max(1, ...data.months.map((m) => Math.max(m.income, m.expense)));
  return (
    <div className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-sea-800">{data.year}년 월별 수입·지출</h2>
        <p className="text-xs text-sea-500">운영진이 공개로 표시한 달만 보입니다 · 단위: 원</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-sea-50 p-4">
          <p className="text-xs text-sea-600">수입 합계</p>
          <p className="mt-1 text-xl font-bold text-sea-800">{won(data.total.income)}</p>
        </div>
        <div className="rounded-xl bg-earth-50 p-4">
          <p className="text-xs text-sea-600">지출 합계</p>
          <p className="mt-1 text-xl font-bold text-earth-800">{won(data.total.expense)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-sea-100">
          <p className="text-xs text-sea-600">수지</p>
          <p className={`mt-1 text-xl font-bold ${data.total.net < 0 ? "text-red-600" : "text-sea-800"}`}>{won(data.total.net)}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {data.months.map((m) => (
          <li key={m.month} className="text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-sea-800">{monthLabel(m.month)}</span>
              <span className={`text-xs ${m.net < 0 ? "text-red-600" : "text-sea-600"}`}>수지 {won(m.net)}</span>
            </div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-xs text-sea-500">수입</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sea-50">
                  <span className="block h-full rounded-full bg-sea-500" style={{ width: `${(m.income / max) * 100}%` }} />
                </span>
                <span className="w-28 shrink-0 text-right text-xs text-sea-800">{won(m.income)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-xs text-sea-500">지출</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-earth-50">
                  <span className="block h-full rounded-full bg-earth-400" style={{ width: `${(m.expense / max) * 100}%` }} />
                </span>
                <span className="w-28 shrink-0 text-right text-xs text-earth-800">{won(m.expense)}</span>
              </div>
            </div>
            {m.note && <p className="mt-1 text-xs text-sea-500">{m.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PerformancePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [finance, setFinance] = useState<PublicFinance | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<{ rows: Post[]; years: (number | string)[] }>("/public/posts", { params: { board: "performance" } }),
      api<PublicFinance>("/public/finance"),
    ])
      .then(([p, f]) => {
        setPosts(p.rows);
        setFinance(f.months.length ? f : null);
        const ys = Array.from(new Set([...p.years.map(String), ...f.years])).sort().reverse();
        setYears(ys);
      })
      .catch((e) => {
        setPosts([]);
        // 서버에 운영 모듈이 아직 없으면(404) 오류 대신 "자료 없음"으로 보여 준다
        if (e instanceof ApiError && e.status === 404) return;
        setError(e instanceof Error ? e.message : "자료를 불러오지 못했습니다.");
      });
  }, []);

  useEffect(() => {
    if (!year) return;
    api<PublicFinance>("/public/finance", { params: { year } })
      .then((f) => setFinance(f.months.length ? f : null))
      .catch(() => setFinance(null));
  }, [year]);

  const filtered = useMemo(
    () => (posts ?? []).filter((p) => !year || String(p.year ?? "") === year),
    [posts, year]
  );
  const latest = filtered.find((p) => p.metrics.length > 0);

  return (
    <>
      <section className="border-b border-sea-100 bg-gradient-to-b from-sea-50 to-white">
        <div className="container-page py-16">
          <p className="font-semibold text-sea-600">조합 운영</p>
          <h1 className="mt-2 section-title">사업 실적</h1>
          <p className="section-sub">
            마을식당·편의점, 별달물멍잠자리, 마을학교 등 망남마을협동조합 사업의 실적을 숫자로 보여 드립니다.
          </p>
          {years.length > 1 && (
            <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-6 rounded-md border border-sea-200 bg-white px-3 py-1.5 text-sm">
              <option value="">모든 연도</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          )}
        </div>
      </section>

      <section className="container-page space-y-10 py-12">
        {error && (
          <p className="rounded-md bg-earth-50 px-4 py-3 text-sm text-earth-800 ring-1 ring-earth-200">
            {error} — 잠시 뒤 다시 열어 주세요.
          </p>
        )}

        {latest && (
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl font-bold text-sea-800">{latest.title}</h2>
              <span className="text-xs text-sea-500">{latest.period || latest.year} · 게시 {fmtDate(latest.published_at)}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {latest.metrics.map((m) => (
                <div key={m.label} className="rounded-xl bg-white p-5 ring-1 ring-sea-100">
                  <p className="text-xs text-sea-600">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold text-sea-800">
                    {m.value} <span className="text-sm font-normal text-sea-600">{m.unit}</span>
                  </p>
                  {m.note && <p className="mt-0.5 text-xs text-sea-500">{m.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {finance && <FinanceChart data={finance} />}

        <div>
          <h2 className="text-xl font-bold text-sea-800">실적 자료</h2>
          {posts === null ? (
            <p className="mt-3 text-sm text-sea-600">불러오는 중…</p>
          ) : filtered.length === 0 ? (
            <div className="card mt-3 text-sm text-sea-700">
              아직 게시된 실적 자료가 없습니다. 조합 운영진이 자료를 올리면 이곳에 정리됩니다.
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {filtered.map((p) => (
                <li key={p.id} className="card">
                  <button type="button" onClick={() => setOpen(open === p.id ? null : p.id)} className="w-full text-left">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-sea-500">
                      {p.category && <span className="rounded bg-sea-50 px-2 py-0.5 text-sea-700">{p.category}</span>}
                      {p.period && <span>{p.period}</span>}
                      <span>게시 {fmtDate(p.published_at)}</span>
                      {p.attachments.length > 0 && <span>📎 {p.attachments.length}</span>}
                    </div>
                    <p className="mt-1 font-semibold text-sea-900">{p.title}</p>
                    {p.summary && <p className="mt-1 text-sm text-sea-700">{p.summary}</p>}
                  </button>
                  {open === p.id && (
                    <div className="mt-4 space-y-4 border-t border-sea-100 pt-4">
                      {p.metrics.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-3">
                          {p.metrics.map((m) => (
                            <div key={m.label} className="rounded-xl bg-sea-50 p-4">
                              <p className="text-xs text-sea-600">{m.label}</p>
                              <p className="mt-1 text-lg font-bold text-sea-800">
                                {m.value} <span className="text-sm font-normal text-sea-600">{m.unit}</span>
                              </p>
                              {m.note && <p className="mt-0.5 text-xs text-sea-500">{m.note}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      {p.body && <Body text={p.body} />}
                      <Attachments items={p.attachments} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-sm text-sea-600">
          정관·결산 보고 등 공시 자료는 <Link href="/disclosure" className="underline hover:text-sea-900">경영공시</Link> 페이지에 있습니다.
        </p>
      </section>
    </>
  );
}
