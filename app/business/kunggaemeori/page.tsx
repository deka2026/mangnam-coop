import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "큰개머리 낚시산장 | 망남마을협동조합",
  description: "완도 큰개머리의 바다 자원을 살린 낚시·체류형 관광으로 마을에 방문객을 부릅니다.",
};

export default function Page() {
  return (
    <>
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">마을 사업</p>
          <h1 className="mt-2 section-title">큰개머리 낚시산장</h1>
          <p className="section-sub">
            망남마을의 대표 관광자원인 큰개머리 일대의 바다를 살려, 낚시와 바다 체험을 중심으로 한
            체류형 관광 거점을 만듭니다. 방문객의 소비가 마을 소득으로 이어지도록 설계합니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-bold text-sea-800 text-lg">🎣 낚시 체험</h2>
          <p className="mt-2 text-sm text-sea-700">
            큰개머리 갯바위·선상 낚시 등 완도 바다의 손맛을 즐기는 프로그램을 준비합니다.
          </p>
        </div>
        <div className="card">
          <h2 className="font-bold text-sea-800 text-lg">🏕️ 체류·먹거리</h2>
          <p className="mt-2 text-sm text-sea-700">
            낚시산장 숙박과 마을식당의 전복 먹거리를 연계해, 하루 이상 머무는 관광으로 잇습니다.
          </p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="card bg-earth-50 ring-earth-200">
          <p className="text-sm text-sea-700">
            📌 운영 시설·예약·이용요금은 조성이 마무리되는 대로 안내할 예정입니다.
          </p>
        </div>
      </section>
    </>
  );
}
