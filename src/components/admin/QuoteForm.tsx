"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadField from "./UploadField";
import { QUOTE_KINDS, type QuoteKind } from "@/lib/quote-kinds";
import { CONTINENTS } from "@/lib/continents";

export type QuoteFormValues = {
  id?: number;
  kind: QuoteKind;
  text: string;
  journalistId: string;
  locationId: string;
  continent: string;
  videoUrl: string;
  videoStart: string;
  audioUrl: string;
  sourceNote: string;
  needsReview: boolean;
  published: boolean;
  displayOrder: number;
};

const empty: QuoteFormValues = {
  kind: "FALA",
  text: "",
  journalistId: "",
  locationId: "",
  continent: "",
  videoUrl: "",
  videoStart: "",
  audioUrl: "",
  sourceNote: "",
  needsReview: true,
  published: false,
  displayOrder: 0,
};

export default function QuoteForm({
  initialValues,
  journalists,
  locations,
}: {
  initialValues?: QuoteFormValues;
  journalists: { id: number; name: string }[];
  locations: { id: number; name: string }[];
}) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);
  const [values, setValues] = useState<QuoteFormValues>(initialValues ?? empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = QUOTE_KINDS.find((k) => k.value === values.kind)!;
  const showAudio = values.kind === "PODCAST" || values.kind === "QUEM_ESTEVE_LA";
  const showVideo = values.kind !== "PODCAST";

  function set<K extends keyof QuoteFormValues>(k: K, v: QuoteFormValues[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/quotes/${initialValues!.id}` : "/api/admin/quotes", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao salvar.");
        setSaving(false);
        return;
      }
      router.push("/admin/quotes");
      router.refresh();
    } catch {
      setError("Falha ao salvar.");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Onde essa fala aparece *</span>
        <select value={values.kind} onChange={(e) => set("kind", e.target.value as QuoteKind)} className={input}>
          {QUOTE_KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-neutral-400">{meta.help}</span>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {meta.scope === "location" ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Território *</span>
            <select value={values.locationId} onChange={(e) => set("locationId", e.target.value)} className={input}>
              <option value="">— escolha —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Continente *</span>
            <select value={values.continent} onChange={(e) => set("continent", e.target.value)} className={input}>
              <option value="">— escolha —</option>
              {CONTINENTS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Jornalista {meta.value === "CAPITULO" ? "(vazio = quadro de aspas vazio)" : "*"}
          </span>
          <select value={values.journalistId} onChange={(e) => set("journalistId", e.target.value)} className={input}>
            <option value="">{meta.value === "CAPITULO" ? "— nenhum —" : "— escolha —"}</option>
            {journalists.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Texto da fala *</span>
        <textarea rows={5} value={values.text} onChange={(e) => set("text", e.target.value)} className={input} />
        <span className="mt-1 block text-xs text-neutral-400">
          Transcreva palavra por palavra a partir do bruto. Use &ldquo;Fonte no bruto&rdquo; abaixo pra anotar onde está.
        </span>
      </label>

      {showVideo && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-neutral-700">Vídeo do episódio (YouTube/Vimeo)</span>
            <input value={values.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={input} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Minuto da fala</span>
            <input value={values.videoStart} onChange={(e) => set("videoStart", e.target.value)} placeholder="ex: 23:50" className={input} />
          </label>
        </div>
      )}

      {showAudio && (
        <UploadField
          label={values.kind === "PODCAST" ? "Áudio do mini podcast" : "Áudio curto (~15 s)"}
          kind="audio"
          value={values.audioUrl}
          onChange={(u) => set("audioUrl", u)}
          help="MP3/M4A de até 4MB (30 s a 1 min cabem). Se for maior, hospede fora e cole a URL."
        />
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Fonte no bruto (só pra equipe)</span>
        <input value={values.sourceNote} onChange={(e) => set("sourceNote", e.target.value)} placeholder="ex: A2 40:26 a 47:51" className={input} />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.needsReview} onChange={(e) => set("needsReview", e.target.checked)} className="h-4 w-4" />
            <span className="font-medium text-neutral-700">Falta conferir a transcrição</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4" />
            <span className="font-medium text-neutral-700">Publicar no site</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-medium text-neutral-700">Ordem</span>
            <input type="number" value={values.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} className="w-20 rounded-sm border border-neutral-300 px-2 py-1" />
          </label>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/quotes")} className="rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-sm bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
            {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar fala"}
          </button>
        </div>
      </div>
    </form>
  );
}
