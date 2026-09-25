"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { api, ApiError, fmtDate, Post, PublicMeeting } from "../lib/api";
import { Attachments, Body } from "../components/PostView";

function PostDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ row: Post }>(`/public/posts/${encodeURIComponent(id)}`)
      .then((r) => setPost(r.row))
      .catch((e) => setError(e instanceof Error ? e.message : "불러오지 못했습니다."));
  }, [id]);

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-sea-600 hover:text-sea-900">
        ← 목록으로
      </button>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {post && (
        <article className="card mt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-sea-500">
            {post.category && <span className="rounded bg-sea-50 px-2 py-0.5 text-sea-700">{post.category}</span>}
            {post.period && <span>{post.period}</span>}
            <span>게시 {fmtDate(post.published_at)}</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-sea-900">{post.title}</h2>
          {post.summary && <p className="mt-2 text-sea-700">{post.summary}</p>}
          {post.metrics.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {post.metrics.map((m) => (
                <div key={m.label} className="rounded-xl bg-sea-50 p-4">
                  <p className="text-xs text-sea-600">{m.label}</p>
                  <p className="mt-1 text-xl font-bold text-sea-800">
                    {m.value} <span className="text-sm font-normal text-sea-600">{m.unit}</span>
                  </p>
                  {m.note && <p className="mt-0.5 text-xs text-sea-500">{m.note}</p>}
                </div>
              ))}
            </div>
          )}
          {post.body && (
            <div className="mt-6 border-t border-sea-100 pt-6">
              <Body text={post.body} />
            </div>
          )}
          {post.attachments.length > 0 && (
            <div className="mt-6 border-t border-sea-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sea-500">첨부</p>
              <Attachments items={post.attachments} />
            </div>
          )}
        </article>
      )}
    </div>
  );
}

function DisclosureInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [meetings, setMeetings] = useState<PublicMeeting[]>([]);
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [openMeeting, setOpenMeeting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<{ rows: Post[]; years: (number | string)[]; categories: string[] }>("/public/posts", { params: { board: "disclosure" } }),
      api<{ rows: PublicMeeting[] }>("/public/meetings"),
    ])
      .then(([p, m]) => {
        setPosts(p.rows);
        setCategories(p.categories);
        setYears(p.years.map(String));
        setMeetings(m.rows);
      })
      .catch((e) => {
        setPosts([]);
        // 서버에 운영 모듈이 아직 없으면(404) 오류 대신 "자료 없음"으로 보여 준다
        if (e instanceof ApiError && e.status === 404) return;
        setError(e instanceof Error ? e.message : "자료를 불러오지 못했습니다.");
      });
  }, []);

  const filtered = useMemo(
    () =>
      (posts ?? []).filter(
        (p) => (!category || p.category === category) && (!year || String(p.year ?? "") === year)
      ),
    [posts, category, year]
  );

  const grouped = useMemo(() => {
    const g: Record<string, Post[]> = {};
    filtered.forEach((p) => {
      (g[p.category || "기타 공시"] ??= []).push(p);
    });
    const order = [...categories, ...Object.keys(g).filter((c) => !categories.includes(c))];
    return order.filter((c) => g[c]?.length).map((c) => [c, g[c]] as const);
  }, [filtered, categories]);

  const goList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url.toString());
    // Next 의 useSearchParams 는 pushState 를 곧바로 반영하지 않으므로 강제로 다시 그린다
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (id) return <PostDetail id={id} onBack={goList} />;

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded-md bg-earth-50 px-4 py-3 text-sm text-earth-800 ring-1 ring-earth-200">
          {error} — 잠시 뒤 다시 열어 주세요.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCategory("")} className={`rounded-full px-3 py-1 text-sm ring-1 ${!category ? "bg-sea-600 text-white ring-sea-600" : "bg-white text-sea-700 ring-sea-200"}`}>
          전체
        </button>
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c === category ? "" : c)} className={`rounded-full px-3 py-1 text-sm ring-1 ${category === c ? "bg-sea-600 text-white ring-sea-600" : "bg-white text-sea-700 ring-sea-200"}`}>
            {c}
          </button>
        ))}
        {years.length > 1 && (
          <select value={year} onChange={(e) => setYear(e.target.value)} className="ml-auto rounded-md border border-sea-200 px-3 py-1 text-sm">
            <option value="">모든 연도</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        )}
      </div>

      {posts === null ? (
        <p className="text-sm text-sea-600">불러오는 중…</p>
      ) : grouped.length === 0 ? (
        <div className="card text-sm text-sea-700">
          아직 게시된 공시 자료가 없습니다. 조합 운영진이 자료를 올리면 이곳에 정리됩니다.
        </div>
      ) : (
        grouped.map(([c, list]) => (
          <section key={c}>
            <h2 className="text-xl font-bold text-sea-800">{c}</h2>
            <ul className="mt-3 divide-y divide-sea-100 rounded-xl bg-white ring-1 ring-sea-100">
              {list.map((p) => (
                <li key={p.id}>
                  <Link href={`/disclosure/?id=${encodeURIComponent(p.id)}`} className="block px-5 py-4 hover:bg-sea-50">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-sea-500">
                      {p.period && <span className="rounded bg-sea-50 px-2 py-0.5 text-sea-700">{p.period}</span>}
                      <span>{fmtDate(p.published_at)}</span>
                      {p.attachments.length > 0 && <span>📎 {p.attachments.length}</span>}
                    </div>
                    <p className="mt-1 font-semibold text-sea-900">{p.title}</p>
                    {p.summary && <p className="mt-1 text-sm text-sea-700">{p.summary}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {meetings.length > 0 && (!category || category === "총회·이사회 활동") && (
        <section>
          <h2 className="text-xl font-bold text-sea-800">총회·이사회 활동</h2>
          <p className="mt-1 text-sm text-sea-600">회의 일자와 안건, 결정 사항을 공개합니다.</p>
          <ul className="mt-3 divide-y divide-sea-100 rounded-xl bg-white ring-1 ring-sea-100">
            {meetings
              .filter((m) => !year || m.date.startsWith(year))
              .map((m) => (
                <li key={m.id} className="px-5 py-4">
                  <button type="button" onClick={() => setOpenMeeting(openMeeting === m.id ? null : m.id)} className="w-full text-left">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-sea-500">
                      <span className="rounded bg-sea-50 px-2 py-0.5 text-sea-700">{m.kind}</span>
                      <span>{fmtDate(m.date)}</span>
                    </div>
                    <p className="mt-1 font-semibold text-sea-900">{m.title}</p>
                  </button>
                  {openMeeting === m.id && (
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">안건</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sea-800">{m.agenda || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-sea-500">결정 사항</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sea-800">{m.decisions || "—"}</dd>
                      </div>
                      {m.attachments.length > 0 && (
                        <div className="sm:col-span-2">
                          <Attachments items={m.attachments} />
                        </div>
                      )}
                    </dl>
                  )}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function DisclosurePage() {
  return (
    <>
      <section className="border-b border-sea-100 bg-gradient-to-b from-sea-50 to-white">
        <div className="container-page py-16">
          <p className="font-semibold text-sea-600">조합 운영</p>
          <h1 className="mt-2 section-title">경영공시</h1>
          <p className="section-sub">
            망남마을협동조합의 정관·규약, 총회와 이사회 활동, 사업 결산과 결과 보고를 조합원과 마을 주민에게 공개합니다.
            협동조합기본법이 정한 경영공시 사항을 이곳에 정리합니다.
          </p>
        </div>
      </section>
      <section className="container-page py-12">
        <Suspense fallback={<p className="text-sm text-sea-600">불러오는 중…</p>}>
          <DisclosureInner />
        </Suspense>
      </section>
    </>
  );
}
