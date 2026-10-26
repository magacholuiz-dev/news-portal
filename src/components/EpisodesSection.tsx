import VideoPoster from "./VideoPoster";
import EpisodeCard from "./EpisodeCard";
import SpotifyCard from "./SpotifyCard";
import { getVideoThumbnail } from "@/lib/video";

export type EpisodeItem = {
  id: number;
  title: string;
  videoUrl: string;
  duration: string | null;
};

export type InterviewAudio = {
  slug: string;
  name: string;
  role: string | null;
  photoUrl: string | null;
  spotifyUrl: string;
};

/** Logo depois da abertura: texto de introdução, os episódios da série
 * (YouTube) e as entrevistas em áudio (Spotify). Só aparece depois que algo
 * for cadastrado no admin. */
export default function EpisodesSection({
  title,
  intro,
  trailerUrl,
  episodes,
  interviews,
  siteTitle,
}: {
  title: string;
  intro: string;
  trailerUrl: string;
  episodes: EpisodeItem[];
  interviews: InterviewAudio[];
  siteTitle: string;
}) {
  if (!title && !intro && !trailerUrl && episodes.length === 0 && interviews.length === 0) {
    return null;
  }
  return (
    <section id="episodios" className="scroll-mt-16 bg-neutral-950 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-bold tracking-widest text-amber-400 uppercase">A série</p>
        {title && (
          <h2 className="max-w-3xl font-serif text-4xl leading-none font-black text-white sm:text-6xl">{title}</h2>
        )}
        {intro && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed whitespace-pre-line text-neutral-300 sm:text-base">
            {intro}
          </p>
        )}

        {trailerUrl && (
          <div className="mt-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold tracking-widest text-neutral-400 uppercase">Trailer</p>
            <VideoPoster
              videoUrl={trailerUrl}
              imageUrl={getVideoThumbnail(trailerUrl) ?? "/uploads/none"}
              title={siteTitle}
            />
          </div>
        )}

        {episodes.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {episodes.map((e, i) => (
              <EpisodeCard key={e.id} number={i + 1} title={e.title} duration={e.duration} videoUrl={e.videoUrl} />
            ))}
          </div>
        )}

        {interviews.length > 0 && (
          <div className="mt-14 border-t border-white/10 pt-10">
            <p className="mb-2 text-xs font-bold tracking-widest text-amber-400 uppercase">Ouça as entrevistas</p>
            <p className="mb-6 max-w-2xl text-sm text-neutral-400">
              As conversas completas com os jornalistas, no Spotify.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interviews.map((j) => (
                <SpotifyCard key={j.slug} name={j.name} role={j.role} photoUrl={j.photoUrl} spotifyUrl={j.spotifyUrl} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
