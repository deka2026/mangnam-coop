import type { Metadata } from "next";
import Link from "next/link";
import CampApplicationForm from "../CampApplicationForm";

export const metadata: Metadata = {
  title: "푸른교실 · 스킴보드 강사양성 과정 | 망남마을학교",
  description:
    "배운 것을 가르치는 사람이 되는 스킴보드 강사양성 과정. 1박 2일 집중 교육으로 지상훈련부터 파도타기·교수법까지 익히고 마을학교 지도자로 성장합니다.",
};

const ACCENT = {
  heading: "text-teal-800",
  submit:
    "inline-flex items-center justify-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700",
  ring: "ring-teal-200",
  soft: "bg-teal-50",
  emoji: "🧭",
};

const FACTS = [
  { k: "대상", v: "장년 · 강사를 준비하는 성인" },
  { k: "기간", v: "1박 2일 (집중 과정)" },
  { k: "장소", v: "전남 완도군 완도읍 망남 해변" },
  { k: "정원", v: "강사 1명당 6명 기준" },
  { k: "수료", v: "스킴보드 입문강습 Level 4 · 수료·시상" },
  { k: "참가비", v: "추후 공지 · 문의 접수" },
];

const DAYS = [
  {
    label: "1일차",
    theme: "플랫랜드 — 기초와 레벨업",
    sessions: [
      { time: "09:30", title: "오리엔테이션", desc: "프로그램 소개 / 팀 나누기" },
      { time: "10:00", title: "스킴보드 이론", desc: "스킴보드 소개 / RDS / 안전교육" },
      { time: "10:30", title: "지상훈련", desc: "밸런스보드 / Slide 자세 연습" },
      { time: "11:00", title: "플랫랜드 스킴보딩 I", desc: "RDS 기초" },
      { time: "12:00", title: "점심", desc: "" },
      { time: "13:00", title: "플랫랜드 스킴보딩 II", desc: "RDS 런 레벨업" },
      { time: "14:00", title: "스킴 미션", desc: "비거리 늘리기" },
      { time: "15:00", title: "자유 스킴", desc: "개별 피드백" },
      { time: "16:00", title: "교수법 훈련", desc: "개별 피드백" },
    ],
  },
  {
    label: "2일차",
    theme: "서프 — 파도타기와 수료",
    sessions: [
      { time: "09:30", title: "워밍업", desc: "전날 복습 / 준비운동" },
      { time: "10:00", title: "지상훈련", desc: "엣지 턴 이론 / 서프스케이트" },
      { time: "11:00", title: "서프 스킴보딩 I", desc: "사선라이딩 / 엣지 턴" },
      { time: "12:00", title: "점심", desc: "" },
      { time: "13:00", title: "서프 스킴보딩 II", desc: "파도 보는 법 / 파도타기" },
      { time: "14:00", title: "자유 스킴", desc: "개별 피드백" },
      { time: "15:00", title: "서프 스킴보딩 III", desc: "Reaching Wave" },
      { time: "17:00", title: "수료식 및 시상식", desc: "" },
    ],
  },
];

const METHODS = [
  {
    icon: "📖",
    title: "이론 강습",
    body: "스킴보드 장비와 역사, 서핑의 물리학·파도의 이해, 사이드 슬립까지 지도에 필요한 원리를 익힙니다.",
  },
  {
    icon: "🛹",
    title: "지상 훈련",
    body: "밸런스 보드와 서프스케이트. 레벨업을 위한 필수 과정으로, 강사교육에서는 생략하지 않습니다.",
  },
  {
    icon: "🌊",
    title: "바다 실습",
    body: "플랫랜드 스킴보딩 → 서프 스킴보딩 → 바디보딩까지, 가르칠 수준으로 몸에 익힙니다.",
  },
];

