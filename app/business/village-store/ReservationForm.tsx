"use client";

import { useMemo, useState } from "react";

const MENU_ITEMS = [
  { id: "jeonbok-juk", name: "전복죽", desc: "완도 전복으로 끓인 대표 보양식" },
  { id: "jeonbok-ttukbaegi", name: "전복해물뚝배기", desc: "전복·제철 해산물 한 냄비" },
  { id: "jeonbok-gui", name: "전복구이 정식", desc: "전복구이와 제철 반찬 한 상" },
  { id: "baekban", name: "오늘의 백반", desc: "그날그날 마을 반찬으로 차리는 한 끼" },
  { id: "haemul-ramyeon", name: "해물라면", desc: "해산물을 더한 든든한 라면" },
];

const TIME_SLOTS = ["점심", "저녁", "시간 협의"];

export default function ReservationForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const setQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, Math.min(99, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
    setSubmitted(false);
  };

  const selectedMenus = useMemo(
    () => MENU_ITEMS.filter((m) => (quantities[m.id] ?? 0) > 0),
    [quantities]
  );

  const summary = useMemo(() => {
    const menuLines = selectedMenus
      .map((m) => `  - ${m.name} × ${quantities[m.id]}`)
      .join("\n");
    return [
      "[망남 마을식당 예약 신청]",
      `예약자: ${name}`,
      `연락처: ${phone}`,
      `방문일: ${date || "미정"} (${timeSlot})`,
      "주문 메뉴:",
      menuLines,
      note ? `요청사항: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [name, phone, date, timeSlot, selectedMenus, quantities, note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("예약자 이름을 입력해 주세요.");
      return;
    }
    if (!/^[0-9\-+() ]{9,}$/.test(phone.trim())) {
      setError("연락 가능한 전화번호를 입력해 주세요. (예: 010-1234-5678)");
      return;
    }
    if (selectedMenus.length === 0) {
      setError("메뉴를 하나 이상 선택하고 수량을 정해 주세요.");
      return;
    }
    setError("");
    setCopied(false);
    setSubmitted(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="font-bold text-sea-800 text-lg">마을식당 예약</h3>
      <p className="mt-2 text-sm text-sea-700">
        아래 내용을 작성해 예약을 신청하세요. 대표 전화가 개통되기 전까지는 작성된
        예약 내용을 앵커 조직(사회혁신교육원) 문의 폼으로 전달해 주시면 마을에서
        확인 후 연락드립니다.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-sea-800">예약자 이름 *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSubmitted(false); }}
            placeholder="홍길동"
            className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">전화번호 *</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSubmitted(false); }}
            placeholder="010-1234-5678"
            className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">방문 예정일</span>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSubmitted(false); }}
            className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">시간대</span>
          <select
            value={timeSlot}
            onChange={(e) => { setTimeSlot(e.target.value); setSubmitted(false); }}
            className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-sea-800">메뉴 선택 · 수량 *</p>
        <p className="mt-1 text-xs text-sea-600">
          ※ 개점 준비 중인 메뉴 구성으로, 확정 시 일부 변경될 수 있습니다. 가격은 확정 후 안내합니다.
        </p>
        <ul className="mt-3 divide-y divide-sea-100 rounded-xl ring-1 ring-sea-100 bg-white">
          {MENU_ITEMS.map((m) => {
            const qty = quantities[m.id] ?? 0;
            return (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-sea-900">{m.name}</p>
                  <p className="text-xs text-sea-600">{m.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty(m.id, -1)}
                    aria-label={`${m.name} 수량 줄이기`}
                    className="h-8 w-8 rounded-md border border-sea-200 text-sea-700 font-bold hover:bg-sea-50 disabled:opacity-30"
                    disabled={qty === 0}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-sea-900">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(m.id, 1)}
                    aria-label={`${m.name} 수량 늘리기`}
                    className="h-8 w-8 rounded-md border border-sea-200 text-sea-700 font-bold hover:bg-sea-50"
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <label className="mt-5 block text-sm">
        <span className="font-medium text-sea-800">요청사항</span>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setSubmitted(false); }}
          rows={2}
          placeholder="인원수, 원하는 시간, 알레르기 등 (선택)"
          className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
        />
      </label>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto">
        예약 내용 만들기
      </button>

      {submitted && (
        <div className="mt-6 rounded-xl bg-sea-50 ring-1 ring-sea-200 p-4">
          <p className="text-sm font-semibold text-sea-800">예약 신청 내용</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-sea-900 ring-1 ring-sea-100">
{summary}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="btn-outline">
              {copied ? "복사 완료 ✓" : "내용 복사하기"}
            </button>
            <a
              href="https://sakyowon.poomasi.org/#/contact"
              target="_blank"
              rel="noopener"
              className="btn-primary"
            >
              문의 폼에 붙여넣어 전달 →
            </a>
          </div>
          <p className="mt-3 text-xs text-sea-600">
            복사한 내용을 문의 폼에 붙여넣어 보내 주시면, 마을에서 확인 후 입력하신
            번호로 예약 확정 연락을 드립니다.
          </p>
        </div>
      )}
    </form>
  );
}
