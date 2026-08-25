"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ENDPOINT, SITE } from "../config";

/** 사교원 통합 계정 세션 확인용 — 신청 API와 같은 서버의 /api/auth/me */
const AUTH_ME = ENDPOINT.replace(/\/applications$/, "/auth/me");
import { OPT_OUT_OPTIONS, WISH_OPTIONS } from "../data";

/** 자체 서버(/api/applications) 행을 관리자 화면이 쓰는 형태로 되돌린다.
 *  서버는 전체 신청 payload를 raw(JSON 문자열)로 보관하므로 거기서 청년 필드를 복원한다. */
const asArray = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
function mapRow(r: any): Application {
  let raw: any = {};
  try {
    raw = typeof r.raw === "string" ? JSON.parse(r.raw) : r.raw ?? {};
  } catch {
    raw = {};
  }
  return {
    id: String(r.id ?? ""),
    createdAt: String(r.created_at ?? r.createdAt ?? ""),
    name: String(r.name ?? raw.name ?? ""),
    phone: String(r.phone ?? raw.phone ?? ""),
    email: String(r.email ?? raw.email ?? ""),
    team: String(raw.team ?? ""),
    avoid: asArray(raw.avoid),
    avoidEtc: String(raw.avoidEtc ?? ""),
    wish: asArray(raw.wish),
    wishEtc: String(raw.wishEtc ?? ""),
    optOut: asArray(raw.optOut),
    note: String(r.note ?? raw.note ?? ""),
  };
}

type Application = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  team: string;
  avoid: string[];
  avoidEtc: string;
  wish: string[];
  wishEtc: string;
  optOut: string[];
  note: string;
};

const labelOf = (id: string) =>
  OPT_OUT_OPTIONS.find((o) => o.id === id)?.label ?? id;

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
        d.getDate()
      ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
};

