import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "외국인근로자 인력소개 | 망남마을협동조합",
  description: "전복 양식 현장에 필요한 외국인 근로자를 합법적 절차로 소개하고 정착을 돕습니다.",
};

export default function Page() {
  return (
    <>
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">마을 사업</p>
          <h1 className="mt-2 section-title">외국인근로자 인력소개</h1>
          <p className="section-sub">
            전복 양식은 잠수·중량물 취급 등 노동 강도가 높아 인력 확보가 마을의 핵심 과제입니다.
            망남마을협동조합은 어가와 외국인 근로자를 합법적 절차로 연결하고, 근로자의 마을 정착을 돕습니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14 grid gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="text-2xl">📋</div>
          <h2 className="mt-2 font-bold text-sea-800">합법 절차 안내</h2>
          <p className="mt-1 text-sm text-sea-700">고용허가·체류 관련 절차를 안내하고 어가의 인력 수요와 연결합니다.</p>
        </div>
        <div className="card">
          <div className="text-2xl">🏠</div>
          <h2 className="mt-2 font-bold text-sea-800">정착 지원</h2>
          <p className="mt-1 text-sm text-sea-700">숙소(빈집임대 연계)·생활 편의·마을식당 급식으로 안정적 정착을 돕습니다.</p>
        </div>
        <div className="card">
          <div className="text-2xl">🌏</div>
          <h2 className="mt-2 font-bold text-sea-800">지역 상생</h2>
          <p className="mt-1 text-sm text-sea-700">근로자를 마을 관계인구로 품어 지역 경제·문화의 일원으로 함께합니다.</p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="card bg-earth-50 ring-earth-200">
          <p className="text-sm text-sea-700">
            📌 인력 소개·문의 접수 창구는 준비 중입니다. 어가·기업 제휴 문의는 문의 페이지로 연락 주세요.
          </p>
        </div>
      </section>
    </>
  );
}
