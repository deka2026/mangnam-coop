import type { Metadata } from "next";
import Link from "next/link";
import StayForm from "./StayForm";

export const metadata: Metadata = {
  title: "별달물멍잠자리 | 망남마을협동조합",
  description:
    "별멍·달멍·물멍 하고 하룻밤 자고 가세요. 마을의 빈집을 정비한 망남의 숙소 — 하룻밤 5만원, 여러 날 6박 20만원, 한달쯤 30일 40만원.",
};

export default function Page() {
  return (
    <>
      <section className="bg-sea-50 border-b border-sea-100">
        <div className="container-page py-16">
          <p className="text-sea-600 font-semibold">마을 사업</p>
          <h1 className="mt-2 section-title">🌌 별달물멍잠자리</h1>
          <p className="section-sub">
            별멍·달멍·물멍 하다가 그대로 하룻밤 자고 가세요. 마을의 빈집을 협동조합이
            정비한 망남의 숙소입니다. 하룻밤도, 여러 날도, 한 달 살기도 — 머무는 만큼만
            내면 됩니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="section-title text-2xl sm:text-3xl">얼마나 머무시겠어요?</h2>
        <p className="section-sub">
          기간 버튼을 고르고 신청 정보를 남기면 접수 즉시 운영진에게 전달됩니다.
          빈 방 확인 후 예약 확정 연락을 드립니다.
        </p>
        <div className="mt-8">
          <StayForm />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card bg-earth-50 ring-earth-200">
            <h2 className="font-bold text-sea-800 text-lg">머무는 동안</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 밤에는 <Link href="/mulmeong" className="underline hover:text-sea-900">별달물멍 스팟</Link>에서 별과 밤바다를,</li>
              <li>• 아침에는 <Link href="/plogging" className="underline hover:text-sea-900">해변 플로깅</Link>으로 마을과 함께,</li>
              <li>• 끼니는 <Link href="/business/village-store" className="underline hover:text-sea-900">마을식당</Link>에서 전복 한 상을.</li>
            </ul>
          </div>
          <div className="card">
            <h2 className="font-bold text-sea-800 text-lg">안내</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-sea-700">
              <li>• 요금: 하룻밤 5만원 · 여러 날 6박 20만원 · 한달쯤 30일 40만원</li>
              <li>• 객실 사정에 따라 희망일이 조정될 수 있습니다 (확정 연락 시 안내).</li>
              <li>• 결제는 예약 확정 후 안내드리는 방법으로 진행합니다.</li>
              <li>• 빈집을 내놓으실 소유주도 <Link href="/contact" className="underline hover:text-sea-900">문의 페이지</Link>로 연락 주세요.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
