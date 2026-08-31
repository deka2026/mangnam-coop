import type { Metadata } from "next";
import Link from "next/link";
import { DAYS } from "../data";
import ApplicationForm from "../ApplicationForm";

export const metadata: Metadata = {
  title: "파란교실 (청년) | 망남마을학교",
  description:
    "섬과 함께 3박 4일. 청년을 위한 완도 망남마을의 회복·커뮤니티·취창업 평생교육 프로그램.",
};

const PILLARS = [
  {
    icon: "🌊",
    title: "회복",
    body: "도시에서 멀리 떨어진 완도의 섬마을. 도시의 일상과 완전히 분리된 4일을 만듭니다. 혼자 있어도 되는 시간이 매일 있습니다.",
  },
  {
    icon: "🤝",
    title: "커뮤니티 활동력",
    body: "마을을 함께 걷고 밥을 같이 지은 뒤에야, 저녁 밥상에서 네 가지 질문(좋아하는 것·잘하는 것·못하는 것·하기 싫은 것)으로 가볍게 시작합니다.",
  },
  {
    icon: "🧭",
    title: "취창업 역량",
    body: "팀이 원하는 것을 AI로 직접 만들어 봅니다. 온라인 셀러 교육 등 차려진 교육을 선택해서 배웁니다. 배움은 \"이런 일자리가 필요하다\" 네트워크 파티로 이어집니다.",
  },
];

const FACTS = [
  { k: "일정", v: "2026. 9. 28.(월) ~ 10. 1.(목) · 3박 4일" },
  { k: "장소", v: "전남 완도군 완도읍 망남리" },
  { k: "모집", v: "1기 10명 (개인별 신청)" },
  { k: "대상", v: "만 19~39세 청년" },
  { k: "참가비", v: "2만원 (네트워크 파티 음식 준비용 · 불참 시 환불 불가)" },
  { k: "집결", v: "10/12(월) 오후 3시 · 망남리 교육문화스테이션" },
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
            섬과 함께하는 3박 4일
          </h1>
          <p className="mt-3 text-xl font-semibold text-sea-700">나에게로, 망남</p>
          <p className="section-sub">
            마을의 빈자리를 채우며, 서로의 자리를 만들어 주는 나흘입니다.
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
          망남리에는 정반대의 결핍이 있습니다. 청년들이 그 결핍을 채우며 새로운 관계와 머물자리를 만들어갑니다.
          장소에 구애받지 않는 새로운 일거리를 만들어봐요.
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
              <strong>혼자 잘 수 있습니다.</strong> 1인실이 필요하다고
              적어 주시면 우선 배정합니다.
            </li>
            <li>
              <strong>사람이 먼저입니다.</strong> 사전신청에서 참가자에게 필요한 것을 점검하여 준비해 드립니다.
            </li>
          </ul>
        </div>
      </section>

      {/* 4일 일정 */}
      <section id="schedule" className="container-page py-8 scroll-mt-8">
        <h2 className="section-title text-2xl sm:text-3xl">4일 일정</h2>
        <p className="section-sub">
          닿다 → 만들다 → 거닐다 → 잇다. 마을에 닿아 AI로 만들고,
          완도를 거닐고, 끊기지 않는 연결로 마무리합니다.
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
          프로그램은 4일에 끝나지만 관계는 3개월 이어집니다. 기수 단톡방과 코디네이터가
          안부를 확인하고, 청년들의 새로운 발걸음을 같이 합니다.
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
              온라인 회고 모임, 네트워크 파티에서 나온 일자리 아이디어 점검
            </p>
          </div>
          <div className="card">
            <p className="font-bold text-sea-800">상시</p>
            <p className="mt-1 text-sm text-sea-700">
              코디네이터의 안부 확인. 필요하면 사교원의 다음 프로그램·일자리 기회로 연결
            </p>
          </div>
        </div>
      </section>

      {/* 마을이 얻는 것 */}
      <section className="container-page pb-12">
        <div className="card">
          <h2 className="font-bold text-sea-900 text-lg">마을에도 남는 것이 있습니다</h2>
          <p className="mt-3 text-sm leading-relaxed text-sea-700">
            이 프로그램은 대부분 마을 안에서 진행됩니다. 
            하루의 자유여행은 무료 마을버스와 완도군 여행할인 제도를 활용할 수 있습니다.
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

        {/* 신청 절차 */}
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          <li className="card">
            <p className="text-sm font-semibold text-sea-500">STEP 1 <span className="ml-1 rounded-full bg-sea-100 px-2 py-0.5 text-xs font-bold text-sea-700">9/18(금)까지</span></p>
            <h3 className="mt-1 font-bold text-sea-900">참가 신청서 작성</h3>
            <p className="mt-2 text-sm leading-relaxed text-sea-700">
              제시한 일정에 참여 가능할 경우 작성하세요. 이름·전화번호·이메일,
              원하는 프로그램(스킴보드 강습, 해안로 탐방, AI 교육, 온라인셀러 교육,
              취창업 교육, 완도 자유여행 등), 제안한 일정 참가 여부, 인천–완도 고속버스
              여행 가능 여부(버스 왕복예매권 제공)를 적습니다. 참가비는 2만원입니다
              (네트워크 파티 음식 준비용, 불참 시 환불 불가).
            </p>
          </li>
          <li className="card">
            <p className="text-sm font-semibold text-sea-500">STEP 2 <span className="ml-1 rounded-full bg-sea-100 px-2 py-0.5 text-xs font-bold text-sea-700">9/23(수)까지</span></p>
            <h3 className="mt-1 font-bold text-sea-900">개별 전화 인터뷰</h3>
            <p className="mt-2 text-sm leading-relaxed text-sea-700">
              제안하는 프로그램에 대한 선호도 조사와, 개인별 특성을 고려한
              주최측 준비를 위한 인터뷰를 진행합니다.
            </p>
          </li>
          <li className="card">
            <p className="text-sm font-semibold text-sea-500">STEP 3 <span className="ml-1 rounded-full bg-sea-100 px-2 py-0.5 text-xs font-bold text-sea-700">9/30(수)까지</span></p>
            <h3 className="mt-1 font-bold text-sea-900">최종 참가 통보 및 안내</h3>
            <p className="mt-2 text-sm leading-relaxed text-sea-700">
              개인별 특성을 고려하여 현지 사정으로 적절한 준비를 할 수 없는
              경우에는 참가 불가를 안내드립니다.
            </p>
          </li>
        </ol>

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
