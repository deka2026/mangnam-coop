"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sections = [
  {
    title: "사업",
    links: [
      { href: "/business/village-store", label: "마을식당·편의점" },
      { href: "/business/stay", label: "🌌 별달물멍잠자리" },
    ],
  },
  {
    title: "마을학교",
    links: [
      { href: "/village-school", label: "세 개의 교실 안내" },
      { href: "/village-school/teen", label: "🌱 연두교실 · 청소년" },
      { href: "/village-school/youth", label: "🌊 파란교실 · 청년" },
      { href: "/village-school/senior", label: "🧭 푸른교실 · 장년" },
    ],
  },
  {
    title: "참여",
    links: [
      { href: "/plogging", label: "🧹 플로깅 신청" },
      { href: "/mulmeong", label: "🌌 별달물멍 스팟예약" },
    ],
  },
  {
    title: "안내",
    links: [{ href: "/contact", label: "문의·제휴" }],
  },
];

const related = [
  { href: "https://sakyowon.co.kr/", label: "사교원 사이트 허브 ↗", bold: true },
  { href: "https://sakyowon.poomasi.org", label: "사교원 홈페이지 ↗" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // 허브(마을학교 안내)는 하위 교실 경로에서 켜지지 않도록 정확히 일치할 때만
    if (href === "/village-school")
      return pathname === "/village-school" || pathname === "/village-school/";
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    `block rounded-md px-3 py-2 text-sm transition-colors ${
      isActive(href)
        ? "bg-sea-600 text-white font-semibold"
        : "text-sea-700 hover:bg-sea-50 hover:text-sea-900"
    }`;

  return (
    <>
      {/* 모바일 상단바 */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-sea-100 bg-white/90 px-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-bold text-sea-800">
          <span className="text-xl">🌊</span>
          <span>망남마을협동조합</span>
        </Link>
        <button
          aria-label="메뉴 열기"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-sea-700 hover:bg-sea-50"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 좌측 사이드바 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-sea-100 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-bold text-sea-900"
          >
            <span className="text-2xl">🌊</span>
            <span className="leading-tight">망남마을<br />협동조합</span>
          </Link>
          <button
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-sea-600 hover:bg-sea-50 lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-4">
          <Link href="/" onClick={() => setOpen(false)} className={linkClass("/")}>
            🏠 홈
          </Link>
          {sections.map((sec) => (
            <div key={sec.title}>
              <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-sea-400">
                {sec.title}
              </div>
              {sec.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={linkClass(l.href)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}

          <div>
            <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-sea-400">
              관련 사이트
            </div>
            {related.map((r) => (
              <a
                key={r.href}
                href={r.href}
                target="_blank"
                rel="noopener"
                className={`block rounded-md px-3 py-2 text-sm text-sea-600 hover:bg-sea-50 ${
                  r.bold ? "font-bold" : ""
                }`}
              >
                {r.label}
              </a>
            ))}
          </div>
        </nav>

        <Link
          href="/donation"
          onClick={() => setOpen(false)}
          className="btn-primary mt-6 w-full text-sm"
        >
          후원하기
        </Link>
      </aside>
    </>
  );
}
