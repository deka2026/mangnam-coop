import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마을식당·편의점 | 망남마을협동조합",
  description: "망남마을 주민·방문객·전복양식 노동자가 함께 이용하는 마을 공동 식당과 생활편의점.",
};

export default function Page() {
  return (
    <>
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">마을 사업</p>
          <h1 className="mt-2 section-title">마을식당 · 편의점</h1>
          <p className="section-sub">
            생활 인프라가 부족한 어촌 마을에, 주민과 방문객 그리고 전복 양식 현장의 외국인 근로자가
            함께 이용하는 마을 공동 식당과 생활편의점을 운영합니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-bold text-sea-800 text-lg">마을식당</h2>
          <p className="mt-2 text-sm text-sea-700">
            전복 등 지역 수산물을 활용한 건강한 한 끼를 제공합니다. 마을 어르신 공동급식과
            방문객 대상 로컬 식사를 함께 운영해, 돌봄과 소득을 동시에 만듭니다.
          </p>
        </div>
        <div className="card">
          <h2 className="font-bold text-sea-800 text-lg">생활편의점</h2>
          <p className="mt-2 text-sm text-sea-700">
            상점이 없는 생활권의 불편을 해소하는 기본 생필품 편의점입니다. 마을 수익은
            협동조합을 통해 마을기금으로 적립됩니다.
          </p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="card bg-earth-50 ring-earth-200">
          <p className="text-sm text-sea-700">
            📌 운영 시간·위치·메뉴 등 상세 정보는 개설 준비가 마무리되는 대로 안내할 예정입니다.
          </p>
        </div>
      </section>
    </>
  );
}
