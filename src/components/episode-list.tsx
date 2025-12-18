import { Radio } from "lucide-react";
import type { JSX } from "react";
import type { Episode } from "../lib/rss-parser";

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeGuid: string | null;
  onEpisodeSelect: (episode: Episode) => void;
}

export const EpisodeList = ({
  episodes,
  currentEpisodeGuid,
  onEpisodeSelect,
}: EpisodeListProps): JSX.Element => {
  return (
    <div className="border-2 sm:border-4 border-black bg-white">
      <div className="bg-black text-white px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm border-b-2 border-white">
        AVAILABLE TRANSMISSIONS
      </div>

      <div className="max-h-100 sm:max-h-150 overflow-y-auto">
        {episodes.map((episode, index) => {
          return (
            <button
              key={episode.guid}
              className={`w-full text-left p-3 sm:p-4 border-b-2 border-gray-200 hover:bg-gray-100 transition-colors ${
                episode.guid === currentEpisodeGuid
                  ? "bg-black text-white hover:bg-black"
                  : ""
              }`}
              onClick={() => {
                onEpisodeSelect(episode);
              }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1 shrink-0">
                  {episode.guid === currentEpisodeGuid ? (
                    <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[0.65rem] sm:text-xs font-mono mb-1 opacity-70">
                    #{episodes.length - index}
                  </div>
                  <div className="font-bold text-xs sm:text-sm leading-tight mb-1.5 sm:mb-2">
                    {episode.title.replace(`#${48 - index} `, "")}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-[0.6rem] sm:text-xs font-mono opacity-60">
                    <span>
                      {new Date(episode.pubDate).toLocaleDateString("de-DE")}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{episode.duration}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-2 sm:p-3 bg-gray-100 border-t-2 border-black text-center text-[0.65rem] sm:text-xs font-mono">
        {episodes.length} EPISODES INDEXED
      </div>
    </div>
  );
};
