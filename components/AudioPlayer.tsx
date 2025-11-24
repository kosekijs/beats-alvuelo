"use client";

import { Play, Pause } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { MouseEvent } from "react";

interface AudioPlayerProps {
  trackId: string;
  src: string;
  title: string;
  artwork?: string | null;
  producer?: string;
  beatSlug: string;
  producerSlug?: string;
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function AudioPlayer({
  trackId,
  src,
  title,
  artwork,
  producer,
  beatSlug,
  producerSlug,
}: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    currentTime,
    duration,
    seek,
  } = usePlayer();
  const isActive = currentTrack?.id === trackId;
  const progress =
    isActive && duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleToggle = () => {
    if (!isActive) {
      playTrack({
        id: trackId,
        src,
        title,
        artwork,
        producer,
        beatSlug,
        producerSlug,
      });
      return;
    }
    togglePlay();
  };

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    if (!isActive || duration === 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const newProgress = clickPosition / rect.width;
    seek(newProgress * duration);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          {artwork ? (
            <img
              src={artwork}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-white/70">
              {title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/60">{producer}</p>
          <p className="text-lg font-semibold">{title}</p>
          <div
            className="mt-3 h-2 w-full cursor-pointer rounded-full bg-white/10"
            onClick={handleSeek}
          >
            <div
              className={clsx(
                "h-full rounded-full bg-linear-to-r from-pink-500 to-orange-500 transition-all",
                { "w-full": progress >= 100 }
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-white/60">
            <span>{isActive ? formatTime(currentTime) : "0:00"}</span>
            <span>{isActive ? formatTime(duration) : "0:00"}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white"
        >
          {isActive && isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
    </div>
  );
}
