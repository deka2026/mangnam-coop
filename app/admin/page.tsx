"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell, { ADMIN_TABS, Notice, useAdmin } from "./AdminShell";
import { api, Doc, fmtDate, LedgerSummary, Meeting, monthLabel, Post, thisMonth, won } from "../lib/api";

function Dashboard() {
  const { name } = useAdmin();
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      api<LedgerSummary>("/ledger/summary", { admin: true, params: { year } }),
      api<{ rows: Meeting[] }>("/meetings", { admin: true }),
      api<{ rows: Doc[] }>("/documents", { admin: true }),
      api<{ rows: Post[] }>("/posts", { admin: true }),
    ])
      .then(([s, m, d, p]) => {
        setSummary(s);
        setMeetings(m.rows.slice(0, 5));
        setDocs(d.rows);
        setPosts(p.rows);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "불러오기에 실패했습니다."));
  }, []);

  const cur = thisMonth();
  const curMonth = summary?.months.find((m) => m.month === cur);
  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");
  const openMonths = (summary?.months ?? []).filter((m) => m.count > 0 && m.status === "open" && m.month < cur);

  return (
    <div className="space-y-8">
      {error && <Notice kind="error">{error}</Notice>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: `${monthLabel(cur)} 수입`, v: won(curMonth?.income ?? 0), href: "/admin/ledger" },
          { k: `${monthLabel(cur)} 지출`, v: won(curMonth?.expense ?? 0), href: "/admin/ledger" },
          { k: "올해 누적 수지", v: won(summary?.total.net ?? 0), href: "/admin/ledger" },
          { k: "게시 중인 공시·실적", v: `${published.length}건`, href: "/admin/posts" },
        ].map((s) => (
          <Link key={s.k} href={s.href} className="rounded-xl bg-white p-4 ring-1 ring-sea-100 hover:ring-sea-300">
            <p className="text-xs text-sea-600">{s.k}</p>
            <p className="mt-1 text-xl font-bold text-sea-800">{s.v}</p>
          </Link>
        ))}
      </div>

      {openMonths.length > 0 && (
        <Notice kind="info">
          마감하지 않은 지난달이 있습니다: {openMonths.map((m) => monthLabel(m.month)).join(", ")} —{" "}
          <Link href="/admin/ledger" className="underline">
            월별 회계에서 마감
          </Link>
        </Notice>
      )}
      {drafts.length > 0 && (
        <Notice kind="info">
          아직 게시하지 않은 초안 {drafts.length}건이 있습니다.{" "}
          <Link href="/admin/posts" className="underline">
            공시·실적 게시로 이동
          </Link>
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sea-800">최근 회의</h2>
            <Link href="/admin/meetings" className="text-sm text-sea-600 hover:text-sea-900">
              전체 보기 →
            </Link>
          </div>
          {meetings.length === 0 ? (
            <p className="mt-3 text-sm text-sea-600">기록된 회의가 없습니다.</p>
          ) : (
            <ul className="mt-3 divide-y divide-sea-100 text-sm">
              {meetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sea-800">
                    <span className="mr-2 rounded bg-sea-50 px-1.5 py-0.5 text-xs text-sea-600">{m.kind}</span>
                    {m.title}
                  </span>
                  <span className="shrink-0 text-xs text-sea-500">{fmtDate(m.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sea-800">문서 보관함</h2>
            <Link href="/admin/documents" className="text-sm text-sea-600 hover:text-sea-900">
              전체 보기 →
            </Link>
          </div>
          <p className="mt-3 text-sm text-sea-700">
            보관 문서 <strong>{docs.length}</strong>건
          </p>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs">
            {Object.entries(
              docs.reduce<Record<string, number>>((acc, d) => {
                acc[d.category || "기타"] = (acc[d.category || "기타"] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([c, n]) => (
              <li key={c} className="rounded-full bg-sea-50 px-3 py-1 text-sea-700 ring-1 ring-sea-100">
                {c} {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card bg-earth-50 ring-earth-200">
        <h2 className="font-bold text-sea-800">이 화면에서 하는 일</h2>
        <ul className="mt-3 grid gap-2 text-sm text-sea-700 sm:grid-cols-2">
          {ADMIN_TABS.slice(1).map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="font-medium text-sea-800 hover:text-sea-600">
                {t.icon} {t.label}
              </Link>
              <span className="ml-2 text-sea-600">
                {t.href.endsWith("ledger") && "수입·지출 전표 입력, 월 마감, CSV 내려받기"}
                {t.href.endsWith("meetings") && "총회·이사회·운영회의 기록과 결정사항 보관"}
                {t.href.endsWith("documents") && "정관·등기·계약서·보고서 파일 보관"}
                {t.href.endsWith("posts") && "경영공시 자료와 실적 자료를 사이트에 게시"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-sea-600">{name}님으로 기록됩니다.</p>
      </div>
    </div>
  );
}

export default function AdminHome() {
  return (
    <AdminShell title="조합 운영관리" sub="망남마을협동조합의 회계·회의·문서를 기록하고, 경영공시와 실적을 사이트에 게시합니다.">
      <Dashboard />
    </AdminShell>
  );
}
