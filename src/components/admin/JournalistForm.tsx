"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadField from "./UploadField";
import LocationPicker from "./LocationPicker";

export type PlaceValue = {
  key: string;
  locationId: number | null;
  name: string;
  lat: number;
  lng: number;
  label: string;
};

export type JournalistFormValues = {
  id?: number;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  conflictsCovered: string;
  spotifyUrl: string;
  places: PlaceValue[];
  displayOrder: number;
  published: boolean;
  photos: { key: string; imageUrl: string; caption: string; credit: string; locationId: string }[];
};

const empty: JournalistFormValues = {
  name: "",
  role: "",
  photoUrl: "",
  bio: "",
  conflictsCovered: "",
  spotifyUrl: "",
  places: [],
  displayOrder: 0,
  published: true,
  photos: [],
};

export default function JournalistForm({
  initialValues,
  locations,
}: {
  initialValues?: JournalistFormValues;
  locations: { id: number; name: string }[];
}) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);
  const [values, setValues] = useState<JournalistFormValues>(initialValues ?? empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof JournalistFormValues>(k: K, v: JournalistFormValues[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }
  function setPhoto(i: number, patch: Partial<JournalistFormValues["photos"][number]>) {
    setValues((p) => ({
      ...p,
      photos: p.photos.map((ph, idx) => (idx === i ? { ...ph, ...patch } : ph)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        isEditing ? `/api/admin/journalists/${initialValues!.id}` : "/api/admin/journalists",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao salvar.");
        setSaving(false);
        return;
      }
      router.push("/admin/journalists");
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Nome *</span>
          <input required value={values.name} onChange={(e) => set("name", e.target.value)} className={input} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Função</span>
          <input value={values.role} onChange={(e) => set("role", e.target.value)} placeholder="ex: Fotojornalista" className={input} />
        </label>
      </div>

      <UploadField label="Foto do jornalista" kind="image" value={values.photoUrl} onChange={(u) => set("photoUrl", u)} help="Aparece no cartão de Entrevistados, no perfil e nas aspas." />

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Perfil</span>
        <textarea rows={6} value={values.bio} onChange={(e) => set("bio", e.target.value)} className={input} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Entrevista em áudio (Spotify)</span>
        <input value={values.spotifyUrl} onChange={(e) => set("spotifyUrl", e.target.value)} placeholder="https://open.spotify.com/episode/…" className={input} />
        <span className="mt-1 block text-xs text-neutral-400">
          Link do episódio no Spotify. Aparece em “Ouça as entrevistas” e no painel do mapa, junto da aspa.
        </span>
      </label>

      <div className="border-t border-neutral-200 pt-6">
        <span className="mb-1 block text-sm font-medium text-neutral-700">Lugares onde já fez reportagem</span>
        <p className="mb-3 text-xs text-neutral-400">
          Busque cada lugar e adicione. Eles aparecem no mapa do perfil, no filtro por jornalista da seção Explorar e no
          cartão: “Jornalista - Sudão do Sul - México”. Edite o texto de cada lugar para mostrar só o país, por exemplo.
        </p>
        <ul className="mb-3 space-y-2">
          {values.places.map((pl, i) => (
            <li key={pl.key} className="flex items-center gap-2 rounded-sm border border-neutral-200 p-2">
              <input
                value={pl.label}
                onChange={(e) => set("places", values.places.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                className={input + " flex-1 text-sm"}
                aria-label="Nome exibido"
              />
              <span className="hidden text-xs text-neutral-400 sm:block">{pl.lat.toFixed(2)}, {pl.lng.toFixed(2)}</span>
              <button type="button" onClick={() => set("places", values.places.filter((_, idx) => idx !== i))} className="text-xs text-red-600 hover:text-red-800">
                Remover
              </button>
            </li>
          ))}
          {values.places.length === 0 && <li className="text-xs text-neutral-400">Nenhum lugar adicionado.</li>}
        </ul>
        <LocationPicker
          value={null}
          onChange={(r) => {
            if (!r) return;
            setValues((p) => ({
              ...p,
              places: [...p.places, { key: String(Date.now()), locationId: null, name: r.name, lat: r.lat, lng: r.lng, label: r.name }],
            }));
          }}
        />
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <span className="mb-1 block text-sm font-medium text-neutral-700">Galeria de fotos em campo</span>
        <p className="mb-3 text-xs text-neutral-400">
          Fotos do jornalista trabalhando, com autorização de uso. Se você escolher o território, a foto também aparece
          na galeria da reportagem desse conflito.
        </p>
        <div className="space-y-4">
          {values.photos.map((ph, i) => (
            <div key={ph.key} className="rounded-sm border border-neutral-200 p-3">
              <UploadField label={`Foto ${i + 1}`} kind="image" value={ph.imageUrl} onChange={(u) => setPhoto(i, { imageUrl: u })} />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input value={ph.caption} onChange={(e) => setPhoto(i, { caption: e.target.value })} placeholder="Legenda" className={input + " text-sm"} />
                <input value={ph.credit} onChange={(e) => setPhoto(i, { credit: e.target.value })} placeholder="Crédito" className={input + " text-sm"} />
                <select value={ph.locationId} onChange={(e) => setPhoto(i, { locationId: e.target.value })} className={input + " text-sm"}>
                  <option value="">Só no perfil</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => set("photos", values.photos.filter((_, idx) => idx !== i))} className="mt-2 text-xs text-red-600 hover:text-red-800">
                Remover foto
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("photos", [...values.photos, { key: String(Date.now()), imageUrl: "", caption: "", credit: "", locationId: "" }])}
          className="mt-3 rounded-sm border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          + Adicionar foto
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
        <div className="flex items-center gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4" />
            <span className="font-medium text-neutral-700">Aparece no site</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-medium text-neutral-700">Ordem</span>
            <input type="number" value={values.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} className="w-20 rounded-sm border border-neutral-300 px-2 py-1" />
          </label>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/journalists")} className="rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-sm bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
            {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar jornalista"}
          </button>
        </div>
      </div>
    </form>
  );
}
