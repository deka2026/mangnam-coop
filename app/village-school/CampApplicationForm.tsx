"use client";

import { useMemo, useState } from "react";
import { CONTACT_FORM_URL, ENDPOINT, LOCAL_BACKUP_KEY } from "./config";

type Status = "idle" | "sending" | "sent" | "fallback";
export type CampProgram = "teen" | "senior";

const fieldClass =
  "mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none";

const SWIM_OPTIONS = ["가능", "조금 가능", "못함"];
const EXP_OPTIONS = ["입문 (처음)", "초급 (몇 번 경험)", "중급 이상"];

type Accent = {
  /** 제목·강조 텍스트 색 (예: "text-lime-800") */
  heading: string;
  /** 제출 버튼 클래스 전체 (예: "…bg-lime-600 … hover:bg-lime-700") */
  submit: string;
  /** 카드 링 색 (예: "ring-lime-200") */
  ring: string;
  /** 성공/보조 배경 (예: "bg-lime-50") */
  soft: string;
  /** 성공 이모지 */
  emoji: string;
};

export default function CampApplicationForm({
  program,
  programLabel,
  accent,
}: {
  program: CampProgram;
  programLabel: string;
  accent: Accent;
}) {
  const isTeen = program === "teen";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);

  // 연두교실(청소년) 전용
  const [guardian, setGuardian] = useState("");
  const [schoolGrade, setSchoolGrade] = useState("");
  const [swim, setSwim] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [health, setHealth] = useState("");

  // 푸른교실(장년/강사) 전용
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => setStatus("idle");
  const bind =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setter(e.target.value);
      reset();
    };

  const detailsText = useMemo(() => {
    const line = (label: string, value: string) => (value.trim() ? `${label}: ${value.trim()}` : null);
    const lines = isTeen
      ? [
          line("보호자 성함", guardian),
          line("학교·학년/나이", schoolGrade),
          line("수영 가능 여부", swim),
          line("참가 인원", groupSize),
          line("건강상 유의사항·알레르기", health),
        ]
      : [line("스킴보드·서핑 경험", experience), line("강사 활동 목표·동기", motivation)];
    return lines.filter(Boolean).join("\n");
  }, [isTeen, guardian, schoolGrade, swim, groupSize, health, experience, motivation]);

  const payload = useMemo(
    () => ({
      program,
      programLabel,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      detailsText,
      note: note.trim(),
    }),
    [program, programLabel, name, phone, email, detailsText, note]
  );

  const summary = useMemo(() => {
    const line = (label: string, value: string) => (value ? `${label}: ${value}` : null);
    const lines: (string | null)[] = [
      `[${programLabel} 신청]`,
      line("이름", payload.name),
      line("연락처", payload.phone),
      line("이메일", payload.email),
      "",
      detailsText || "(추가 정보 없음)",
      ...(payload.note ? ["", "◇ 문의·요청 사항", `  ${payload.note}`] : []),
    ];
    return lines.filter((l) => l !== null).join("\n");
  }, [payload, programLabel, detailsText]);

  const validate = () => {
    if (!payload.name) return "이름을 입력해 주세요.";
    if (!/^[0-9\-+() ]{9,}$/.test(payload.phone))
      return "연락 가능한 전화번호를 입력해 주세요. (예: 010-1234-5678)";
    if (!agree) return "개인정보 수집·이용에 동의해 주세요.";
    return "";
  };

  const backupLocally = () => {
    try {
      window.localStorage.setItem(
        `${LOCAL_BACKUP_KEY}-${program}`,
        JSON.stringify({ ...payload, savedAt: new Date().toISOString() })
      );
    } catch {
      /* 저장 공간이 없거나 차단된 브라우저 — 무시 */
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
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "apply", ...payload }),
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
      <div className={`card ${accent.ring}`}>
        <p className="text-2xl">{accent.emoji}</p>
        <h3 className={`mt-2 text-lg font-bold ${accent.heading}`}>신청이 접수되었습니다</h3>
        <p className="mt-3 text-sm leading-relaxed text-sea-700">
          {payload.name}님, 신청해 주셔서 고맙습니다. 개설 일정과 준비 사항을 정리해{" "}
          <strong>{payload.phone}</strong> 으로 안내드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`card ${accent.ring}`}>
      <h3 className={`text-lg font-bold ${accent.heading}`}>{programLabel} 신청서</h3>
      <p className="mt-2 text-sm text-sea-700">
        <span className="text-red-600">*</span> 표시는 필수 항목입니다.
      </p>

      {/* 기본 정보 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-sea-800">
            {isTeen ? "참가자 이름" : "이름"} <span className="text-red-600">*</span>
          </span>
          <input type="text" value={name} onChange={bind(setName)} placeholder="홍길동" className={fieldClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">
            {isTeen ? "보호자 연락처" : "연락처"} <span className="text-red-600">*</span>
          </span>
          <input type="tel" value={phone} onChange={bind(setPhone)} placeholder="010-1234-5678" className={fieldClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-sea-800">이메일</span>
          <input type="email" value={email} onChange={bind(setEmail)} placeholder="선택 사항" className={fieldClass} />
        </label>

        {isTeen ? (
          <>
            <label className="block text-sm">
              <span className="font-medium text-sea-800">보호자 성함</span>
              <input type="text" value={guardian} onChange={bind(setGuardian)} placeholder="미성년자는 보호자 성함" className={fieldClass} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-sea-800">학교·학년 또는 나이</span>
              <input type="text" value={schoolGrade} onChange={bind(setSchoolGrade)} placeholder="예) 완도중 2학년 / 15세" className={fieldClass} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-sea-800">수영 가능 여부</span>
              <select value={swim} onChange={bind(setSwim)} className={fieldClass}>
                <option value="">선택해 주세요</option>
                {SWIM_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-sea-800">참가 인원</span>
              <input type="text" value={groupSize} onChange={bind(setGroupSize)} placeholder="예) 개인 1명 / 단체 8명" className={fieldClass} />
            </label>
          </>
        ) : (
          <label className="block text-sm">
            <span className="font-medium text-sea-800">스킴보드·서핑 경험</span>
            <select value={experience} onChange={bind(setExperience)} className={fieldClass}>
              <option value="">선택해 주세요</option>
              {EXP_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* 프로그램별 서술 */}
      {isTeen ? (
        <label className="mt-6 block text-sm">
          <span className="font-medium text-sea-800">건강상 유의사항 · 알레르기</span>
          <textarea
            value={health}
            onChange={bind(setHealth)}
            rows={2}
            placeholder="복용 중인 약, 알레르기, 유의할 지병 등이 있으면 적어 주세요."
            className={fieldClass}
          />
        </label>
      ) : (
        <label className="mt-6 block text-sm">
          <span className="font-medium text-sea-800">강사 활동 목표 · 동기</span>
          <textarea
            value={motivation}
            onChange={bind(setMotivation)}
            rows={2}
            placeholder="수료 후 어떤 활동을 계획하시는지, 지원 동기를 적어 주세요."
            className={fieldClass}
          />
        </label>
      )}

      {/* 문의·요청 */}
      <label className="mt-6 block text-sm">
        <span className="font-medium text-sea-800">문의·요청 사항</span>
        <textarea
          value={note}
          onChange={bind(setNote)}
          rows={3}
          placeholder="희망 일정, 함께 오는 인원, 궁금한 점 등 무엇이든 적어 주세요."
          className={fieldClass}
        />
      </label>

      {/* 동의 */}
      <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-sm text-sea-800">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => { setAgree(e.target.checked); reset(); }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-sea-600"
        />
        <span>
          <strong>개인정보 수집·이용에 동의합니다.</strong>{" "}
          <span className="text-sea-600">
            수집 항목은 이름·연락처와 위에 적어 주신 내용이며, 프로그램 운영·안전관리 목적으로만
            사용하고 운영 종료 후 3개월 이내에 파기합니다.{isTeen ? " 미성년자는 보호자 동의가 필요합니다." : ""}
          </span>
          <span className="text-red-600"> *</span>
        </span>
      </label>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={status === "sending"} className={`mt-6 w-full disabled:opacity-60 sm:w-auto ${accent.submit}`}>
        {status === "sending" ? "보내는 중…" : "신청하기"}
      </button>

      {status === "fallback" && (
        <div className={`mt-6 rounded-xl p-4 ring-1 ${accent.soft} ${accent.ring}`}>
          <p className="text-sm font-semibold text-sea-800">
            아래 내용을 복사해 문의 폼으로 보내 주세요
          </p>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-sea-900 ring-1 ring-sea-100">
{summary}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center rounded-md border border-sea-300 px-4 py-2 text-sm font-medium text-sea-700 hover:bg-white"
            >
              {copied ? "복사 완료 ✓" : "내용 복사하기"}
            </button>
            <a href={CONTACT_FORM_URL} target="_blank" rel="noopener" className={accent.submit}>
              문의 폼 열기 →
            </a>
          </div>
          <p className="mt-3 text-xs text-sea-600">작성하신 내용은 이 브라우저에도 임시 저장해 두었습니다.</p>
        </div>
      )}
    </form>
  );
}
