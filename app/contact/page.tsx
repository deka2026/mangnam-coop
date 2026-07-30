import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의·제휴 | 망남마을협동조합",
  description: "망남마을협동조합 사업·제휴·후원 문의 안내.",
};

export default function Page() {
  return (
    <>
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">문의</p>
          <h1 className="mt-2 section-title">문의 · 제휴</h1>
          <p className="section-sub">
            마을 사업 이용, 빈집·인력 제휴, 기부·펀딩, 취재 등 어떤 문의든 환영합니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-bold text-sea-800 text-lg">망남마을협동조합</h2>
          <p className="mt-2 text-sm text-sea-700">전남광주통합특별시 완도군 완도읍 망남리</p>
          <p className="mt-1 text-sm text-sea-700">완도 망남생활권 어촌신활력증진사업 마을 조직</p>
          <p className="mt-3 text-xs text-sea-600">※ 대표 연락처·이메일은 확정 후 안내 예정입니다.</p>
        </div>
        <div className="card">
          <h2 className="font-bold text-sea-800 text-lg">지금 문의하기</h2>
          <p className="mt-2 text-sm text-sea-700">
            공식 문의 창구가 준비되는 동안에는, 앵커 조직인 <strong>사회혁신교육원</strong> 홈페이지의
            문의 폼으로 연락 주시면 마을로 전달됩니다.
          </p>
          <a
            href="https://sakyowon.poomasi.org/#/contact"
            target="_blank"
            rel="noopener"
            className="btn-primary mt-4"
          >
            사교원 홈페이지에서 문의 →
          </a>
        </div>
      </section>
    </>
  );
}
