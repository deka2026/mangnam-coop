"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, AUTH_ME, Categories, getKey, setKey } from "../lib/api";

type AdminState = {
  name: string;
  via: "session" | "key";
  categories: Categories;
  reload: () => void;
};

const AdminContext = createContext<AdminState | null>(null);

export function useAdmin(): AdminState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin 은 AdminShell 안에서만 쓸 수 있습니다.");
  return ctx;
}

export const ADMIN_TABS = [
  { href: "/admin", label: "현황", icon: "🏠" },
  { href: "/admin/ledger", label: "월별 회계", icon: "📒" },
  { href: "/admin/meetings", label: "회의록", icon: "📝" },
  { href: "/admin/documents", label: "문서 보관", icon: "🗄️" },
  { href: "/admin/posts", label: "공시·실적 게시", icon: "📢" },
];

const FALLBACK_CATEGORIES: Categories = {
  income: [], expense: [], business: [], document: [], disclosure: [], performance: [],
};

/** 운영 관리 화면 공통 틀: 인증(통합 계정 세션 또는 관리자 비밀번호) + 상단 탭. */
export default function AdminShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [state, setState] = useState<AdminState | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = useCallback(async (key?: string) => {
    if (key !== undefined) setKey(key);
    setError("");
    setBusy(true);
    try {
      const r = await api<{ name: string; via: "session" | "key"; categories: Categories }>("/me", {
        admin: true,
      });
      setState({
        name: r.name,
        via: r.via,
        categories: { ...FALLBACK_CATEGORIES, ...r.categories },
        reload: () => verify(),
      });
    } catch (e) {
      setState(null);
      if (key !== undefined) {
        setKey("");
        setError(e instanceof Error ? e.message : "확인에 실패했습니다.");
      }
    } finally {
      setBusy(false);
      setChecking(false);
    }
  }, []);

  // 첫 진입: 통합 계정 세션이 있거나 이 탭에 저장된 비밀번호가 있으면 바로 통과
  useEffect(() => {
    fetch(AUTH_ME, { credentials: "include" }).catch(() => {});
    verify(getKey() ? undefined : undefined);
  }, [verify]);

  const logout = () => {
    setKey("");
    setState(null);
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href);

  return (
    <>
      <section className="border-b border-sea-100 bg-sea-50">
        <div className="container-page py-10">
          <p className="font-semibold text-sea-600">조합 운영관리 · 운영진 전용</p>
          <h1 className="mt-2 section-title text-3xl">{title}</h1>
          {sub && <p className="section-sub">{sub}</p>}
          {state && (
            <nav className="mt-6 flex flex-wrap gap-2">
              {ADMIN_TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors ${
                    isActive(t.href)
                      ? "bg-sea-600 text-white ring-sea-600"
                      : "bg-white text-sea-700 ring-sea-200 hover:bg-sea-100"
                  }`}
                >
                  {t.icon} {t.label}
                </Link>
              ))}
              <span className="ml-auto flex items-center gap-3 text-xs text-sea-600">
                <span>
                  <strong className="text-sea-800">{state.name}</strong>
                  {state.via === "session" ? " · 통합 계정" : " · 관리자 비밀번호"}
                </span>
                {state.via === "key" && (
                  <button type="button" onClick={logout} className="underline hover:text-sea-900">
                    잠그기
                  </button>
                )}
              </span>
            </nav>
          )}
        </div>
      </section>

      <section className="container-page py-10">
        {checking ? (
          <p className="text-sm text-sea-600">권한을 확인하는 중…</p>
        ) : state ? (
          <AdminContext.Provider value={state}>{children}</AdminContext.Provider>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(password);
            }}
            className="card max-w-lg"
          >
            <h2 className="font-bold text-sea-800">운영진 확인</h2>
            <p className="mt-1 text-sm text-sea-600">
              사교원 통합 계정(운영진)으로 로그인돼 있으면 자동으로 열립니다. 아니면 운영진에게 전달받은
              관리자 비밀번호를 입력해 주세요.
            </p>
            <label className="mt-4 block text-sm">
              <span className="font-medium text-sea-800">관리자 비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none"
              />
            </label>
            <p className="mt-2 text-xs text-sea-600">
              비밀번호는 이 브라우저 탭을 닫으면 지워집니다. 서버(사교원 자체 서버)에서만 대조합니다.
            </p>
            <button type="submit" disabled={busy || !password} className="btn-primary mt-4 disabled:opacity-60">
              {busy ? "확인 중…" : "열기"}
            </button>
            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
            <p className="mt-4 text-xs text-sea-500">
              <a href="https://sakyowon.co.kr/admin.html" className="underline hover:text-sea-800">
                통합 계정으로 로그인 ↗
              </a>
            </p>
          </form>
        )}
      </section>
    </>
  );
}

/** 작은 공용 UI 조각들 */
export const inputCls =
  "mt-1 w-full rounded-md border border-sea-200 bg-white px-3 py-2 text-sm text-sea-900 focus:border-sea-500 focus:outline-none";
export const labelCls = "block text-sm";
export const labelTextCls = "font-medium text-sea-800";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`${labelCls} ${className ?? ""}`}>
      <span className={labelTextCls}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-sea-500">{hint}</span>}
    </label>
  );
}

/** 자유 입력 + 기본 항목 선택을 겸하는 입력 (datalist). */
export function ComboInput({
  value,
  onChange,
  options,
  listId,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  listId: string;
  placeholder?: string;
}) {
  return (
    <>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}

export function Notice({ kind, children }: { kind: "error" | "ok" | "info"; children: React.ReactNode }) {
  const cls =
    kind === "error"
      ? "bg-red-50 text-red-700 ring-red-100"
      : kind === "ok"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-sea-50 text-sea-700 ring-sea-100";
  return <p className={`rounded-md px-3 py-2 text-sm ring-1 ${cls}`}>{children}</p>;
}
