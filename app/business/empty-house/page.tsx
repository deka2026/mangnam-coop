import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "빈집임대 | 망남마을협동조합",
  description: "마을의 빈집을 정비해 근로자 숙소·체류형 관광·귀어귀촌 정착 공간으로 다시 잇습니다.",
};

export default function Page() {
  return (
    <>
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">마을 사업</p>
          <h1 className="mt-2 section-title">빈집임대</h1>
          <p className="section-sub">
            인구 감소로 늘어난 마을의 빈집을 협동조합이 정비·중개해, 비어 있던 공간을 다시
            사람이 사는 공간으로 되살립니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14 grid gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="text-2xl">🛏️</div>
          <h2 className="mt-2 font-bold text-sea-800">근로자 숙소</h2>
          <p className="mt-1 text-sm text-sea-700">전복 양식 외국인 근로자의 안정적 주거를 마을 안에서 해결합니다.</p>
        </div>
        <div className="card">
          <div className="text-2xl">🧳</div>
          <h2 className="mt-2 font-bold text-sea-800">체류형 관광</h2>
          <p className="mt-1 text-sm text-sea-700">한 달 살기·워케이션 등 방문객이 머무는 체류형 관광 공간으로 활용합니다.</p>
        </div>
        <div className="card">
          <div className="text-2xl">🌱</div>
          <h2 className="mt-2 font-bold text-sea-800">귀어귀촌 정착</h2>
          <p className="mt-1 text-sm text-sea-700">마을에 새로 들어오는 이들의 첫 정착 공간을 제공합니다.</p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="card bg-earth-50 ring-earth-200">
          <p className="text-sm text-sea-700">
            📌 빈집을 내놓으실 소유주, 임대를 원하시는 분 모두 문의 페이지로 연락 주세요.
            매물 목록·임대 조건은 정비 진행에 따라 순차 공개할 예정입니다.
          </p>
        </div>
      </section>
    </>
  );
}
