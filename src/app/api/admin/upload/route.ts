import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const AUDIO_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
// Funções da Vercel aceitam corpo de até ~4,5MB: áudios curtos (até 1 min
// em mp3/m4a) cabem folgados; arquivo maior deve ser hospedado fora e
// colado como URL.
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 },
    );
  }

  const isAudio = file.type in AUDIO_TYPES;
  const extension = ALLOWED_TYPES[file.type] ?? AUDIO_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      {
        error:
          "Tipo de arquivo não suportado. Use JPG, PNG, WebP ou áudio MP3/M4A/WAV.",
      },
      { status: 400 },
    );
  }

  if (isAudio && file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      {
        error:
          "Áudio muito grande (máximo 4MB). Corte o trecho ou cole a URL de um áudio hospedado.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo de 8MB." },
      { status: 400 },
    );
  }

  const filename = `${isAudio ? "audio" : "articles"}/${randomUUID()}.${extension}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}
