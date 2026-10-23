"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/settings";

export default function SiteSettingsForm({
  initial,
}: {
  initial: SiteSettings;
}) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "Falha ao salvar." });
        return;
      }
      setValues(data);
      setMessage({ ok: true, text: "Configurações salvas." });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-black">Identidade</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Título do site
          </span>
          <input
            value={values.siteTitle}
            onChange={(e) => set("siteTitle", e.target.value)}
            maxLength={80}
            className={input}
          />
          <span className="mt-1 block text-xs text-neutral-400">
            Aparece no topo e no rodapé, na aba do navegador e no cabeçalho do
            admin.
          </span>
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg font-black">Abertura</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Trailer da série (YouTube ou Vimeo)
          </span>
          <input
            value={values.heroTrailerUrl}
            onChange={(e) => set("heroTrailerUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={input}
          />
          <span className="mt-1 block text-xs text-neutral-400">
            Aparece logo abaixo das duas frases da abertura. Vazio = não mostra.
          </span>
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg font-black">Máxima do fechamento</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Frase
          </span>
          <textarea
            rows={3}
            value={values.closingQuoteText}
            onChange={(e) => set("closingQuoteText", e.target.value)}
            maxLength={400}
            className={input}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Quem disse
          </span>
          <input
            value={values.closingQuoteAuthor}
            onChange={(e) => set("closingQuoteAuthor", e.target.value)}
            maxLength={120}
            className={input}
          />
          <span className="mt-1 block text-xs text-neutral-400">
            Aparece antes da frase final &ldquo;A notícia começa em algum
            lugar&hellip;&rdquo;. Vazio = não mostra.
          </span>
        </label>
      </section>

      {message && (
        <p
          className={`rounded-sm px-3 py-2 text-sm ${
            message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-sm bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
