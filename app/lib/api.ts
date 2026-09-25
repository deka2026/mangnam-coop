// 망남 운영 백엔드(/api/mangnam) 클라이언트.
//
// 사이트와 API는 같은 출처(sakyowon.co.kr)에서 서빙되므로 기본은 상대경로 "/api".
// 로컬 개발 때만 .env.development.local 의 NEXT_PUBLIC_API_BASE 로 다른 주소를 준다
// (next build 는 development 환경파일을 읽지 않으므로 배포본이 오염되지 않는다).
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
export const MN = `${API_BASE}/mangnam`;
export const AUTH_ME = `${API_BASE}/auth/me`;

const KEY_STORE = "mn-admin-key";

/** 관리자 비밀번호(서버 SAKYOWON_ADMIN_KEY)는 탭이 살아 있는 동안만 sessionStorage 에 둔다. */
export function getKey(): string {
  try {
    return sessionStorage.getItem(KEY_STORE) ?? "";
  } catch {
    return "";
  }
}
export function setKey(key: string) {
  try {
    if (key) sessionStorage.setItem(KEY_STORE, key);
    else sessionStorage.removeItem(KEY_STORE);
  } catch {
    /* 저장 불가 환경이면 그냥 넘어간다 */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Opts = {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
  /** true 면 sessionStorage 의 관리자 키를 ?key= 로 붙인다 (통합 계정 세션이 있으면 서버가 그것도 인정). */
  admin?: boolean;
  params?: Record<string, string | number | undefined>;
};

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const url = new URL(`${MN}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.href);
  Object.entries(opts.params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  if (opts.admin) {
    const key = getKey();
    if (key) url.searchParams.set("key", key);
  }
  const res = await fetch(url.toString(), {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    credentials: "include",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok || !data?.ok) {
    throw new ApiError(data?.error ?? `요청에 실패했습니다 (${res.status}).`, res.status);
  }
  return data as T;
}

/** 첨부 내려받기 주소. 비공개 파일은 관리자 키를 붙여야 열린다. */
export function fileUrl(fileId: string, admin = false) {
  const key = admin ? getKey() : "";
  return `${MN}/files/${encodeURIComponent(fileId)}${key ? `?key=${encodeURIComponent(key)}` : ""}`;
}

/** 브라우저 File → base64 JSON 업로드 (서버는 multipart 의존성 없이 JSON 만 받는다). */
export async function uploadFile(file: File): Promise<FileRef> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const r = await api<{ id: string; name: string; size: number }>("/files", {
    admin: true,
    body: { name: file.name, mime: file.type, data },
  });
  return { file_id: r.id, name: r.name, size: r.size };
}

// ── 타입 ──

export type Categories = {
  income: string[];
  expense: string[];
  business: string[];
  document: string[];
  disclosure: string[];
  performance: string[];
};

export type LedgerRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  date: string;
  month: string;
  kind: "income" | "expense";
  category: string;
  business: string;
  description: string;
  amount: number;
  counterparty: string;
  method: string;
  evidence: string;
  memo: string;
  created_by?: string;
};

export type MonthInfo = {
  month: string;
  status: "open" | "closed";
  public: number;
  note: string;
  closed_at?: string | null;
  closed_by?: string | null;
};

export type MonthSummary = MonthInfo & { income: number; expense: number; net: number; count: number };

export type LedgerSummary = {
  year: number;
  years: string[];
  months: MonthSummary[];
  categories: { income: CategoryTotal[]; expense: CategoryTotal[] };
  businesses: { business: string; income: number; expense: number; net: number }[];
  total: { income: number; expense: number; net: number };
};
export type CategoryTotal = { category: string; total: number; count: number };

export type FileRef = { file_id: string; name: string; size?: number };

export type Meeting = {
  id: string;
  created_at: string;
  updated_at?: string;
  date: string;
  kind: string;
  title: string;
  place: string;
  chair: string;
  recorder: string;
  attendees: string;
  agenda: string;
  content: string;
  decisions: string;
  followups: string;
  attachments: FileRef[];
  published: number;
  created_by?: string;
};

export type Doc = {
  id: string;
  created_at: string;
  updated_at?: string;
  title: string;
  category: string;
  doc_date: string;
  description: string;
  tags: string;
  url: string;
  file_id: string | null;
  file: { id: string; name: string; mime: string; size: number; created_at: string } | null;
  created_by?: string;
};

export type Metric = { label: string; value: string; unit: string; note?: string };

export type Post = {
  id: string;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
  board: "disclosure" | "performance";
  category: string;
  year: number | null;
  period: string;
  title: string;
  summary: string;
  body: string;
  metrics: Metric[];
  attachments: FileRef[];
  status: "draft" | "published";
  created_by?: string;
};

export type PublicFinance = {
  year: number;
  years: string[];
  months: { month: string; income: number; expense: number; net: number; note: string }[];
  total: { income: number; expense: number; net: number };
};

export type PublicMeeting = {
  id: string;
  date: string;
  kind: string;
  title: string;
  agenda: string;
  decisions: string;
  attachments: FileRef[];
};

// ── 표시 유틸 ──

export const won = (n: number | string | null | undefined) =>
  `${Math.round(Number(n ?? 0)).toLocaleString("ko-KR")}원`;

export const fmtDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

export const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const monthLabel = (m: string) => {
  const [y, mm] = m.split("-");
  return `${y}년 ${Number(mm)}월`;
};

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const thisMonth = () => today().slice(0, 7);

export const fileSize = (n?: number) => {
  if (!n) return "";
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
};
