"use client";

import { useState } from "react";

export type GalleryItemValue = {
  key: string;
  imageUrl: string;
  videoUrl: string;
  caption: string;
};

function GalleryItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: GalleryItemValue;
  onChange: (item: GalleryItemValue) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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
        setError(data.error ?? "Falha ao enviar a imagem.");
        return;
      }
      onChange({ ...item, imageUrl: data.url });
    } catch {
      setError("Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="flex gap-4 rounded-sm border border-neutral-200 p-4">
      <div className="w-32 shrink-0">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="aspect-video w-32 rounded-sm border border-neutral-200 object-cover"
          />
        ) : (
          <div className="flex aspect-video w-32 items-center justify-center rounded-sm border border-dashed border-neutral-300 text-xs text-neutral-400">
            sem imagem
          </div>
        )}
        <label className="mt-2 block cursor-pointer text-center text-xs font-medium text-neutral-600 hover:text-neutral-900">
          {uploading ? "Enviando..." : "Enviar imagem"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="flex-1 space-y-2">
        {error && <p className="text-xs text-red-700">{error}</p>}
        <input
          value={item.imageUrl}
          onChange={(e) => onChange({ ...item, imageUrl: e.target.value })}
          placeholder="URL da imagem (ou envie ao lado)"
          className="w-full rounded-sm border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
        />
        <input
          value={item.videoUrl}
          onChange={(e) => onChange({ ...item, videoUrl: e.target.value })}
          placeholder="URL do vídeo (YouTube ou Vimeo) — opcional"
          className="w-full rounded-sm border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
        />
        <input
          value={item.caption}
          onChange={(e) => onChange({ ...item, caption: e.target.value })}
          placeholder="Legenda — opcional"
          className="w-full rounded-sm border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="self-start text-sm text-red-600 hover:text-red-800"
      >
        Remover
      </button>
    </div>
  );
}

export default function GalleryItemsEditor({
  items,
  onChange,
}: {
  items: GalleryItemValue[];
  onChange: (items: GalleryItemValue[]) => void;
}) {
  function addItem() {
    onChange([
      ...items,
      { key: crypto.randomUUID(), imageUrl: "", videoUrl: "", caption: "" },
    ]);
  }

  function updateItem(index: number, value: GalleryItemValue) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="block text-sm font-medium text-neutral-700">
          Galeria de imagens e vídeos
        </span>
        <button
          type="button"
          onClick={addItem}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          + Adicionar item
        </button>
      </div>
      <p className="mb-3 text-xs text-neutral-400">
        Cada miniatura aparece na matéria; se tiver um vídeo vinculado, clicar
        nela abre o vídeo em um popup — igual à imagem de destaque.
      </p>

      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-400">
          Nenhum item na galeria ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <GalleryItemRow
              key={item.key}
              item={item}
              onChange={(value) => updateItem(index, value)}
              onRemove={() => removeItem(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
