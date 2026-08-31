import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "푸른교실 · 양성과정 | 망남마을학교",
  description:
    "배운 것을 가르치고, 마을을 이끄는 사람이 되는 푸른교실. 스킴보드 강사양성 과정(9/12~13)과 햇빛소득마을 컨설턴트 양성 교육(9/19~20), 두 개의 양성과정으로 운영합니다.",
};

/* ── 과정 1: 스킴보드 강사양성 과정 (9/12~13) ── */
const COACH_FACTS = [
  { k: "일정", v: "9월 12일(토) ~ 13일(일) · 09:30~18:00" },
  { k: "장소", v: "완도 망남 한뼘해변 (실내강습장·특판장, 화장실·샤워실)" },
  { k: "대상", v: "장년 · 강사를 준비하는 성인" },
  { k: "정원", v: "강사 1명당 6명 기준" },
  { k: "수료", v: "수료 기준 충족 시 수료증 수여" },
  { k: "참가비", v: "추후 공지 · 문의 접수" },
];

const COACH_DAYS = [
  {
    label: "1일차 · 9/12(토)",
    theme: "플랫랜드 — 기초·레벨업과 교수법",
    sessions: [
      { time: "09:30", title: "오리엔테이션", desc: "프로그램 소개 / 팀 나누기" },
      { time: "10:00", title: "스킴보드 이론", desc: "스킴보드 소개 / RDS / 안전교육 — 과정 소개와 수료 기준 안내" },
      { time: "10:30", title: "지상훈련", desc: "밸런스보드 / Slide 자세 연습 (해변 이동)" },
      { time: "11:00", title: "플랫랜드 스킴보딩 Ⅰ", desc: "RDS 기초" },
      { time: "13:00", title: "플랫랜드 스킴보딩 Ⅱ", desc: "RDS 런 레벨업" },
      { time: "14:00", title: "스킴 미션", desc: "비거리 늘리기" },
      { time: "15:00", title: "자유 스킴", desc: "개별 피드백" },
      { time: "16:00", title: "교수법 훈련", desc: "강사 강평·질의응답 (실내강습장)" },
    ],
  },
  {
    label: "2일차 · 9/13(일)",
    theme: "서프 — 파도타기와 수료",
    sessions: [
      { time: "09:30", title: "워밍업", desc: "전날 복습 / 준비운동" },
      { time: "10:00", title: "지상훈련", desc: "엣지 턴 이론 / 서프스케이트 — 부상 예방·응급처치 절차" },
      { time: "11:00", title: "서프 스킴보딩 Ⅰ", desc: "사선라이딩 / 엣지 턴 (해변 이동)" },
      { time: "13:00", title: "서프 스킴보딩 Ⅱ", desc: "파도 보는 법 / 파도타기" },
      { time: "14:00", title: "자유 스킴", desc: "개별 피드백" },
      { time: "15:00", title: "서프 스킴보딩 Ⅲ", desc: "Reaching Wave" },
      { time: "17:00", title: "수료식", desc: "수료증 수여, 현장 정리" },
    ],
  },
];

/* ── 과정 2: 햇빛소득마을 컨설턴트 양성 교육 (9/19~20) ── */
const CONSULT_FACTS = [
  { k: "일정", v: "9월 19일(토) ~ 20일(일)" },
  { k: "장소", v: "망남특판장 2층 교육장" },
  { k: "대상", v: "마을 사업을 이끌 주민·활동가·실무자" },
  { k: "강사", v: "지성배 강사" },
  { k: "준비물", v: "노트북 (실습용 · Wi-Fi 제공)" },
  { k: "참가비", v: "추후 공지 · 문의 접수" },
];

const CONSULT_DAYS = [
  {
    label: "1일차 · 9/19(토)",
    theme: "햇빛소득마을을 이해하다",
    sessions: [
      { time: "12:30", title: "접수·개회", desc: "참가자 등록, 과정 목표·일정·수료 조건 안내" },
      { time: "13:00", title: "1강 · 햇빛소득마을의 이해와 주민참여", desc: "주민이 주인이 되는 재생에너지 사업의 구조" },
      { time: "15:10", title: "2강 · 사업 추진구조와 핵심 검토사항", desc: "후보지 검토부터 조합 설립까지, 실무에서 챙길 것들" },
      { time: "17:00", title: "저녁식사·네트워킹 파티", desc: "참가자·강사가 함께하는 교류 시간" },
    ],
  },
  {
    label: "2일차 · 9/20(일)",
    theme: "도구를 손에 쥐다 — 실습",
    sessions: [
      { time: "10:00", title: "3강 · SolaNavi 활용 사업 검토 실습", desc: "solanavi.kr로 후보지·사업성을 직접 검토합니다 (노트북 실습)" },
      { time: "13:00", title: "4강 · 마을 실무를 돕는 생성형 AI 활용", desc: "문서 작성·행정 업무에 AI를 쓰는 법 (워크시트 실습)" },
      { time: "15:00", title: "수료식", desc: "수료증 수여, 현장 정리" },
    ],
  },
];

