"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GalleryItemsEditor, {
  type GalleryItemValue,
} from "./GalleryItemsEditor";
import LocationPicker, { type LocationValue } from "./LocationPicker";

export type AdminArticleFormValues = {
  id?: number;
  title: string;
  subtitle: string;
  excerpt: string;
  slug: string;
  category: string;
  author: string;
  heroImageUrl: string;
  videoUrl: string;
  contentHtml: string;
  published: boolean;
  galleryItems: GalleryItemValue[];
  location: LocationValue | null;
};

const emptyValues: AdminArticleFormValues = {
  title: "",
  subtitle: "",
  excerpt: "",
  slug: "",
  category: "",
  author: "",
  heroImageUrl: "",
  videoUrl: "",
  contentHtml: "",
  published: false,
  galleryItems: [],
  location: null,
};

export default function AdminArticleForm({
  initialValues,
}: {
  initialValues?: AdminArticleFormValues;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);
  const [values, setValues] = useState<AdminArticleFormValues>(
    initialValues ?? emptyValues,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof AdminArticleFormValues>(
    key: K,
    value: AdminArticleFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

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
      update("heroImageUrl", data.url);
    } catch {
      setError("Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    if (!values.heroImageUrl.trim()) {
      setError("Envie ou informe a imagem de destaque.");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/admin/articles/${initialValues!.id}`
        : "/api/admin/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao salvar a matéria.");
        setSaving(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Falha ao salvar a matéria.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-neutral-700">
            Título *
          </span>
          <input
            required
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-neutral-700">
            Subtítulo
          </span>
          <input
            value={values.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-neutral-700">
            Resumo (aparece na listagem)
          </span>
          <textarea
            rows={2}
            value={values.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Categoria
          </span>
          <input
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Autor
          </span>
          <input
            value={values.author}
            onChange={(e) => update("author", e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-neutral-700">
            Slug (URL)
          </span>
          <input
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="gerado automaticamente a partir do título se vazio"
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
        </label>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Localização (cidade ou país)
        </span>
        <LocationPicker
          value={values.location}
          onChange={(location) => update("location", location)}
        />
        <p className="mt-2 text-xs text-neutral-400">
          Se definida, essa reportagem aparece como um marcador no mapa da
          home.
        </p>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Imagem de destaque *
        </span>
        {values.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.heroImageUrl}
            alt="Pré-visualização"
            className="mb-3 aspect-video w-full max-w-md rounded-sm border border-neutral-200 object-cover"
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
            {uploading ? "Enviando..." : "Enviar imagem"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <input
            value={values.heroImageUrl}
            onChange={(e) => update("heroImageUrl", e.target.value)}
            placeholder="ou cole a URL de uma imagem"
            className="min-w-64 flex-1 rounded-sm border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            URL do vídeo (YouTube ou Vimeo)
          </span>
          <input
            value={values.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
          />
          <span className="mt-1 block text-xs text-neutral-400">
            Se preenchido, a foto de destaque abrirá esse vídeo em um popup.
          </span>
        </label>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <GalleryItemsEditor
          items={values.galleryItems}
          onChange={(galleryItems) => update("galleryItems", galleryItems)}
        />
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Corpo da matéria (HTML simples: &lt;p&gt;, &lt;strong&gt;,
            &lt;a&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;img&gt;...)
          </span>
          <textarea
            rows={14}
            value={values.contentHtml}
            onChange={(e) => update("contentHtml", e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-neutral-900"
          />
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
            className="h-4 w-4"
          />
          <span className="font-medium text-neutral-700">
            Publicar no site
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar matéria"}
          </button>
        </div>
      </div>
    </form>
  );
}
