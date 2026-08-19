import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "망남마을학교 | 망남마을협동조합",
  description:
    "완도 망남마을의 평생교육 프로그램. 청소년을 위한 연두교실, 청년을 위한 파란교실, 장년을 위한 푸른교실 — 세대별 세 개의 교실로 운영합니다.",
};

const CLASSROOMS = [
  {
    href: "/village-school/teen",
    icon: "🌱",
    name: "연두교실",
    target: "청소년",
    tone: "새싹처럼, 처음",
    desc: "완도 바다에서 몸으로 배우는 청소년 스킴보드 캠프. 3일간 스킴보드와 친해지고, 타고, 혼자 서 봅니다.",
    program: "청소년 스킴보드 캠프 · 2박 3일",
    status: "신청 접수",
    // 연두 = 밝은 연두빛
    wrap: "bg-lime-50 ring-lime-200 hover:ring-lime-400",
    badge: "bg-lime-600",
    accent: "text-lime-700",
    pill: "bg-lime-100 text-lime-800",
  },
  {
    href: "/village-school/youth",
    icon: "🌊",
    name: "파란교실",
    target: "청년",
    tone: "다시, 나에게로",
    desc: "섬에서 다시 시작하는 3박 4일. 회복·커뮤니티·취창업을 잇는 청년 평생교육 프로그램입니다.",
    program: "나에게로, 망남 · 3박 4일",
    status: "1기 모집 중",
    wrap: "bg-sea-50 ring-sea-200 hover:ring-sea-400",
    badge: "bg-sea-600",
    accent: "text-sea-700",
    pill: "bg-sea-600 text-white",
  },
  {
    href: "/village-school/senior",
    icon: "🧭",
    name: "푸른교실",
    target: "장년",
    tone: "이제, 이끄는 사람",
    desc: "배운 것을 가르치는 사람이 되는 스킴보드 강사양성 과정. 2일 집중 교육으로 마을학교 지도자로 성장합니다.",
    program: "스킴보드 강사양성 과정 · 1박 2일",
    status: "신청 접수",
    // 푸른 = 짙은 청록
    wrap: "bg-teal-50 ring-teal-200 hover:ring-teal-400",
    badge: "bg-teal-600",
    accent: "text-teal-700",
    pill: "bg-teal-100 text-teal-800",
  },
];

export default function Page() {
  return (
    <>
      {/* 히어로 */}
      <section className="bg-gradient-to-b from-sea-50 to-earth-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">망남마을학교 · 평생교육</p>
          <h1 className="mt-2 section-title">세대가 함께 배우는 세 개의 교실</h1>
          <p className="section-sub">
            망남마을학교는 완도 망남리의 바다와 마을을 교실로 삼습니다. 청소년·청년·장년이
            각자의 자리에서 배우고, 배운 사람이 다시 다음 사람을 가르치는 순환을 만듭니다.
            아래에서 나에게 맞는 교실을 골라 보세요.
          </p>
        </div>
      </section>

      {/* 세 교실 */}
      <section className="container-page py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {CLASSROOMS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`card group flex flex-col ring-1 transition ${c.wrap}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.icon}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.pill}`}>
                  {c.status}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <h2 className={`text-xl font-bold ${c.accent}`}>{c.name}</h2>
                <span
                  className={`rounded-full ${c.badge} px-2 py-0.5 text-xs font-bold text-white`}
                >
                  {c.target}
                </span>
              </div>
              <p className={`mt-1 text-sm font-medium ${c.accent}`}>{c.tone}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-sea-700">{c.desc}</p>
              <p className="mt-4 text-xs font-medium text-sea-500">{c.program}</p>
              <span className={`mt-2 text-sm font-semibold ${c.accent} group-hover:underline`}>
                자세히 보기 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 운영 철학 */}
      <section className="container-page pb-16">
        <div className="card">
          <h2 className="font-bold text-sea-900 text-lg">배운 사람이 가르치는 마을</h2>
          <p className="mt-3 text-sm leading-relaxed text-sea-700">
            연두교실에서 처음 바다에 선 청소년이 파란교실에서 자기 자리를 찾고, 푸른교실에서
            다음 세대를 가르치는 강사가 됩니다. 망남마을학교의 교육비 지출은 대부분 마을 안에서
            일어나고, 프로그램을 이끈 주민과 수료생은{" "}
            <strong className="text-sea-900">마을지도사</strong>와{" "}
            <strong className="text-sea-900">망남 관계인구</strong>로 이어집니다. 이는
            어촌신활력증진사업 기본계획의 <span className="font-medium">B2 망남 마을학교</span>를
            실제 운영으로 연결하는 일입니다.
          </p>
          <p className="mt-4 text-xs text-sea-600">
            참가·개설 문의는{" "}
            <Link href="/contact" className="underline hover:text-sea-900">
              문의·제휴 페이지
            </Link>
            로 주세요.
          </p>
        </div>
      </section>
    </>
  );
}
