"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type EpisodeRow = {
  key: string;
  title: string;
  videoUrl: string;
  duration: string;
  published: boolean;
};

const blank = (): EpisodeRow => ({
  key: `${Date.now()}-${Math.random()}`,
  title: "",
  videoUrl: "",
  duration: "",
  published: true,
});

/** Lista editável dos episódios da série (links do YouTube). */
export default function EpisodesManager({ initial }: { initial: EpisodeRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<EpisodeRow[]>(initial.length ? initial : [blank()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function patch(i: number, p: Partial<EpisodeRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }
  function move(i: number, d: -1 | 1) {
    setRows((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/episodes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodes: rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "Falha ao salvar." });
        return;
      }
      setMessage({ ok: true, text: `${data.count} episódio(s) salvo(s).` });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

  return (
    <div className="max-w-3xl space-y-4">
      {message && (
        <p className={`rounded-sm px-3 py-2 text-sm ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      )}
      {rows.map((r, i) => (
        <div key={r.key} className="rounded-sm border border-neutral-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase">Episódio {i + 1}</span>
            <span className="flex gap-3 text-xs">
              <button type="button" onClick={() => move(i, -1)} className="text-neutral-500 hover:text-neutral-900">↑</button>
              <button type="button" onClick={() => move(i, 1)} className="text-neutral-500 hover:text-neutral-900">↓</button>
              <button type="button" onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))} className="text-red-600 hover:text-red-800">Remover</button>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input value={r.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Título do episódio" className={input + " sm:col-span-2"} />
            <input value={r.duration} onChange={(e) => patch(i, { duration: e.target.value })} placeholder="Duração (ex.: 42 min)" className={input} />
            <input value={r.videoUrl} onChange={(e) => patch(i, { videoUrl: e.target.value })} placeholder="Link do YouTube" className={input + " sm:col-span-3"} />
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
            <input type="checkbox" checked={r.published} onChange={(e) => patch(i, { published: e.target.checked })} />
            Aparece no site
          </label>
        </div>
      ))}
      <div className="flex gap-3">
        <button type="button" onClick={() => setRows((p) => [...p, blank()])} className="rounded-sm border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50">
          + Adicionar episódio
        </button>
        <button type="button" onClick={save} disabled={saving} className="rounded-sm bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar episódios"}
        </button>
      </div>
    </div>
  );
}
