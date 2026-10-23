"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SiteSettingsForm({
  initialTitle,
}: {
  initialTitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteTitle: title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "Falha ao salvar." });
        return;
      }
      setTitle(data.siteTitle);
      setMessage({ ok: true, text: "Título atualizado em todo o site." });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">
          Título do site
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />
        <span className="mt-1 block text-xs text-neutral-400">
          Aparece no topo e no rodapé do site, no título da aba do navegador
          e no cabeçalho do admin.
        </span>
      </label>

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
