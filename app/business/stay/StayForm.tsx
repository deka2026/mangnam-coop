"use client";

import { useState } from "react";

/* 별달물멍잠자리 숙박 신청 폼.
   요금제 버튼을 고르면 아래 폼에 반영되고, 접수는 자체서버 /api/applications 로
   저장되어 운영진 텔레그램 알림방으로 즉시 전달된다. */

const PLANS = [
  { id: "one-night", icon: "🌙", name: "하룻밤", detail: "1박", price: "50,000원" },
  { id: "several", icon: "🌊", name: "여러 날", detail: "6박", price: "200,000원" },
  { id: "month", icon: "🏡", name: "한달쯤", detail: "30일", price: "400,000원" },
];

export default function StayForm() {
  const [plan, setPlan] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkin, setCheckin] = useState("");
  const [people, setPeople] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const selected = PLANS.find((p) => p.id === plan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setError("머무실 기간(하룻밤 / 여러 날 / 한달쯤)을 먼저 골라 주세요.");
    if (!name.trim()) return setError("성함을 입력해 주세요.");
    if (!/^[0-9\-+() ]{9,}$/.test(phone.trim()))
      return setError("연락 가능한 전화번호를 입력해 주세요. (예: 010-1234-5678)");
    if (!consent) return setError("개인정보 수집·이용에 동의해 주세요.");
    setError("");
    setState("sending");
    const detailsText = [
      `요금제: ${selected.name} (${selected.detail} · ${selected.price})`,
      checkin ? `입실 희망일: ${checkin}` : null,
      people.trim() ? `인원: ${people.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          site: "mangnam-coop",
          program: "stay",
          programLabel: "별달물멍잠자리 숙박 신청",
          name: name.trim(),
          phone: phone.trim(),
          detailsText,
          note: note.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="card bg-sea-50 ring-sea-200">
        <h3 className="font-bold text-sea-800 text-lg">✅ 숙박 신청이 접수되었습니다</h3>
        <p className="mt-2 text-sm text-sea-700">
          운영진에게 실시간으로 전달되었습니다. 빈 방 확인 후 남겨주신 연락처로 예약 확정과
          입금 안내를 드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 요금제 선택 버튼 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setPlan(p.id); setError(""); }}
            aria-pressed={plan === p.id}
            className={`card text-left transition-all ${
              plan === p.id
                ? "ring-2 ring-sea-500 bg-sea-50"
                : "hover:ring-sea-300"
            }`}
          >
            <div className="text-2xl">{p.icon}</div>
            <h3 className="mt-2 font-bold text-sea-800">{p.name}</h3>
            <p className="mt-1 text-sm text-sea-600">{p.detail}</p>
            <p className="mt-2 text-lg font-bold text-sea-900">{p.price}</p>
            <p className={`mt-2 text-xs font-semibold ${plan === p.id ? "text-sea-600" : "text-sea-400"}`}>
              {plan === p.id ? "✓ 선택됨" : "선택하기"}
            </p>
          </button>
        ))}
      </div>

      {/* 신청 정보 */}
      <div className="card mt-6">
        <h3 className="font-bold text-sea-800 text-lg">
          숙박 신청 {selected && <span className="ml-1 rounded-full bg-sea-100 px-2.5 py-0.5 text-sm font-semibold text-sea-700">{selected.name} · {selected.price}</span>}
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-sea-800">성함 *</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
              className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none" />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-sea-800">연락처 *</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678"
              className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none" />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-sea-800">입실 희망일</span>
            <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)}
              className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none" />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-sea-800">인원</span>
            <input type="text" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="예: 2명"
              className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none" />
          </label>
        </div>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-sea-800">요청·문의 사항</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder="함께 오시는 분, 필요한 것 등을 자유롭게 적어 주세요."
            className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none" />
        </label>
        <label className="mt-4 flex items-start gap-2 text-sm text-sea-700 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
          <span>
            (필수) 신청 처리를 위한 개인정보(성함·연락처·신청 내용) 수집·이용에 동의합니다.
            수집 목적 달성 후 지체 없이 파기합니다.
          </span>
        </label>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        {state === "error" && (
          <p className="mt-3 text-sm font-medium text-red-600">
            접수 서버에 연결하지 못했습니다. 잠시 후 다시 시도하시거나 문의 페이지를 이용해 주세요.
          </p>
        )}
        <button type="submit" disabled={state === "sending"} className="btn-primary mt-5 disabled:opacity-60">
          {state === "sending" ? "접수 중…" : "숙박 신청하기"}
        </button>
      </div>
    </form>
  );
}
