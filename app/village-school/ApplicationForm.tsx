"use client";

import { useMemo, useState } from "react";
import {
  AVOID_OPTIONS,
  OPT_OUT_OPTIONS,
  TEAM_OPTIONS,
  WISH_OPTIONS,
} from "./data";
import { CONTACT_FORM_URL, ENDPOINT, LOCAL_BACKUP_KEY, SITE } from "./config";

type Status = "idle" | "sending" | "sent" | "fallback";

const fieldClass =
  "mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none";

function CheckList({
  options,
  selected,
  onToggle,
  name,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  name: string;
}) {
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const checked = selected.includes(o.id);
        return (
          <li key={o.id}>
            <label
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                checked
                  ? "border-sea-500 bg-sea-50 text-sea-900"
                  : "border-sea-200 bg-white text-sea-800 hover:bg-sea-50"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={() => onToggle(o.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-sea-600"
              />
              <span>{o.label}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

const asOptions = (labels: string[]) => labels.map((l) => ({ id: l, label: l }));

export default function ApplicationForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState(TEAM_OPTIONS[TEAM_OPTIONS.length - 1]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [avoidEtc, setAvoidEtc] = useState("");
  const [wish, setWish] = useState<string[]>([]);
  const [wishEtc, setWishEtc] = useState("");
  const [strength, setStrength] = useState("");
  const [scheduleOk, setScheduleOk] = useState(false);
  const [bus, setBus] = useState("");
  const [optOut, setOptOut] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) => {
      setter((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
      setStatus("idle");
    };

  const optOutLabels = useMemo(
    () =>
      optOut.map(
        (id) => OPT_OUT_OPTIONS.find((o) => o.id === id)?.label ?? id
      ),
    [optOut]
  );

  const payload = useMemo(
    () => ({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      team,
      avoid,
      avoidEtc: avoidEtc.trim(),
      wish,
      wishEtc: wishEtc.trim(),
      strength: strength.trim(),
      scheduleOk,
      bus,
      optOut,
      optOutLabels,
      note: note.trim(),
    }),
    [name, phone, email, team, avoid, avoidEtc, wish, wishEtc, strength, scheduleOk, bus, optOut, optOutLabels, note]
  );

  const summary = useMemo(() => {
    // 값이 없는 줄만 빼고 빈 줄 구분은 그대로 살리려고 null을 걸러 낸다.
    const line = (label: string, value: string) => (value ? `${label}: ${value}` : null);
    const lines: (string | null)[] = [
      "[망남마을학교 참가 신청]",
      line("이름", payload.name),
      line("전화번호", payload.phone),
      line("이메일", payload.email),
      line("소속", payload.team),
      line("일정 참가", payload.scheduleOk ? "제안한 일정(10/12~10/15) 참가 가능" : ""),
      line("고속버스 이동", payload.bus),
      "",
      "◇ 음식·일상에서 하지 말아야 할 것",
      ...(payload.avoid.length ? payload.avoid.map((a) => `  - ${a}`) : ["  - (없음)"]),
      payload.avoidEtc ? `  - 기타: ${payload.avoidEtc}` : null,
      "",
      "◇ 원하는 체험·프로그램",
      ...(payload.wish.length ? payload.wish.map((w) => `  - ${w}`) : ["  - (선택 없음)"]),
      payload.wishEtc ? `  - 기타: ${payload.wishEtc}` : null,
      ...(payload.strength
        ? ["", "◇ 내가 잘하는 것 (익숙한 것, 즐기는 것)", `  ${payload.strength}`]
        : []),
      "",
      "◇ 하고 싶지 않은 프로그램",
      ...(optOutLabels.length ? optOutLabels.map((o) => `  - ${o}`) : ["  - (없음)"]),
      ...(payload.note ? ["", "◇ 그 밖에 알아 두어야 할 것", `  ${payload.note}`] : []),
    ];
    return lines.filter((l) => l !== null).join("\n");
  }, [payload, optOutLabels]);

  const validate = () => {
    if (!payload.name) return "이름을 입력해 주세요.";
    if (!/^[0-9\-+() ]{9,}$/.test(payload.phone))
      return "연락 가능한 전화번호를 입력해 주세요. (예: 010-1234-5678)";
    if (!payload.scheduleOk)
      return "제안한 일정(10/12~10/15)에 참가 가능한 경우 체크해 주세요. 일정 참여가 어려우면 문의 폼으로 상의해 주세요.";
    if (!payload.bus)
      return "인천–완도 고속버스 이동 가능 여부를 선택해 주세요.";
    if (payload.avoid.length === 0 && !payload.avoidEtc)
      return "음식·일상에서 하지 말아야 할 것을 선택하거나, 없으면 기타 칸에 '없음'이라고 적어 주세요.";
    if (payload.wish.length === 0 && !payload.wishEtc)
      return "해 보고 싶은 체험을 하나 이상 골라 주세요.";
    if (!agree) return "개인정보 수집·이용에 동의해 주세요.";
    return "";
  };

  const backupLocally = () => {
    try {
      window.localStorage.setItem(
        LOCAL_BACKUP_KEY,
        JSON.stringify({ ...payload, savedAt: new Date().toISOString() })
      );
    } catch {
      /* 저장 공간이 없거나 차단된 브라우저 — 무시하고 진행 */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setCopied(false);
    backupLocally();

    if (!ENDPOINT) {
      setStatus("fallback");
      return;
    }

    setStatus("sending");
    try {
      // text/plain 으로 보내 CORS 프리플라이트를 피한다(서버는 본문을 JSON으로 파싱).
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          site: SITE,
          program: "youth",
          programLabel: "파란교실 · 청년 망남마을학교",
          detailsText: summary,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "저장에 실패했습니다.");
      setStatus("sent");
    } catch {
      setStatus("fallback");
      setError(
        "신청 서버에 연결하지 못했습니다. 아래 내용을 복사해 문의 폼으로 보내 주시면 동일하게 접수됩니다."
      );
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (status === "sent") {
    return (
      <div className="card">
        <p className="text-2xl">🌊</p>
        <h3 className="mt-2 text-lg font-bold text-sea-900">신청이 접수되었습니다</h3>
        <p className="mt-3 text-sm leading-relaxed text-sea-700">
          {payload.name}님, 신청해 주셔서 고맙습니다. 적어 주신 내용을 바탕으로 운영진이
          개별 전화 인터뷰를 위해 <strong>{payload.phone}</strong> 으로 연락드립니다.
          인터뷰 후 최종 참가 여부를 안내드립니다.
          하고 싶지 않다고 표시하신 프로그램은 대체 활동으로 미리 바꿔 두겠습니다.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setName("");
            setPhone("");
            setEmail("");
            setAvoid([]);
            setAvoidEtc("");
            setWish([]);
            setWishEtc("");
            setStrength("");
            setScheduleOk(false);
            setBus("");
            setOptOut([]);
            setNote("");
            setAgree(false);
          }}
          className="btn-outline mt-6"
        >
          다른 사람 신청하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-bold text-sea-800">망남마을학교 참가 신청서</h3>
      <p className="mt-2 text-sm text-sea-700">
        개인별로 신청합니다. <span className="text-red-600">*</span> 표시는 필수 항목입니다.
      </p>

      {/* 기본 정보 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-sea-800">
            이름 <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
            placeholder="홍길동"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">
            전화번호 <span className="text-red-600">*</span>
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setStatus("idle"); }}
            placeholder="010-1234-5678"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
            placeholder="선택 사항"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">소속</span>
          <select
            value={team}
            onChange={(e) => { setTeam(e.target.value); setStatus("idle"); }}
            className={fieldClass}
          >
            {TEAM_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 일정·이동 확인 */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-sea-800">
          일정·이동 확인 <span className="text-red-600">*</span>
        </legend>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg border border-sea-200 bg-white px-3 py-2.5 text-sm text-sea-800 hover:bg-sea-50">
          <input
            type="checkbox"
            checked={scheduleOk}
            onChange={(e) => { setScheduleOk(e.target.checked); setStatus("idle"); }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-sea-600"
          />
          <span>
            제안한 일정 <strong>2026. 10. 12.(월) ~ 10. 15.(목) 3박 4일</strong>에
            참가할 수 있습니다.
          </span>
        </label>
        <p className="mt-4 text-sm font-medium text-sea-800">
          인천에서 완도까지 고속버스 여행이 가능한가요?{" "}
          <span className="font-normal text-sea-600">(버스 왕복예매권을 제공합니다)</span>
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {["가능합니다", "어렵습니다 (전화 인터뷰에서 상의)"].map((v) => (
            <label
              key={v}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                bus === v
                  ? "border-sea-500 bg-sea-50 text-sea-900"
                  : "border-sea-200 bg-white text-sea-800 hover:bg-sea-50"
              }`}
            >
              <input
                type="radio"
                name="bus"
                checked={bus === v}
                onChange={() => { setBus(v); setStatus("idle"); }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-sea-600"
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 안 해야 하는 것 */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-sea-800">
          음식이나 일상에서 하지 말아야 할 것 <span className="text-red-600">*</span>
        </legend>
        <p className="mt-1 text-xs text-sea-600">
          알레르기·식성·생활 습관 무엇이든 좋습니다. 미리 알면 그렇게 준비합니다.
          해당 사항이 없으면 기타 칸에 &lsquo;없음&rsquo;이라고 적어 주세요.
        </p>
        <CheckList
          name="avoid"
          options={asOptions(AVOID_OPTIONS)}
          selected={avoid}
          onToggle={toggle(setAvoid)}
        />
        <label className="mt-3 block text-sm">
          <span className="font-medium text-sea-800">기타 (직접 입력)</span>
          <textarea
            value={avoidEtc}
            onChange={(e) => { setAvoidEtc(e.target.value); setStatus("idle"); }}
            rows={2}
            placeholder="예) 고수를 못 먹습니다 / 밤에 불 꺼진 방이 어렵습니다 / 매일 저녁 약을 먹습니다"
            className={fieldClass}
          />
        </label>
      </fieldset>

      {/* 원하는 체험 */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-sea-800">
          해 보고 싶은 체험·프로그램 <span className="text-red-600">*</span>
        </legend>
        <p className="mt-1 text-xs text-sea-600">
          여러 개 고르셔도 됩니다. 많이 선택된 활동은 일정에 더 넉넉히 배치합니다.
        </p>
        <CheckList
          name="wish"
          options={asOptions(WISH_OPTIONS)}
          selected={wish}
          onToggle={toggle(setWish)}
        />
        <label className="mt-3 block text-sm">
          <span className="font-medium text-sea-800">기타 (직접 입력)</span>
          <textarea
            value={wishEtc}
            onChange={(e) => { setWishEtc(e.target.value); setStatus("idle"); }}
            rows={2}
            placeholder="예) 배를 타고 나가 보고 싶습니다 / 마을 지도를 그려 보고 싶습니다"
            className={fieldClass}
          />
        </label>
      </fieldset>

      {/* 잘하는 것 */}
      <label className="mt-8 block text-sm">
        <span className="font-medium text-sea-800">
          내가 잘하는 것 (익숙한 것, 즐기는 것)
        </span>
        <p className="mt-1 text-xs text-sea-600">
          구체적으로 적어 주세요. &lsquo;요리&rsquo;보다는 &lsquo;10인분 김치찌개를 끓여 본 적
          있음&rsquo;처럼 적어 주시면, 4일 동안 마을에서 맡을 역할을 함께 찾기 훨씬 좋습니다.
        </p>
        <textarea
          value={strength}
          onChange={(e) => { setStrength(e.target.value); setStatus("idle"); }}
          rows={3}
          placeholder="예) 영상 편집 앱으로 브이로그를 만들어 봄 / 낯선 사람에게 말 거는 걸 잘함 / 엑셀 정리가 익숙함"
          className={fieldClass}
        />
      </label>

      {/* 하기 싫은 프로그램 */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-sea-800">
          안내된 프로그램 중 하고 싶지 않은 것
        </legend>
        <p className="mt-1 text-xs text-sea-600">
          고르신 프로그램은 대체 활동(혼자 걷기·전망쉼터 휴식·마을카페)으로 바꿔 드립니다.
          이유를 적지 않으셔도 됩니다.
        </p>
        <CheckList
          name="optOut"
          options={OPT_OUT_OPTIONS}
          selected={optOut}
          onToggle={toggle(setOptOut)}
        />
      </fieldset>

      {/* 기타 */}
      <label className="mt-8 block text-sm">
        <span className="font-medium text-sea-800">그 밖에 미리 알아 두어야 할 것</span>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setStatus("idle"); }}
          rows={3}
          placeholder="함께 가는 사람, 비상 연락처, 거동이 불편한 부분, 그날 컨디션에 따라 부탁드리고 싶은 것 등"
          className={fieldClass}
        />
      </label>

      {/* 동의 */}
      <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-sm text-sea-800">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => { setAgree(e.target.checked); setStatus("idle"); }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-sea-600"
        />
        <span>
          <strong>개인정보 수집·이용에 동의합니다.</strong>{" "}
          <span className="text-sea-600">
            수집 항목은 이름·연락처와 위에 적어 주신 내용이며, 프로그램 운영과 안전관리
            목적으로만 사용하고 사업 종료 후 3개월 이내에 파기합니다.
          </span>
          <span className="text-red-600"> *</span>
        </span>
      </label>

      <p className="mt-6 rounded-lg bg-sea-50 px-4 py-3 text-sm text-sea-800 ring-1 ring-sea-100">
        참가비는 <strong>2만원</strong>입니다. 네트워크 파티 음식 준비에 쓰이며,
        불참 시 환불되지 않습니다. 납부 방법은 개별 전화 인터뷰에서 안내드립니다.
      </p>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary mt-6 w-full disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "보내는 중…" : "참가 신청하기"}
      </button>

      {status === "fallback" && (
        <div className="mt-6 rounded-xl bg-sea-50 p-4 ring-1 ring-sea-200">
          <p className="text-sm font-semibold text-sea-800">
            아래 내용을 복사해 문의 폼으로 보내 주세요
          </p>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-sea-900 ring-1 ring-sea-100">
{summary}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="btn-outline">
              {copied ? "복사 완료 ✓" : "내용 복사하기"}
            </button>
            <a
              href={CONTACT_FORM_URL}
              target="_blank"
              rel="noopener"
              className="btn-primary"
            >
              문의 폼 열기 →
            </a>
          </div>
          <p className="mt-3 text-xs text-sea-600">
            작성하신 내용은 이 브라우저에도 임시 저장해 두었습니다.
          </p>
        </div>
      )}
    </form>
  );
}
