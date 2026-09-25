import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { parseGalleryItems } from "@/lib/gallery";
import { findOrCreateLocation, parseLocationInput } from "@/lib/location";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: {
      galleryItems: { orderBy: { order: "asc" } },
      location: true,
    },
  });

  if (!article) {
    return NextResponse.json(
      { error: "Matéria não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({ article });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const articleId = Number(id);

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Matéria não encontrada." },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json(
      { error: "O título é obrigatório." },
      { status: 400 },
    );
  }
  if (typeof body.heroImageUrl !== "string" || !body.heroImageUrl.trim()) {
    return NextResponse.json(
      { error: "A imagem de destaque é obrigatória." },
      { status: 400 },
    );
  }

  let slug = existing.slug;
  const desiredSlug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : slugify(body.title);

  if (desiredSlug && desiredSlug !== existing.slug) {
    slug = desiredSlug;
    let attempt = 1;
    while (
      await prisma.article.findFirst({
        where: { slug, NOT: { id: articleId } },
      })
    ) {
      attempt += 1;
      slug = `${desiredSlug}-${attempt}`;
    }
  }

  const wasPublished = existing.published;
  const willBePublished = Boolean(body.published);

  const galleryItems = parseGalleryItems(body.galleryItems);
  const locationInput = parseLocationInput(body.location);
  const location = locationInput
    ? await findOrCreateLocation(locationInput)
    : null;

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      slug,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      excerpt: body.excerpt?.trim() || null,
      heroImageUrl: body.heroImageUrl.trim(),
      videoUrl: body.videoUrl?.trim() || null,
      contentHtml: sanitizeArticleHtml(body.contentHtml ?? ""),
      author: body.author?.trim() || null,
      category: body.category?.trim() || null,
      published: willBePublished,
      publishedAt: willBePublished
        ? (existing.publishedAt ?? new Date())
        : wasPublished
          ? existing.publishedAt
          : null,
      locationId: location?.id ?? null,
      galleryItems: {
        deleteMany: {},
        create: galleryItems.map((item, index) => ({ ...item, order: index })),
      },
    },
    include: {
      galleryItems: { orderBy: { order: "asc" } },
      location: true,
    },
  });

  return NextResponse.json({ article });
}

/** Atualização parcial — usado para alternar rapidamente o status de publicação. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const articleId = Number(id);

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Matéria não encontrada." },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.published !== "boolean") {
    return NextResponse.json(
      { error: "Campo 'published' é obrigatório." },
      { status: 400 },
    );
  }

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      published: body.published,
      publishedAt: body.published
        ? (existing.publishedAt ?? new Date())
        : existing.publishedAt,
    },
  });

  return NextResponse.json({ article });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.article
    .delete({ where: { id: Number(id) } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
