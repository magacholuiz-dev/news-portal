"use client";

import { useState } from "react";

/** Campo de arquivo (imagem ou áudio): envia pro Blob via /api/admin/upload
 * ou aceita uma URL colada. */
export default function UploadField({
  label,
  value,
  onChange,
  kind,
  help,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind: "image" | "audio";
  help?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha no envio.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Falha no envio.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="text-sm">
      <span className="mb-1 block font-medium text-neutral-700">{label}</span>
      {value && kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mb-2 h-24 w-24 rounded-sm border border-neutral-200 object-cover"
        />
      )}
      {value && kind === "audio" && (
        <audio controls src={value} className="mb-2 h-9 w-full max-w-sm" />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-3 py-2 font-medium hover:bg-neutral-50">
          {uploading ? "Enviando..." : kind === "image" ? "Enviar imagem" : "Enviar áudio"}
          <input
            type="file"
            accept={
              kind === "image"
                ? "image/jpeg,image/png,image/webp"
                : "audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/wav,audio/ogg,audio/webm"
            }
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ou cole a URL"
          className="min-w-48 flex-1 rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-red-600 hover:text-red-800"
          >
            Remover
          </button>
        )}
      </div>
      {help && <span className="mt-1 block text-xs text-neutral-400">{help}</span>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
