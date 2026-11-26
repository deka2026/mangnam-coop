import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <p className="text-4xl" aria-hidden>🌊</p>
      <h1 className="mt-4 section-title">찾으시는 페이지가 없습니다</h1>
      <p className="mt-3 text-sea-700">주소를 다시 확인해 주세요.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">망남마을협동조합 홈으로</Link>
    </section>
  );
}
