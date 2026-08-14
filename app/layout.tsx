import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "망남마을협동조합",
  description:
    "마을식당·편의점, 외국인근로자 인력소개, 빈집임대, 큰개머리 낚시산장 — 망남마을협동조합의 지속가능한 마을경제.",
  openGraph: {
    title: "망남마을협동조합",
    description:
      "마을식당·편의점, 외국인근로자 인력소개, 빈집임대, 큰개머리 낚시산장 — 지속가능한 마을경제.",
    type: "website",
    locale: "ko_KR",
  },
};

const nav = [
  { href: "/business/village-store", label: "마을식당·편의점" },
  { href: "/business/foreign-workers", label: "외국인근로자" },
  { href: "/business/empty-house", label: "빈집임대" },
  { href: "/business/kunggaemeori", label: "큰개머리 낚시산장" },
  { href: "/village-school", label: "망남마을학교" },
  { href: "/donation", label: "고향사랑기부" },
  { href: "/funding", label: "크라우드펀딩" },
  { href: "/contact", label: "문의" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Sidebar />

        <div className="lg:ml-64">
          <main className="min-h-screen">{children}</main>

        <footer className="mt-20 border-t border-sea-100 bg-white">
          <div className="container-page py-10 grid gap-8 md:grid-cols-3 text-sm text-sea-700">
            <div>
              <div className="font-bold text-sea-900 mb-2">망남마을협동조합</div>
              <p>지속가능한 마을경제를 위한 주민 자립 조직.</p>
            </div>
            <div>
              <div className="font-semibold text-sea-800 mb-2">사업</div>
              <ul className="space-y-1">
                {nav.slice(0, 4).map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="hover:text-sea-900">{n.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-sea-800 mb-2">참여</div>
              <ul className="space-y-1">
                <li><Link href="/village-school" className="hover:text-sea-900">망남마을학교</Link></li>
                <li><Link href="/donation" className="hover:text-sea-900">고향사랑지정기부</Link></li>
                <li><Link href="/funding" className="hover:text-sea-900">크라우드펀딩</Link></li>
                <li><Link href="/contact" className="hover:text-sea-900">문의·제휴</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sea-100">
            <div className="container-page py-5 text-xs text-sea-600 flex flex-wrap justify-between gap-2">
              <span>
                © {new Date().getFullYear()} 망남마을협동조합 · 제작{" "}
                <a href="https://sakyowon.co.kr/" className="underline hover:text-sea-900">사회혁신교육원(사교원)</a>
              </span>
              <span className="flex flex-wrap items-center gap-3">
                <a href="https://sakyowon.co.kr/" className="inline-flex items-center rounded-full border border-sea-200 px-3 py-0.5 hover:bg-sea-50 hover:text-sea-900">🏠 사교원 관계 사이트</a>
                <span>지정기부금단체 등록 진행 중</span>
                <Link href="/village-school/admin" rel="nofollow" className="inline-flex items-center rounded-full border border-sea-200 px-3 py-0.5 hover:bg-sea-50 hover:text-sea-900">🎓 마을학교 신청 관리</Link>
                <a href="https://sakyowon.poomasi.org/admin.html" rel="nofollow" className="inline-flex items-center rounded-full border border-sea-200 px-3 py-0.5 hover:bg-sea-50 hover:text-sea-900">🔐 통합 관리자</a>
              </span>
            </div>
          </div>
        </footer>
        </div>
      </body>
    </html>
  );
}
