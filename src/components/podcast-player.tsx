import { BookOpen, ChevronDown, ChevronUp, Pause, Play } from "lucide-react";
import {
  type JSX,
  type MouseEvent,
  type RefObject,
  useEffect,
  useState,
} from "react";
import type { Episode } from "../lib/rss-parser";

interface PodcastPlayerProps {
  episode: Episode;
  isPlaying: boolean;
  currentTime: number;
  audioRef: RefObject<HTMLAudioElement | null>;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
  onChapterSelect?: (chapterStart: number) => void;
}

const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const PodcastPlayer = ({
  episode,
  isPlaying,
  currentTime,
  audioRef,
  onPlay,
  onPause,
  onTimeUpdate,
  onSeek,
  onChapterSelect,
}: PodcastPlayerProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [showDescription, setShowDescription] = useState(false);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [showChapters, setShowChapters] = useState(false);

  // Find current chapter
  const currentChapter = episode.chapters?.reduce((prev, curr) => {
    if (curr.start <= currentTime) {
      return curr;
    }

    return prev;
  }, episode.chapters[0]);

  // Handle timeupdate events
  // eslint-disable-next-line react-you-might-not-need-an-effect/no-manage-parent
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      onTimeUpdate(audio.currentTime);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef, onTimeUpdate]);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;

    if (!audio?.duration) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audio.duration;

    onSeek(newTime);
  };

  const handleChapterClick = (chapterStart: number) => {
    onSeek(chapterStart);
    if (onChapterSelect) {
      onChapterSelect(chapterStart);
    }
  };

  const duration = audioRef.current?.duration || 0;

  return (
    <div>
      <audio ref={audioRef} preload="metadata" />

      {/* Episode Info */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display mb-2 leading-tight uppercase tracking-tight">
          {episode.title}
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-[0.65rem] sm:text-xs font-mono text-gray-600">
          <span>
            BROADCAST: {new Date(episode.pubDate).toLocaleDateString("de-DE")}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            DURATION: {duration ? formatTime(duration) : episode.duration}
          </span>
          {currentChapter &&
            episode.chapters &&
            episode.chapters.length > 1 && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-black font-bold">
                  CHAPTER: {currentChapter.title}
                </span>
              </>
            )}
        </div>

        {/* Description Toggle */}
        {episode.description && (
          <div className="mt-3 sm:mt-4">
            <button
              className="flex items-center gap-2 text-xs sm:text-sm font-mono hover:bg-gray-100 px-2 py-1 border border-black transition-colors"
              onClick={() => {
                setShowDescription(!showDescription);
              }}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>EPISODE DETAILS</span>
              {showDescription ? (
                <ChevronUp className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0" />
              )}
            </button>
            {showDescription && (
              <div className="mt-2 p-3 sm:p-4 border-2 border-black bg-gray-50 text-xs sm:text-sm leading-relaxed max-h-48 sm:max-h-60 overflow-y-auto wrap-break-word overflow-x-hidden">
                {episode.description}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chapters Section */}
      {episode.chapters && episode.chapters.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <button
            className="w-full flex items-center justify-between gap-2 text-xs sm:text-sm font-mono bg-black text-white px-3 py-2 hover:bg-gray-800 transition-colors"
            onClick={() => {
              setShowChapters(!showChapters);
            }}
          >
            <span>CHAPTER NAVIGATION ({episode.chapters.length})</span>
            {showChapters ? (
              <ChevronUp className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" />
            )}
          </button>
          {showChapters && (
            <div className="border-2 border-black border-t-0 bg-white max-h-48 sm:max-h-64 overflow-y-auto overflow-x-hidden">
              {episode.chapters.map((chapter, index) => {
                const isActive = currentChapter?.start === chapter.start;

                return (
                  <button
                    key={index}
                    className={`w-full text-left px-3 py-2.5 border-b border-gray-200 hover:bg-gray-100 transition-colors text-xs sm:text-sm ${
                      isActive ? "bg-gray-200 font-bold" : ""
                    }`}
                    onClick={() => {
                      handleChapterClick(chapter.start);
                    }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="font-mono text-gray-600 shrink-0 text-[0.65rem] sm:text-xs">
                        {chapter.startFormatted}
                      </span>
                      <span
                        className={`wrap-break-word ${isActive ? "text-black" : ""}`}
                      >
                        {chapter.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Waveform Visual - Hidden on mobile */}
      <div className="hidden md:block border-2 border-black p-4 bg-[#f9f9f9] mb-6">
        <div className="flex items-center justify-center h-24 gap-1">
          {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
          {Array.from({ length: 60 }).map((_, i) => {
            const height = Math.random() * 100;
            const isActive = audioRef.current
              ? i / 60 <
                audioRef.current.currentTime / (audioRef.current.duration || 1)
              : false;

            return (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`flex-1 transition-all ${
                  isActive ? "bg-black" : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Play/Pause Button */}
        <button
          className="w-16 h-16 sm:w-20 sm:h-20 border-2 sm:border-4 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center group shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" />
          ) : (
            <Play className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Time Display */}
          <div className="flex justify-between text-xs sm:text-sm font-mono mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : episode.duration}</span>
          </div>

          {/* Progress Bar - Now clickable! */}
          <div
            className="border-2 border-black bg-white h-3 sm:h-4 cursor-pointer hover:bg-gray-50 transition-colors"
            role="progressbar"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-label="Seek audio"
            onClick={handleProgressClick}
          >
            <div
              className="bg-black h-full transition-all pointer-events-none"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Sync Indicator */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="inline-block border-2 border-black px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white font-mono text-[0.65rem] sm:text-xs">
          {isPlaying
            ? "SYNCHRONIZED TRANSMISSION ACTIVE"
            : "TRANSMISSION PAUSED"}
        </div>
      </div>
    </div>
  );
};
