"use client";

import { fileSize, fileUrl } from "../lib/api";

/** 본문: 줄바꿈 유지, '- ' 로 시작하는 줄은 목록. */
export function Body({ text }: { text: string }) {
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  text.split(/\r?\n/).forEach((line) => {
    const isItem = /^\s*[-•]\s+/.test(line);
    const last = blocks[blocks.length - 1];
    if (isItem) {
      const item = line.replace(/^\s*[-•]\s+/, "");
      if (last?.type === "ul") last.lines.push(item);
      else blocks.push({ type: "ul", lines: [item] });
    } else if (line.trim() === "") {
      blocks.push({ type: "p", lines: [] });
    } else if (last?.type === "p") {
      last.lines.push(line);
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  });
  return (
    <div className="space-y-3 text-sea-800">
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.lines.map((l, j) => (
              <li key={j}>{l}</li>
            ))}
          </ul>
        ) : b.lines.length ? (
          <p key={i} className="whitespace-pre-wrap">{b.lines.join("\n")}</p>
        ) : null
      )}
    </div>
  );
}

export function Attachments({ items }: { items: { file_id: string; name: string; size?: number }[] }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a.file_id}>
          <a href={fileUrl(a.file_id)} className="inline-flex items-center gap-1 rounded-full bg-sea-50 px-3 py-1 text-sm text-sea-700 ring-1 ring-sea-100 hover:bg-sea-100">
            📎 {a.name} {a.size ? <span className="text-xs text-sea-400">{fileSize(a.size)}</span> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
