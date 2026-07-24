import type { Metadata } from "next";
import ReservationForm from "./ReservationForm";

export const metadata: Metadata = {
  title: "마을식당·편의점 | 망남마을협동조합",
  description: "망남마을 주민·방문객·전복양식 노동자가 함께 이용하는 마을 공동 식당과 생활편의점.",
};

const STORE_CATEGORIES = [
  {
    title: "식료품",
    icon: "🍚",
    items: "쌀·라면·통조림·조미료·계란 등 기본 식재료",
  },
  {
    title: "음료 · 간식",
    icon: "🥤",
    items: "생수·음료·커피·과자·아이스크림",
  },
  {
    title: "생활용품",
    icon: "🧴",
    items: "세제·휴지·치약·비누 등 생활 위생용품",
  },
  {
    title: "어촌 작업용품",
    icon: "🧤",
    items: "장갑·장화·우비 등 양식장·낚시 현장 소모품",
  },
];

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

      {/* 마을식당 + 예약 */}
      <section className="container-page py-14">
        <h2 className="text-2xl font-bold text-sea-800">🍽 마을식당</h2>
        <p className="mt-2 text-sm text-sea-700 max-w-2xl">
          전복 등 지역 수산물을 활용한 건강한 한 끼를 제공합니다. 마을 어르신 공동급식과
          방문객 대상 로컬 식사를 함께 운영해, 돌봄과 소득을 동시에 만듭니다.
        </p>
        <div className="mt-6">
          <ReservationForm />
        </div>
      </section>

      {/* 생활편의점 */}
      <section className="container-page pb-14">
        <h2 className="text-2xl font-bold text-sea-800">🏪 생활편의점</h2>
        <p className="mt-2 text-sm text-sea-700 max-w-2xl">
          상점이 없는 생활권의 불편을 해소하는 기본 생필품 편의점입니다. 수익은
          협동조합을 통해 마을기금으로 적립됩니다.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STORE_CATEGORIES.map((c) => (
            <div key={c.title} className="card">
              <p className="text-2xl" aria-hidden>{c.icon}</p>
              <h3 className="mt-2 font-bold text-sea-800">{c.title}</h3>
              <p className="mt-1 text-sm text-sea-700">{c.items}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-sea-600">
          ※ 취급 품목은 개점 준비 중인 구성으로, 주민 수요를 반영해 계속 조정됩니다.
        </p>
      </section>

      {/* 이용안내 */}
      <section className="container-page pb-16">
        <h2 className="text-2xl font-bold text-sea-800">ℹ️ 이용안내</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h3 className="font-bold text-sea-800">위치 · 운영시간</h3>
            <ul className="mt-3 space-y-2 text-sm text-sea-700">
              <li>📍 전라남도 완도군 완도읍 망남리 (상세 위치는 개점 시 안내)</li>
              <li>🕒 운영시간·휴무일은 개점 준비가 마무리되는 대로 공지합니다.</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-bold text-sea-800">식당 이용 방법</h3>
            <ul className="mt-3 space-y-2 text-sm text-sea-700">
              <li>1️⃣ 위 예약 폼에 이름·연락처·메뉴·수량을 작성합니다.</li>
              <li>2️⃣ 만들어진 예약 내용을 복사해 문의 폼으로 전달합니다.</li>
              <li>3️⃣ 마을에서 확인 후 예약 확정 연락을 드립니다.</li>
              <li>👥 단체 식사·공동급식은 요청사항에 인원수를 적어 주세요.</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-bold text-sea-800">편의점 이용</h3>
            <ul className="mt-3 space-y-2 text-sm text-sea-700">
              <li>🛒 예약 없이 운영시간 내 자유롭게 이용하실 수 있습니다.</li>
              <li>💳 결제 수단(카드·현금·계좌이체)은 개점 시 안내합니다.</li>
              <li>📦 필요한 품목이 있으면 문의 폼으로 알려 주세요. 입고에 반영합니다.</li>
            </ul>
          </div>
          <div className="card bg-earth-50 ring-earth-200">
            <h3 className="font-bold text-sea-800">문의</h3>
            <p className="mt-3 text-sm text-sea-700">
              대표 전화·이메일은 확정되는 대로 이 페이지에 공지합니다. 그 전까지는
              사회혁신교육원 문의 폼을 통해 연락 주시면 마을로 전달됩니다.
            </p>
            <a
              href="https://sakyowon.poomasi.org/#/contact"
              target="_blank"
              rel="noopener"
              className="btn-outline mt-4"
            >
              문의하기 →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