function DayCards({ days }: { days: typeof COACH_DAYS }) {
  return (
    <div className="mt-6 space-y-6">
      {days.map((day) => (
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
  );
}

function FactGrid({ facts }: { facts: typeof COACH_FACTS }) {
  return (
    <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-teal-100 ring-1 ring-teal-100 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map((f) => (
        <div key={f.k} className="bg-white px-5 py-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-teal-500">{f.k}</dt>
          <dd className="mt-1 font-medium text-sea-900">{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Page() {
  return (
    <>
      {/* 히어로 */}
      <section className="bg-teal-50 border-b border-teal-100">
        <div className="container-page py-16">
          <p className="text-sm text-teal-700/70">
            <Link href="/village-school" className="hover:text-teal-800">망남마을학교</Link>
            <span className="mx-1.5">›</span>
            <span className="font-semibold text-teal-700">🧭 푸른교실 · 양성과정</span>
          </p>
          <h1 className="mt-3 section-title text-teal-800">푸른교실 — 두 개의 양성과정</h1>
          <p className="mt-3 text-xl font-semibold text-teal-700">가르치는 사람, 이끄는 사람</p>
          <p className="section-sub">
            푸른교실은 배운 것을 다음 사람에게 전하는 교실입니다. 바다에서는 스킴보드를
            가르치는 <strong>강사</strong>로, 마을에서는 햇빛소득사업을 이끄는{" "}
            <strong>컨설턴트</strong>로 — 9월, 두 개의 양성과정이 열립니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#coach" className="inline-flex items-center justify-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700">
              🏄 강사양성 과정 (9/12~13)
            </a>
            <a href="#consultant" className="inline-flex items-center justify-center rounded-md border border-teal-600 px-5 py-2.5 font-medium text-teal-700 transition-colors hover:bg-teal-100">
              ☀️ 컨설턴트 양성 교육 (9/19~20)
            </a>
          </div>
        </div>
      </section>

      {/* ── 과정 1: 스킴보드 강사양성 ── */}
      <section id="coach" className="container-page py-14 scroll-mt-8">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-500">과정 1</p>
        <h2 className="mt-1 section-title text-2xl sm:text-3xl text-teal-800">
          스킴보드 강사양성 과정
        </h2>
        <p className="section-sub">
          기존 3회차 레벨업 강습을 이틀에 압축한 집중 교육입니다. 지상훈련부터 파도타기,
          그리고 교수법 훈련까지 — 배운 것을 가르치는 마을학교 지도자로 성장합니다.
        </p>
        <FactGrid facts={COACH_FACTS} />
        <DayCards days={COACH_DAYS} />
        <p className="mt-4 text-xs text-sea-500">
          ※ 이틀 과정을 하나로 묶은 수업으로, 부분 참석은 불가합니다.
        </p>

        {/* 준비물 · 안전 */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card ring-teal-100">
            <h3 className="font-bold text-teal-800 text-lg">준비물</h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 레쉬가드 또는 웻수트</li>
              <li>• 여벌 옷·수건·세면도구, 개인 상비약</li>
              <li className="text-teal-700">
                · 스킴보드·서프스케이트·밸런스보드 등 훈련 장비는 과정에서 제공/대여합니다.
              </li>
            </ul>
          </div>
          <div className="card bg-teal-50 ring-teal-200">
            <h3 className="font-bold text-teal-800 text-lg">안전 · 리스크 대응</h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-800">
              <li>• 강풍·해상 상황 기준 초과 시 실내 이론 교육으로 대체</li>
              <li>• 응급조치가 가능한 안전요원 배치, 면책동의서 사전 수령</li>
              <li>• 물때가 맞지 않으면 순서를 변경하여 진행</li>
              <li>• 스킴보드 파손에 대비해 여분의 대여 보드를 준비</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 과정 2: 햇빛소득마을 컨설턴트 ── */}
      <section id="consultant" className="border-t border-teal-100 bg-teal-50/40">
        <div className="container-page py-14 scroll-mt-8">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-500">과정 2</p>
          <h2 className="mt-1 section-title text-2xl sm:text-3xl text-teal-800">
            햇빛소득마을 컨설턴트 양성 교육
          </h2>
          <p className="section-sub">
            마을 주민이 태양광 발전소의 주인이 되는 햇빛소득마을 — 그 사업을 우리 마을에서
            검토하고 이끌 수 있는 사람을 기릅니다. 이론 두 강의와 도구 실습 두 강의,
            그리고 참가자들이 서로를 알아가는 네트워킹까지 이틀 과정입니다.
          </p>
          <FactGrid facts={CONSULT_FACTS} />
          <DayCards days={CONSULT_DAYS} />
          <div className="mt-6 card ring-teal-100">
            <h3 className="font-bold text-teal-800 text-lg">이런 것을 배웁니다</h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 햇빛소득마을 사업의 구조와 주민참여 방식 — 왜 마을이 주인이 되는가</li>
              <li>• 사업 추진 단계별 핵심 검토사항 — 후보지·주민동의·조합 설립</li>
              <li>• <strong>SolaNavi</strong>(solanavi.kr)로 우리 마을 후보지를 직접 검토하는 실습</li>
              <li>• 정관·회의록 같은 마을 실무 문서를 생성형 AI로 작성하는 법</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 과정 신청 */}
      <section id="apply" className="container-page py-14 pb-20 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl text-teal-800">과정 신청</h2>
        <div className="mt-8 card bg-teal-50 ring-teal-200">
          <h3 className="font-bold text-teal-800 text-lg">✅ 신청이 완료되었습니다</h3>
          <p className="mt-2 text-sm leading-relaxed text-sea-800">
            푸른교실 두 과정(스킴보드 강사양성 9/12~13 · 햇빛소득마을 컨설턴트 9/19~20)의
            신청 접수가 완료되었습니다. 참가자분들께는 과정 안내를 개별 연락드립니다.
            다음 기수 소식은 마을학교 안내를 통해 알려드리겠습니다.
          </p>
          <p className="mt-3 text-sm text-sea-700">
            문의가 있으시면 <Link href="/contact" className="underline hover:text-teal-800">문의 페이지</Link>를 이용해 주세요.
          </p>
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
