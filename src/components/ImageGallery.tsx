import HeroImageWithVideoModal from "./HeroImageWithVideoModal";

export type GalleryItemData = {
  id: number;
  imageUrl: string;
  videoUrl: string | null;
  caption: string | null;
};

export default function ImageGallery({
  items,
  articleTitle,
}: {
  items: GalleryItemData[];
  articleTitle: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="mb-4 font-serif text-xl font-bold text-neutral-900">
        Galeria
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <figure key={item.id}>
            <HeroImageWithVideoModal
              imageUrl={item.imageUrl}
              videoUrl={item.videoUrl}
              alt={item.caption ?? articleTitle}
            />
            {item.caption && (
              <figcaption className="mt-1.5 text-xs text-neutral-500">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
