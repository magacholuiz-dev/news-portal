"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

/** Campo de vídeo (MP4/WebM): envia direto pro Blob (sem passar pela função
 * da Vercel, que limita o corpo a ~4,5MB) ou aceita uma URL colada. */
export default function VideoUploadField({
  label,
  value,
  onChange,
  help,
  maxMb = 16,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  help?: string;
  maxMb?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Arquivo com ${(file.size / 1048576).toFixed(1)}MB. O máximo é ${maxMb}MB — comprima o vídeo.`);
      event.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(`hero/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload-video",
      });
      onChange(blob.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="text-sm">
      <span className="mb-1 block font-medium text-neutral-700">{label}</span>
      {value && <video src={value} muted playsInline controls className="mb-2 h-28 rounded-sm border border-neutral-200" />}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-3 py-2 font-medium hover:bg-neutral-50">
          {uploading ? "Enviando..." : "Enviar vídeo"}
          <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="ou cole a URL do arquivo"
          className="min-w-0 flex-1 rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-red-600 hover:text-red-800">
            Remover
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      {help && <span className="mt-1 block text-xs text-neutral-400">{help}</span>}
    </div>
  );
}
