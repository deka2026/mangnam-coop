import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "고향사랑기부 | 망남마을협동조합",
  description: "고향사랑기부제로 망남마을을 후원하고, 세액공제와 답례품 혜택을 받으세요.",
};

export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-b from-sea-50 to-white border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">참여하기</p>
          <h1 className="mt-2 section-title">고향사랑지정기부</h1>
          <p className="section-sub">
            고향사랑기부제를 통해 망남마을을 후원할 수 있습니다. 기부금은 마을식당·돌봄·관광 등
            마을공동체 사업에 쓰이며, 기부자는 세액공제와 답례품 혜택을 받습니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="card">
            <div className="text-2xl">🧾</div>
            <h2 className="mt-2 font-bold text-sea-800">세액공제</h2>
            <p className="mt-1 text-sm text-sea-700">연간 기부금 10만원까지 전액, 초과분은 일정 비율 세액공제(관련 법령 기준).</p>
          </div>
          <div className="card">
            <div className="text-2xl">🎁</div>
            <h2 className="mt-2 font-bold text-sea-800">답례품</h2>
            <p className="mt-1 text-sm text-sea-700">기부액의 일정 범위 내에서 망남 전복 등 지역 답례품을 받습니다.</p>
          </div>
          <div className="card">
            <div className="text-2xl">🏘️</div>
            <h2 className="mt-2 font-bold text-sea-800">마을에 쓰임</h2>
            <p className="mt-1 text-sm text-sea-700">모인 기부금은 마을공동체 사업의 재원으로 투명하게 운영됩니다.</p>
          </div>
        </div>

        <div className="mt-10 card bg-earth-50 ring-earth-200">
          <h2 className="font-bold text-sea-800">기부 방법</h2>
          <p className="mt-2 text-sm text-sea-700">
            고향사랑기부는 <strong>고향사랑e음</strong> 등 공식 기부 창구를 통해 완도군에 기부하며
            망남마을 사업을 지정할 수 있습니다. 지정기부금단체 등록 및 지정기부 연계 절차가 진행 중이며,
            공식 기부 링크와 답례품 구성은 확정되는 대로 이 페이지에 안내합니다.
          </p>
          <p className="mt-3 text-xs text-sea-600">※ 구체적 기부 채널·답례품·계좌 정보는 확정 후 공개 예정입니다.</p>
        </div>
      </section>
    </>
  );
}
