import Link from "next/link";

const businesses = [
  {
    href: "/business/village-store",
    icon: "🍚",
    title: "마을식당·편의점",
    desc: "주민과 방문객, 전복양식 노동자가 함께 이용하는 마을 공동 식당과 생활편의점을 운영합니다.",
  },
  {
    href: "/business/empty-house",
    icon: "🏠",
    title: "빈집임대",
    desc: "마을의 빈집을 정비해 근로자 숙소·체류형 관광·귀어귀촌 정착 공간으로 다시 잇습니다.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sea-50 to-earth-50">
        <div className="container-page py-20 sm:py-28">
          <p className="text-sea-600 font-semibold">완도 망남마을 · 어촌신활력증진사업</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-sea-900 leading-tight">
            전복의 마을,<br />
            <span className="text-sea-600">망남</span>의 지속가능한 마을경제
          </h1>
          <p className="mt-5 text-lg text-sea-700 max-w-2xl">
            망남마을협동조합은 완도 망남생활권 주민이 함께 소유하고 함께 나누는 마을 자립 조직입니다.
            식당·편의점, 빈집임대, 마을학교 등 생활밀착형 사업으로
            마을에 일자리와 활력을 만듭니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/donation" className="btn-primary">고향사랑기부로 함께하기</Link>
            <Link href="/business/village-store" className="btn-outline">마을 사업 둘러보기</Link>
          </div>
        </div>
      </section>

      {/* 마을 소개 */}
      <section className="container-page py-16">
        <h2 className="section-title">완도읍에서 가장 가까운 전복 생산자 마을</h2>
        <p className="section-sub">
          망남마을은 완도읍 여객터미널에서 차량 5분 거리에 있는 전복 양식 중심의 어촌으로,
          완도읍 전복 생산량의 상당 부분을 담당해 왔습니다. 완도타워·동망산 생태길·큰개머리 등
          풍부한 관광자원을 품고 있으며, 주민이 세운 <strong>망남마을협동조합</strong>을 중심으로
          생산·가공·유통·관광을 잇는 마을경제를 만들어가고 있습니다.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <div className="text-2xl">🐚</div>
            <h3 className="mt-2 font-bold text-sea-800">전복 생산자 마을</h3>
            <p className="mt-1 text-sm text-sea-700">오랜 전복 양식 전통과 공동체 의지를 기반으로 합니다.</p>
          </div>
          <div className="card">
            <div className="text-2xl">📍</div>
            <h3 className="mt-2 font-bold text-sea-800">완도읍 인접</h3>
            <p className="mt-1 text-sm text-sea-700">여객터미널 5분 거리의 지리적 이점을 가진 생활권입니다.</p>
          </div>
          <div className="card">
            <div className="text-2xl">🌊</div>
            <h3 className="mt-2 font-bold text-sea-800">관광 자원</h3>
            <p className="mt-1 text-sm text-sea-700">완도타워·동망산 생태길·큰개머리 등 체류형 관광 잠재력.</p>
          </div>
        </div>
      </section>

      {/* 사업 */}
      <section className="bg-white border-y border-sea-100">
        <div className="container-page py-16">
          <h2 className="section-title">마을 사업</h2>
          <p className="section-sub">주민이 직접 운영하며 소득과 일자리를 마을 안에 남기는 생활밀착형 사업입니다.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {businesses.map((b) => (
              <Link key={b.href} href={b.href} className="card hover:ring-sea-300 transition group">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <h3 className="font-bold text-sea-900 group-hover:text-sea-600">{b.title} →</h3>
                    <p className="mt-1 text-sm text-sea-700">{b.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 마을학교 */}
      <section className="container-page py-16">
        <Link
          href="/village-school"
          className="card group block bg-sea-50 ring-sea-200 transition hover:ring-sea-400"
        >
          <p className="font-semibold text-sea-600">망남마을학교 · 평생교육</p>
          <h2 className="mt-2 text-2xl font-bold text-sea-900 group-hover:text-sea-600 sm:text-3xl">
            세대가 함께 배우는 세 개의 교실 →
          </h2>
          <p className="mt-3 max-w-2xl text-sea-700">
            완도 망남 바다와 마을을 교실 삼아, 청소년·청년·장년이 각자의 자리에서 배웁니다.
            청년 프로그램 파란교실 1기(10/12~10/15, 3박 4일)가 참가자를 모집 중입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {["🌱 연두교실 · 청소년", "🌊 파란교실 · 청년", "🧭 푸른교실 · 장년"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white px-3 py-1 font-medium text-sea-700 ring-1 ring-sea-200"
              >
                {t}
              </span>
            ))}
          </div>
        </Link>
      </section>

      {/* 참여 */}
      <section className="container-page pb-16">
        <h2 className="section-title">마을과 함께하는 방법</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="card">
            <div className="text-2xl">🧹</div>
            <h3 className="mt-2 font-bold text-sea-800">플로깅 신청</h3>
            <p className="mt-1 text-sm text-sea-700">
              망남 해변을 걸으며 쓰레기를 줍는 플로깅. 마을과 바다를 함께 돌보는
              가장 쉬운 참여입니다. 집게·장갑은 마을에서 준비합니다.
            </p>
            <Link href="/plogging" className="mt-4 inline-block text-sea-600 font-medium hover:text-sea-800">신청하기 →</Link>
          </div>
          <div className="card">
            <div className="text-2xl">🌌</div>
            <h3 className="mt-2 font-bold text-sea-800">별달물멍 스팟예약</h3>
            <p className="mt-1 text-sm text-sea-700">
              별멍·달멍·물멍 — 불빛 적은 망남의 밤바다에서 아무것도 하지 않을 자유를.
              조용한 명당을 예약제로 안내합니다.
            </p>
            <Link href="/mulmeong" className="mt-4 inline-block text-sea-600 font-medium hover:text-sea-800">예약하기 →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
