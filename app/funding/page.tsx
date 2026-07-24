import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "크라우드펀딩 | 망남마을협동조합",
  description: "망남마을이 준비하는 전복 가공품·마을 체험 프로젝트에 함께 투자·후원하세요.",
};

export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-b from-sea-50 to-white border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">참여하기</p>
          <h1 className="mt-2 section-title">크라우드펀딩</h1>
          <p className="section-sub">
            망남마을이 준비하는 프로젝트를 크라우드펀딩으로 함께 만듭니다. 전복 가공품(밀키트·도시락 등)
            개발부터 마을 관광 체험 상품까지, 후원자에게는 리워드로 마을의 산물이 돌아갑니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="section-title text-2xl">준비 중인 프로젝트</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="card">
            <span className="inline-block rounded-full bg-sea-100 text-sea-700 text-xs px-3 py-1">준비 중</span>
            <h3 className="mt-3 font-bold text-sea-800">망남 전복 가공품 개발</h3>
            <p className="mt-1 text-sm text-sea-700">
              규격 외 전복을 활용한 밀키트·도시락 등 HMR 제품을 개발해, 어가 소득과 새로운 판로를 만듭니다.
            </p>
          </div>
          <div className="card">
            <span className="inline-block rounded-full bg-sea-100 text-sea-700 text-xs px-3 py-1">준비 중</span>
            <h3 className="mt-3 font-bold text-sea-800">큰개머리 바다 체험</h3>
            <p className="mt-1 text-sm text-sea-700">
              낚시산장·전복 체험을 묶은 체류형 관광 상품을 펀딩으로 선보이고, 방문객을 마을로 잇습니다.
            </p>
          </div>
        </div>

        <div className="mt-10 card bg-earth-50 ring-earth-200">
          <p className="text-sm text-sea-700">
            📌 펀딩 오픈 일정과 참여 링크(플랫폼)는 프로젝트 준비가 마무리되는 대로 이 페이지에 공개합니다.
            제휴·투자 문의는 문의 페이지로 연락 주세요.
          </p>
        </div>
      </section>
    </>
  );
}
