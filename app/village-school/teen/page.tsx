import type { Metadata } from "next";
import Link from "next/link";
import CampApplicationForm from "../CampApplicationForm";

export const metadata: Metadata = {
  title: "연두교실 · 청소년 스킴보드 캠프 | 망남마을학교",
  description:
    "완도 망남 바다에서 몸으로 배우는 청소년 스킴보드 캠프. 2박 3일 동안 스킴보드와 친해지고, 타고, 혼자 서 봅니다.",
};

const ACCENT = {
  heading: "text-lime-800",
  submit:
    "inline-flex items-center justify-center rounded-md bg-lime-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-lime-700",
  ring: "ring-lime-200",
  soft: "bg-lime-50",
  emoji: "🌱",
};

const FACTS = [
  { k: "대상", v: "청소년 (중·고등학생)" },
  { k: "기간", v: "2박 3일" },
  { k: "장소", v: "전남 완도군 완도읍 망남 해변" },
  { k: "정원", v: "소수정예 (안전 지도 6~10명)" },
  { k: "준비물", v: "레쉬가드 또는 웻수트 (장비 대여)" },
  { k: "참가비", v: "추후 공지 · 문의 접수" },
];

const DAYS = [
  {
    label: "1일차",
    theme: "스킴보드랑 친해지기",
    summary: "장비와 몸을 먼저 익힙니다. 넘어지는 법부터 배우니 겁내지 않아도 됩니다.",
    sessions: [
      { title: "이론 강습", desc: "스킴보드의 역사와 보드 각 부분 명칭, 안전 수칙" },
      { title: "RDS 기초", desc: "드랍(보드에 올라타기) 익숙해지기 · 밸런스 훈련" },
      { title: "라이딩 영상 피드백", desc: "내 자세를 영상으로 보며 하나씩 교정합니다" },
    ],
  },
  {
    label: "2일차",
    theme: "스킴보드 타기",
    summary: "속도를 내고 방향을 잡습니다. 어제보다 조금 더 멀리 나갑니다.",
    sessions: [
      { title: "이론 강습", desc: "스킴보딩의 종류 이해" },
      { title: "RDS 레벨업", desc: "런업(속도 내기) · 비거리 늘리기" },
      { title: "라이딩 영상 피드백", desc: "달라진 내 라이딩을 확인합니다" },
    ],
  },
  {
    label: "3일차",
    theme: "스킴보드 혼자 타기",
    summary: "파도를 읽고 스스로 한 라운드를 완성합니다.",
    sessions: [
      { title: "이론 강습", desc: "파도의 종류와 파도 보는 법" },
      { title: "파도타기 · 바디보딩", desc: "실제 파도 위에서 라이딩, 바디보딩 체험" },
      { title: "라이딩 영상 피드백", desc: "3일간의 성장을 함께 돌아봅니다" },
    ],
  },
];

const METHODS = [
  {
    icon: "📖",
    title: "이론 강습",
    body: "스킴보드 장비와 역사, 서핑의 물리학과 파도의 이해, 사이드 슬립 원리를 먼저 익힙니다.",
  },
  {
    icon: "🛹",
    title: "지상 훈련",
    body: "밸런스 보드와 서프스케이트로 바다에 들어가기 전 균형과 자세를 몸에 익힙니다.",
  },
  {
    icon: "🌊",
    title: "바다 실습",
    body: "플랫랜드 스킴보딩 → 서프 스킴보딩 → 바디보딩으로 단계를 밟아 실제 파도까지 나아갑니다.",
  },
];