export default function Page() {
  return (
    <>
      {/* 히어로 */}
      <section className="bg-teal-50 border-b border-teal-100">
        <div className="container-page py-16">
          <p className="text-sm text-teal-700/70">
            <Link href="/village-school" className="hover:text-teal-800">망남마을학교</Link>
            <span className="mx-1.5">›</span>
            <span className="font-semibold text-teal-700">🧭 푸른교실 · 장년</span>
          </p>
          <h1 className="mt-3 section-title text-teal-800">스킴보드 강사양성 과정</h1>
          <p className="mt-3 text-xl font-semibold text-teal-700">이제, 가르치는 사람</p>
          <p className="section-sub">
            기존 3회차 레벨업 강습을 1박 2일 과정에 압축한 집중 교육입니다. 지상훈련부터
            파도타기, 그리고 교수법까지 — 배운 것을 다음 사람에게 가르치는 마을학교
            지도자로 성장합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#apply" className="inline-flex items-center justify-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700">
              과정 문의하기
            </a>
            <a href="#schedule" className="inline-flex items-center justify-center rounded-md border border-teal-600 px-5 py-2.5 font-medium text-teal-700 transition-colors hover:bg-teal-100">
              2일 일정 보기
            </a>
          </div>
        </div>
      </section>

      {/* 한눈에 */}
      <section className="container-page py-12">
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-teal-100 ring-1 ring-teal-100 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.k} className="bg-white px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-teal-500">
                {f.k}
              </dt>
              <dd className="mt-1 font-medium text-sea-900">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 운영 방식 */}
      <section className="container-page pb-4">
        <h2 className="section-title text-2xl sm:text-3xl">운영 방식</h2>
        <p className="section-sub">
          이론 · 지상훈련 · 바다실습을 균형 있게 다룹니다. 밸런스보드와 서프스케이트는
          레벨업을 위한 필수 과정으로, 강사교육에서 생략하지 않습니다.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {METHODS.map((m) => (
            <div key={m.title} className="card ring-teal-100">
              <div className="text-2xl">{m.icon}</div>
              <h3 className="mt-2 font-bold text-teal-800">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sea-700">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2일 일정 */}
      <section id="schedule" className="container-page py-12 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl">2일 일정</h2>
        <p className="section-sub">
          1일차 플랫랜드에서 기초와 레벨업을, 2일차 서프에서 파도타기까지 마치고 수료합니다.
        </p>

        <div className="mt-8 space-y-8">
          {DAYS.map((day) => (
            <div key={day.label} className="card ring-teal-100">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">
                  {day.label}
                </span>
                <h3 className="text-xl font-bold text-teal-800">{day.theme}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {day.sessions.map((s) => (
                  <li
                    key={s.time + s.title}
                    className="grid gap-1 border-l-2 border-teal-200 pl-4 sm:grid-cols-[4rem_1fr] sm:gap-4"
                  >
                    <span className="text-sm font-semibold text-teal-600">{s.time}</span>
                    <div>
                      <p className="font-medium text-sea-900">{s.title}</p>
                      {s.desc && (
                        <p className="mt-0.5 text-sm leading-relaxed text-sea-700">{s.desc}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-sea-500">
          ※ 기존 3회차 레벨업 강습 내용을 2일 과정에 융화한 수업으로, 부분 참석은 불가합니다.
        </p>
      </section>

      {/* 준비물 · 안전 */}
      <section className="container-page pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card ring-teal-100">
            <h2 className="font-bold text-teal-800 text-lg">준비물</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 레쉬가드 또는 웻수트</li>
              <li>• 여벌 옷·수건·세면도구, 개인 상비약</li>
              <li className="text-teal-700">
                · 스킴보드·서프스케이트·밸런스보드 등 훈련 장비는 과정에서 제공/대여합니다.
              </li>
              <li className="text-sea-500">
                · 운영측 준비: 프로젝터·강의실, 강사모자/단체 래쉬가드
              </li>
            </ul>
          </div>
          <div className="card bg-teal-50 ring-teal-200">
            <h2 className="font-bold text-teal-800 text-lg">안전 · 리스크 대응</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-800">
              <li>• 우천 시 실내 연습장에서 서프스케이트로 대체 진행</li>
              <li>• 응급조치가 가능한 안전요원 배치, 면책동의서 사전 수령</li>
              <li>• 물때가 맞지 않으면 순서를 변경하여 진행</li>
              <li>• 스킴보드 파손에 대비해 여분의 대여 보드를 준비</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 과정 신청 */}
      <section id="apply" className="container-page pb-20 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl text-teal-800">과정 신청</h2>
        <p className="section-sub">
          개설 일정과 참가 방법은 준비되는 대로 안내드립니다. 강사양성 과정 참가나 마을
          단위 개설을 검토 중이시면 아래에 정보를 남겨 주세요.
        </p>
        <div className="mt-8">
          <CampApplicationForm
            program="senior"
            programLabel="푸른교실 · 스킴보드 강사양성 과정"
            accent={ACCENT}
          />
        </div>
        <p className="mt-6 text-xs text-sea-600">
          신청 내용은 과정 운영·안전관리 목적으로만 사용합니다. 다른 교실이 궁금하시면{" "}
          <Link href="/village-school" className="underline hover:text-teal-800">
            마을학교 안내
          </Link>
          로 돌아가세요.
        </p>
      </section>
    </>
  );
}
