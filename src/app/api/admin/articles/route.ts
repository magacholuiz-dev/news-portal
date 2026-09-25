import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { parseGalleryItems } from "@/lib/gallery";
import { findOrCreateLocation, parseLocationInput } from "@/lib/location";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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

  const baseSlug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : slugify(body.title);

  let slug = baseSlug || `materia-${Date.now()}`;
  let attempt = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const galleryItems = parseGalleryItems(body.galleryItems);
  const locationInput = parseLocationInput(body.location);
  const location = locationInput
    ? await findOrCreateLocation(locationInput)
    : null;

  const article = await prisma.article.create({
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
      published: Boolean(body.published),
      publishedAt: body.published ? new Date() : null,
      locationId: location?.id ?? null,
      galleryItems: {
        create: galleryItems.map((item, index) => ({ ...item, order: index })),
      },
    },
    include: {
      galleryItems: { orderBy: { order: "asc" } },
      location: true,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