export default function Page() {
  return (
    <>
      {/* 히어로 */}
      <section className="bg-lime-50 border-b border-lime-100">
        <div className="container-page py-16">
          <p className="text-sm text-lime-700/70">
            <Link href="/village-school" className="hover:text-lime-800">망남마을학교</Link>
            <span className="mx-1.5">›</span>
            <span className="font-semibold text-lime-700">🌱 연두교실 · 청소년</span>
          </p>
          <h1 className="mt-3 section-title text-lime-800">청소년 스킴보드 캠프</h1>
          <p className="mt-3 text-xl font-semibold text-lime-700">바다에서, 처음</p>
          <p className="section-sub">
            완도 망남 바다를 교실 삼아 스킴보드를 배우는 2박 3일. 넘어지는 법부터 배우고,
            영상으로 내 자세를 보며 하루가 다르게 성장합니다. 3일 뒤에는 스스로 파도 한
            줄기를 탈 수 있습니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#apply" className="inline-flex items-center justify-center rounded-md bg-lime-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-lime-700">
              참가 문의하기
            </a>
            <a href="#schedule" className="inline-flex items-center justify-center rounded-md border border-lime-600 px-5 py-2.5 font-medium text-lime-700 transition-colors hover:bg-lime-100">
              3일 커리큘럼 보기
            </a>
          </div>
        </div>
      </section>

      {/* 한눈에 */}
      <section className="container-page py-12">
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-lime-100 ring-1 ring-lime-100 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.k} className="bg-white px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-lime-500">
                {f.k}
              </dt>
              <dd className="mt-1 font-medium text-sea-900">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 운영 방식 */}
      <section className="container-page pb-4">
        <h2 className="section-title text-2xl sm:text-3xl">이렇게 배웁니다</h2>
        <p className="section-sub">
          이론 → 지상 훈련 → 바다 실습. 몸이 준비된 만큼만 바다로 들어가니 안전합니다.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {METHODS.map((m) => (
            <div key={m.title} className="card ring-lime-100">
              <div className="text-2xl">{m.icon}</div>
              <h3 className="mt-2 font-bold text-lime-800">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sea-700">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3일 커리큘럼 */}
      <section id="schedule" className="container-page py-12 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl">3일 커리큘럼</h2>
        <p className="section-sub">친해지기 → 타기 → 혼자 타기. 하루에 한 단계씩 올라갑니다.</p>

        <div className="mt-8 space-y-8">
          {DAYS.map((day) => (
            <div key={day.label} className="card ring-lime-100">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-full bg-lime-600 px-3 py-1 text-xs font-bold text-white">
                  {day.label}
                </span>
                <h3 className="text-xl font-bold text-lime-800">{day.theme}</h3>
              </div>
              <p className="mt-2 text-sm text-sea-700">{day.summary}</p>
              <ul className="mt-5 space-y-4">
                {day.sessions.map((s) => (
                  <li key={s.title} className="border-l-2 border-lime-200 pl-4">
                    <p className="font-medium text-sea-900">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-sea-700">{s.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 준비물 · 안전 */}
      <section className="container-page pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card ring-lime-100">
            <h2 className="font-bold text-lime-800 text-lg">준비물</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 레쉬가드 또는 웻수트 (물에 젖어도 되는 옷)</li>
              <li>• 여벌 옷·수건·세면도구, 개인 상비약</li>
              <li>• 자외선 차단제, 아쿠아슈즈(선택)</li>
              <li className="text-lime-700">
                · 스킴보드·서프스케이트·밸런스보드 등 장비는 캠프에서 대여합니다.
              </li>
            </ul>
          </div>
          <div className="card bg-lime-50 ring-lime-200">
            <h2 className="font-bold text-lime-800 text-lg">안전이 먼저입니다</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-800">
              <li>• 첫 시간에 RDS·안전 교육을 하고, 자세가 준비된 만큼만 바다로 들어갑니다.</li>
              <li>• 응급조치가 가능한 안전요원이 상시 배치됩니다.</li>
              <li>• 참가 전 보호자 동의서(면책동의서)를 받습니다.</li>
              <li>• 우천 시 실내에서 서프스케이트로, 물때에 따라 순서를 바꿔 진행합니다.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 참가 신청 */}
      <section id="apply" className="container-page pb-20 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl text-lime-800">참가 신청</h2>
        <p className="section-sub">
          개설 일정·정원·참가비는 준비되는 대로 안내드립니다. 아래에 신청 정보를 남겨 주시면
          운영진이 연락드립니다. 미성년자는 보호자 정보와 동의가 필요합니다.
        </p>
        <div className="mt-8">
          <CampApplicationForm
            program="teen"
            programLabel="연두교실 · 청소년 스킴보드 캠프"
            accent={ACCENT}
          />
        </div>
        <p className="mt-6 text-xs text-sea-600">
          신청 내용은 프로그램 운영·안전관리 목적으로만 사용합니다. 다른 교실이 궁금하시면{" "}
          <Link href="/village-school" className="underline hover:text-lime-800">
            마을학교 안내
          </Link>
          로 돌아가세요.
        </p>
      </section>
    </>
  );
}
