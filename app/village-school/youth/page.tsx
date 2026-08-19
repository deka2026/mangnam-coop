import type { Metadata } from "next";
import Link from "next/link";
import { DAYS } from "../data";
import ApplicationForm from "../ApplicationForm";

export const metadata: Metadata = {
  title: "파란교실 (청년) | 망남마을학교",
  description:
    "섬에서 다시 시작하는 3박 4일. 청년을 위한 완도 망남마을의 회복·커뮤니티·취창업 평생교육 프로그램.",
};

const PILLARS = [
  {
    icon: "🌊",
    title: "회복",
    body: "도시에서 멀리 떨어진 완도의 섬마을. 당일 복귀가 불가능한 거리가 도시의 일상과 완전히 분리된 4일을 만듭니다. 1인 1침상, 말하지 않아도 되는 시간이 매일 있습니다.",
  },
  {
    icon: "🤝",
    title: "커뮤니티 활동력",
    body: "자기 이야기부터 시키지 않습니다. 전복을 나르고 밥을 짓는 공동 노동이 먼저 오고, 말은 그다음에 나옵니다. 마을에 실제로 남는 일을 합니다.",
  },
  {
    icon: "🧭",
    title: "취창업 역량",
    body: "생산비 22,000원짜리 전복이 18,000원에 팔리는 구조를 직접 계산합니다. 원가와 가격이 눈앞에 있는 학습, 그 위에서 만드는 사업 프로토타입.",
  },
];

const FACTS = [
  { k: "기간", v: "3박 4일 (화~금)" },
  { k: "장소", v: "전남 완도군 완도읍 망남리" },
  { k: "모집", v: "1기 20명 (개인별 신청)" },
  { k: "대상", v: "만 19~39세 청년" },
  { k: "참가비", v: "무료 (숙박·식사 전액 지원)" },
  { k: "집결", v: "첫날 오후 3시 · 완도 망남리 현장" },
];

