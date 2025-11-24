"use client";

import Link from "next/link";
import { Play, Pause } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { MouseEvent } from "react";

export type BeatCardLicense = {
  id: string;
  priceCents: number;
  currency: string;
};

export type BeatCardData = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  genre?: string | null;
  coverUrl?: string | null;
  previewUrl?: string | null;
  licenses: BeatCardLicense[];
  producer: {
    name: string;
    slug: string;
  };
};

interface BeatCardProps {
  beat: BeatCardData;
}

const formatPrice = (priceCents: number, currency = "ARS") => {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });
  return formatter.format(priceCents / 100);
};

export function BeatCard({ beat }: BeatCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const hasPreview = Boolean(beat.previewUrl);
  const isCurrent = currentTrack?.id === beat.id;
  const isActive = isCurrent && isPlaying;

  const handlePlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasPreview) {
      return;
    }
    if (isCurrent) {
      togglePlay();
      return;
    }
    playTrack({
      id: beat.id,
      title: beat.title,
      src: beat.previewUrl as string,
      artwork: beat.coverUrl,
      producer: beat.producer.name,
      beatSlug: beat.slug,
      producerSlug: beat.producer.slug,
    });
  };

  const minPrice = beat.licenses.reduce((prev, license) => {
    return Math.min(prev, license.priceCents);
  }, beat.licenses[0]?.priceCents ?? 0);

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 p-4 backdrop-blur shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow">
      <div className="relative mb-4 aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-purple-400/30 to-pink-400/30 dark:from-purple-600/40 dark:to-pink-500/40">
        {beat.coverUrl ? (
          <img
            src={beat.coverUrl}
            alt={beat.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-black tracking-tighter text-gray-400 dark:text-white/50">
            {beat.title.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-black/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-white">
          {beat.genre || "Beat"}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          disabled={!hasPreview}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-white/30 bg-white/90 dark:bg-black/50 text-gray-900 dark:text-white backdrop-blur transition hover:bg-white dark:hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <Link
            href={`/beats/${beat.slug}`}
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400"
          >
            {beat.title}
          </Link>
          <p className="text-sm text-gray-600 dark:text-white/60">
            por{" "}
            <Link
              href={`/pro/${beat.producer.slug}`}
              className="hover:text-pink-600 dark:hover:text-pink-400"
            >
              {beat.producer.name}
            </Link>
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-white/70">
          {beat.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60">
              Desde
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {minPrice ? formatPrice(minPrice) : "Consultar"}
            </p>
          </div>
          <Link
            href={`/beats/${beat.slug}`}
            className="rounded-full border border-gray-300 dark:border-white/20 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white transition hover:border-gray-400 dark:hover:border-white bg-white dark:bg-transparent"
          >
            Ver licencias
          </Link>
        </div>
      </div>
    </article>
  );
}