const csvCell = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [ssoName, setSsoName] = useState<string | null>(null);

  const fetchRows = async (key?: string) => {
    setLoading(true);
    setError("");
    try {
      // 청년(파란교실) 신청만 조회. 통합 계정 세션(쿠키)이 있으면 키 없이 통과되고,
      // 없으면 관리자 키를 서버 SAKYOWON_ADMIN_KEY 와 대조한다.
      const url =
        `${ENDPOINT}?program=youth&site=${encodeURIComponent(SITE)}` +
        (key ? `&key=${encodeURIComponent(key)}` : "");
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "조회에 실패했습니다.");
      }
      setRows((data.rows as any[]).map(mapRow));
    } catch (err) {
      setRows(null);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "조회에 실패했습니다. 비밀번호와 네트워크를 확인해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // 사교원 통합 계정으로 로그인돼 있으면(admin·staff) 비밀번호 없이 바로 조회
  useEffect(() => {
    if (!ENDPOINT) return;
    fetch(AUTH_ME, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && (d.user?.role === "admin" || d.user?.role === "staff")) {
          setSsoName(d.user.name || d.user.username);
          fetchRows();
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ENDPOINT) {
      setError(
        "신청 백엔드가 아직 연결되지 않았습니다. 사교원 자체 서버(sakyowon-site/server)를 배포하고 /api/applications 가 응답하는지 확인해 주세요."
      );
      return;
    }
    await fetchRows(password);
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.phone, r.email, r.team, r.note, ...r.avoid, r.avoidEtc, ...r.wish, r.wishEtc]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  /** 식단·숙소 준비를 위해 자주 보는 집계 */
  const stats = useMemo(() => {
    if (!rows) return null;
    const count = (key: string, list: (r: Application) => string[]) =>
      rows.filter((r) => list(r).includes(key)).length;
    return {
      total: rows.length,
      needSingleRoom: count("낯선 사람과 같은 방을 쓰기 어려움 (1인실 필요)", (r) => r.avoid),
      allergy: rows.filter((r) => r.avoid.some((a) => a.includes("알레르기"))).length,
      vegetarian: count("채식 (비건 / 락토·오보)", (r) => r.avoid),
      medication: count("복용 중인 약 또는 지병이 있음", (r) => r.avoid),
      noPhoto: count("no-photo", (r) => r.optOut),
      wish: WISH_OPTIONS.map((w) => ({
        label: w,
        n: count(w, (r) => r.wish),
      })).sort((a, b) => b.n - a.n),
      optOut: OPT_OUT_OPTIONS.map((o) => ({
        label: o.label,
        n: count(o.id, (r) => r.optOut),
      })).filter((o) => o.n > 0),
    };
  }, [rows]);

  const downloadCsv = () => {
    if (!rows) return;
    const header = [
      "신청일시", "이름", "전화번호", "이메일", "소속",
      "금기사항", "금기사항(기타)", "희망체험", "희망체험(기타)",
      "비희망 프로그램", "비고",
    ];
    const body = filtered.map((r) =>
      [
        fmt(r.createdAt), r.name, r.phone, r.email, r.team,
        r.avoid.join(" / "), r.avoidEtc,
        r.wish.join(" / "), r.wishEtc,
        r.optOut.map(labelOf).join(" / "), r.note,
      ].map(csvCell).join(",")
    );
    // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
    const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...body].join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `망남마을학교_신청자_${filtered.length}명.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="border-b border-sea-100 bg-sea-50">
        <div className="container-page py-12">
          <p className="font-semibold text-sea-600">관리자</p>
          <h1 className="mt-2 section-title text-3xl">마을학교 신청 관리</h1>
          <p className="section-sub">
            망남마을학교 참가 신청 내역을 조회합니다. 운영진 전용 페이지입니다.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        {ssoName && (
          <p className="mb-6 rounded-lg bg-sea-50 px-4 py-3 text-sm text-sea-800 ring-1 ring-sea-100">
            <strong>{ssoName}</strong>님, 사교원 통합 계정으로 확인되어 신청 내역을 바로 불러왔습니다.
          </p>
        )}
        {!ssoName && (
        <form onSubmit={load} className="card max-w-lg">
          <label className="block text-sm">
            <span className="font-medium text-sea-800">관리자 비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="운영진에게 전달받은 비밀번호"
              className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
            />
          </label>
          <p className="mt-2 text-xs text-sea-600">
            비밀번호는 이 사이트에 저장되지 않습니다. 입력값은 신청 서버에서만 확인합니다.
            <br />
            <a href="https://sakyowon.co.kr/admin.html" className="font-medium text-sea-700 underline">
              사교원 통합 계정으로 로그인
            </a>
            하면 비밀번호 없이 조회할 수 있습니다.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-4 disabled:opacity-60"
          >
            {loading ? "불러오는 중…" : "신청 내역 조회"}
          </button>
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        </form>
        )}
        {ssoName && error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}

        {rows && (
          <div className="mt-10">
            {/* 요약 */}
            {stats && (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { k: "신청자", v: stats.total },
                  { k: "1인실 필요", v: stats.needSingleRoom },
                  { k: "알레르기", v: stats.allergy },
                  { k: "채식", v: stats.vegetarian },
                  { k: "복약·지병", v: stats.medication },
                  { k: "촬영 비동의", v: stats.noPhoto },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white p-4 text-center ring-1 ring-sea-100">
                    <p className="text-2xl font-bold text-sea-800">{s.v}</p>
                    <p className="mt-0.5 text-xs text-sea-600">{s.k}</p>
                  </div>
                ))}
              </div>
            )}

            {stats && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <h2 className="font-bold text-sea-800">희망 체험 순위</h2>
                  <ul className="mt-3 space-y-2">
                    {stats.wish.map((w) => (
                      <li key={w.label} className="flex items-center gap-3 text-sm">
                        <span className="w-52 shrink-0 text-sea-700">{w.label}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-sea-50">
                          <span
                            className="block h-full rounded-full bg-sea-500"
                            style={{
                              width: `${stats.total ? (w.n / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </span>
                        <span className="w-8 shrink-0 text-right font-semibold text-sea-800">
                          {w.n}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <h2 className="font-bold text-sea-800">대체 일정이 필요한 세션</h2>
                  {stats.optOut.length === 0 ? (
                    <p className="mt-3 text-sm text-sea-600">
                      아직 제외를 요청한 프로그램이 없습니다.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {stats.optOut.map((o) => (
                        <li key={o.label} className="flex justify-between gap-3">
                          <span className="text-sea-700">{o.label}</span>
                          <span className="shrink-0 font-semibold text-earth-700">
                            {o.n}명 제외
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* 목록 */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="이름·연락처·내용 검색"
                className="w-full max-w-xs rounded-md border border-sea-200 bg-white px-3 py-2 text-sm text-sea-900 focus:border-sea-500 focus:outline-none"
              />
              <span className="text-sm text-sea-600">{filtered.length}명</span>
              <button type="button" onClick={downloadCsv} className="btn-outline ml-auto py-2 text-sm">
                CSV 내려받기
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-sea-100">
              <table className="w-full min-w-[46rem] bg-white text-sm">
                <thead className="bg-sea-50 text-left text-xs uppercase tracking-wide text-sea-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">신청일시</th>
                    <th className="px-4 py-3 font-semibold">이름</th>
                    <th className="px-4 py-3 font-semibold">연락처</th>
                    <th className="px-4 py-3 font-semibold">소속</th>
                    <th className="px-4 py-3 font-semibold">주의사항</th>
                    <th className="px-4 py-3 font-semibold">제외</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-sea-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sea-600">
                        표시할 신청 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                  {filtered.map((r) => (
                    <Fragment key={r.id}>
                      <tr className="align-top">
                        <td className="whitespace-nowrap px-4 py-3 text-sea-600">
                          {fmt(r.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-sea-900">
                          {r.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sea-700">{r.phone}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sea-700">{r.team}</td>
                        <td className="px-4 py-3 text-sea-700">
                          {r.avoid.length + (r.avoidEtc ? 1 : 0) === 0 ? (
                            <span className="text-sea-400">—</span>
                          ) : (
                            <span className="rounded bg-earth-50 px-2 py-0.5 text-xs font-medium text-earth-700">
                              {r.avoid.length + (r.avoidEtc ? 1 : 0)}건
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sea-700">
                          {r.optOut.length === 0 ? (
                            <span className="text-sea-400">—</span>
                          ) : (
                            <span className="rounded bg-sea-50 px-2 py-0.5 text-xs font-medium text-sea-700">
                              {r.optOut.length}개
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setOpenId(openId === r.id ? null : r.id)}
                            className="text-sm font-medium text-sea-600 hover:text-sea-900"
                          >
                            {openId === r.id ? "닫기" : "상세"}
                          </button>
                        </td>
                      </tr>
                      {openId === r.id && (
                        <tr className="bg-sea-50/60">
                          <td colSpan={7} className="px-4 py-5">
                            <dl className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">
                                  음식·일상에서 하지 말아야 할 것
                                </dt>
                                <dd className="mt-1 text-sm text-sea-800">
                                  {r.avoid.length === 0 && !r.avoidEtc
                                    ? "—"
                                    : [...r.avoid, r.avoidEtc && `기타: ${r.avoidEtc}`]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">
                                  원하는 체험
                                </dt>
                                <dd className="mt-1 text-sm text-sea-800">
                                  {[...r.wish, r.wishEtc && `기타: ${r.wishEtc}`]
                                    .filter(Boolean)
                                    .join(" · ") || "—"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">
                                  하고 싶지 않은 프로그램
                                </dt>
                                <dd className="mt-1 text-sm text-sea-800">
                                  {r.optOut.map(labelOf).join(" · ") || "—"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">
                                  그 밖에 알아 두어야 할 것
                                </dt>
                                <dd className="mt-1 whitespace-pre-wrap text-sm text-sea-800">
                                  {r.note || "—"}
                                </dd>
                              </div>
                              {r.email && (
                                <div>
                                  <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">
                                    이메일
                                  </dt>
                                  <dd className="mt-1 text-sm text-sea-800">{r.email}</dd>
                                </div>
                              )}
                            </dl>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