export default function Page() {
  return (
    <>
      {/* 히어로 */}
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sm text-sea-500">
            <Link href="/village-school" className="hover:text-sea-800">망남마을학교</Link>
            <span className="mx-1.5">›</span>
            <span className="font-semibold text-sea-700">🌊 파란교실 · 청년</span>
          </p>
          <p className="mt-3 text-sea-600 font-semibold">망남마을학교 · 평생교육 프로그램</p>
          <h1 className="mt-2 section-title">
            섬에서 다시 시작하는 3박 4일
          </h1>
          <p className="mt-3 text-xl font-semibold text-sea-700">나에게로, 망남</p>
          <p className="section-sub">
            멈춰 선 청년과 비어 가는 마을이 서로의 자리를 만들어 주는 나흘입니다.
            회복은 혼자 하는 일이 아니라, 어딘가에 내 몫이 생길 때 일어납니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#apply" className="btn-primary">
              참가 신청하기
            </a>
            <a href="#schedule" className="btn-outline">
              4일 일정 보기
            </a>
          </div>
        </div>
      </section>

      {/* 한눈에 */}
      <section className="container-page py-12">
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-sea-100 ring-1 ring-sea-100 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.k} className="bg-white px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-sea-400">
                {f.k}
              </dt>
              <dd className="mt-1 font-medium text-sea-900">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 왜 완도 망남리인가 */}
      <section className="container-page pb-4">
        <h2 className="section-title text-2xl sm:text-3xl">왜 망남리인가</h2>
        <p className="section-sub">
          도시의 많은 청년에게 부족한 것은
          프로그램의 수가 아니라, 프로그램과 프로그램 사이를 건너게 해 줄 관계와 장소입니다.
          망남리에는 정반대의 결핍이 있습니다. 81세대 145명이 사는 이 마을은 10년 사이 인구가
          29% 줄었고, 완도읍 전복의 80%를 생산하면서도 적자를 봅니다.
          <strong className="text-sea-900">
            {" "}이 마을에 부족한 것은 자원이 아니라 그 자원과 함께 움직일 사람입니다.
          </strong>
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="card">
              <div className="text-2xl">{p.icon}</div>
              <h3 className="mt-2 font-bold text-sea-800">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sea-700">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 설계 원칙 */}
      <section className="container-page py-12">
        <div className="card bg-earth-50 ring-earth-200">
          <h2 className="font-bold text-sea-900 text-lg">
            빠질 수 있어야 참여할 수 있습니다
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-sea-800">
            <li>
              <strong>모든 세션에 빠질 권리가 있습니다.</strong> 신청서에서 미리 골라 둔
              프로그램은 대체 활동(혼자 걷기·전망쉼터 휴식·마을카페)으로 자동 전환됩니다.
              이유를 설명하지 않으셔도 됩니다.
            </li>
            <li>
              <strong>말하지 않아도 되는 시간이 매일 있습니다.</strong> 감정을 나누는 자리는
              하루 한 번을 넘기지 않고, 침묵 산책과 자유시간을 매일 확보합니다.
            </li>
            <li>
              <strong>혼자 잘 수 있습니다.</strong> 1인 1침상이 기본이며, 1인실이 필요하다고
              적어 주시면 우선 배정합니다.
            </li>
            <li>
              <strong>안전이 먼저입니다.</strong> 신청 후 간단한 사전 검사를 안내드립니다.
              전문적인 치료가 우선 필요한 상태로 확인되면, 원거리 합숙 대신 거주지 인근의
              정신건강복지센터·전문기관 연계를 먼저 도와드립니다.
            </li>
          </ul>
        </div>
      </section>

      {/* 4일 일정 */}
      <section id="schedule" className="container-page py-8 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl">4일 일정</h2>
        <p className="section-sub">
          닿다 → 배우다 → 만들다 → 잇다. 회복에서 시작해 마을에서의 역할을 거쳐,
          끊기지 않는 연결로 마무리합니다.
        </p>

        <div className="mt-8 space-y-8">
          {DAYS.map((day) => (
            <div key={day.no} className="card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-full bg-sea-600 px-3 py-1 text-xs font-bold text-white">
                  {day.label}
                </span>
                <h3 className="text-xl font-bold text-sea-800">{day.theme}</h3>
              </div>
              <p className="mt-2 text-sm text-sea-700">{day.summary}</p>

              <ul className="mt-5 space-y-4">
                {day.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="grid gap-1 border-l-2 border-sea-100 pl-4 sm:grid-cols-[4.5rem_1fr] sm:gap-4"
                  >
                    <span className="text-sm font-semibold text-sea-500">{s.time}</span>
                    <div>
                      <p className="font-medium text-sea-900">
                        {s.title}
                        {s.optional && (
                          <span className="ml-2 rounded bg-earth-100 px-1.5 py-0.5 text-xs font-normal text-earth-700">
                            선택
                          </span>
                        )}
                      </p>
                      {s.desc && (
                        <p className="mt-0.5 text-sm leading-relaxed text-sea-700">{s.desc}</p>
                      )}
                      {s.place && (
                        <p className="mt-0.5 text-xs text-sea-500">📍 {s.place}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 사후관리 */}
      <section className="container-page py-12">
        <h2 className="section-title text-2xl sm:text-3xl">돌아간 뒤 3개월</h2>
        <p className="section-sub">
          프로그램은 4일에 끝나지만 관계는 3개월 이어집니다. 마을살이 짝꿍과 코디네이터가
          안부를 확인하고, 2주 이상 연락이 끊기면 먼저 다시 연결합니다.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="font-bold text-sea-800">종료 직후 1주</p>
            <p className="mt-1 text-sm text-sea-700">
              사후 설문, 마을에서 찍은 기록물 공유, 기수 채팅방 유지
            </p>
          </div>
          <div className="card">
            <p className="font-bold text-sea-800">매월 1회 · 3회</p>
            <p className="mt-1 text-sm text-sea-700">
              온라인 회고 모임, 각자 적어 간 3개월 실천 계획 점검
            </p>
          </div>
          <div className="card">
            <p className="font-bold text-sea-800">상시</p>
            <p className="mt-1 text-sm text-sea-700">
              짝꿍의 안부 확인. 필요하면 청년미래센터·정신건강복지센터로 함께 연결
            </p>
          </div>
        </div>
      </section>

      {/* 마을이 얻는 것 */}
      <section className="container-page pb-12">
        <div className="card">
          <h2 className="font-bold text-sea-900 text-lg">마을에도 남는 것이 있습니다</h2>
          <p className="mt-3 text-sm leading-relaxed text-sea-700">
            이 프로그램의 지출은 대부분 마을 안에서 일어납니다. 숙박비와 식비는 마을 민박과
            마을식당으로, 강사료는 어촌계·새마을회 주민에게 직접 갑니다. 협동조합 운영수익의
            10%는 마을기금으로 적립되어 다시 마을학교 운영비가 됩니다. 참가자는 떠나는 손님이
            아니라 <strong className="text-sea-900">망남 관계인구</strong>로 등록되고,
            프로그램을 이끈 주민은 <strong className="text-sea-900">마을지도사</strong>가
            됩니다.
          </p>
          <p className="mt-3 text-sm text-sea-700">
            어촌신활력증진사업 기본계획의 S/W 사업 &mdash;{" "}
            <span className="font-medium">B1 망남 건강관리실</span>,{" "}
            <span className="font-medium">B2 망남 마을학교</span>,{" "}
            <span className="font-medium">B3 생산자 주도 유통체계</span> &mdash; 를 실제 운영으로
            연결하는 첫 기수입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {[
              "교육문화스테이션",
              "망남활력스테이션",
              "망남리복지센터",
              "마을식당·편의점",
              "큰개머리 낚시산장",
              "빈집임대",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full bg-sea-50 px-3 py-1 font-medium text-sea-700 ring-1 ring-sea-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 신청 */}
      <section id="apply" className="container-page pb-20 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl">참가 신청</h2>
        <p className="section-sub">
          개인별로 신청합니다. 미리 알려 주시는 내용이 많을수록 4일이 편안해집니다.
          하기 싫은 것을 적는 칸이 하고 싶은 것을 적는 칸만큼 중요합니다.
        </p>
        <div className="mt-8">
          <ApplicationForm />
        </div>
        <p className="mt-6 text-xs text-sea-600">
          신청 내용은 프로그램 운영·안전관리 목적으로만 사용하며, 사업 종료 후 3개월 이내에
          파기합니다. 문의는{" "}
          <Link href="/contact" className="underline hover:text-sea-900">
            문의·제휴 페이지
          </Link>
          로 주세요.
        </p>
      </section>
    </>
  );
}
