import VideoPoster from "./VideoPoster";
import { getVideoThumbnail } from "@/lib/video";

/** Trailer da série, logo abaixo das duas frases da abertura. */
export default function TrailerSection({
  videoUrl,
  title,
}: {
  videoUrl: string;
  title: string;
}) {
  return (
    <section id="trailer" className="bg-neutral-950 px-6 py-14 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-center text-xs font-bold tracking-widest text-amber-400 uppercase">
          Trailer da série
        </p>
        <VideoPoster
          videoUrl={videoUrl}
          imageUrl={getVideoThumbnail(videoUrl) ?? "/uploads/none"}
          title={title}
        />
      </div>
    </section>
  );
}
