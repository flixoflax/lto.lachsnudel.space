import { type JSX, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ConnectionStatus } from "./components/connection-status";
import { EpisodeList } from "./components/episode-list";
import { PodcastPlayer } from "./components/podcast-player";
import { parsePodcastFeed } from "./lib/rss-parser";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

// Shared room/session ID - you could make this dynamic
const ROOM_ID = "fils";

interface Episode {
  guid: string;
  title: string;
  audioUrl: string;
  duration: string;
  pubDate: string;
}

interface PlaybackState {
  episodeGuid: string | null;
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: string;
  updatedBy: string;
}

export const App = (): JSX.Element => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    episodeGuid: null,
    isPlaying: false,
    currentTime: 0,
    lastUpdated: new Date().toISOString(),
    updatedBy: "local",
  });
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const localClientId = useRef(Math.random().toString(36).slice(7));
  const isSyncing = useRef(false);

  // Load podcast episodes
  useEffect(() => {
    const loadEpisodes = async () => {
      const feedUrl =
        "https://test.cors.workers.dev/?https://letscast.fm/podcasts/die-rechtslage-lto-dc1b8125/feed";

      try {
        const response = await fetch(feedUrl);
        const text = await response.text();
        const parsed = parsePodcastFeed(text);

        setEpisodes(parsed);
      } catch (error) {
        console.error("Failed to load podcast feed:", error);
      }
    };

    loadEpisodes();
  }, []);

  // Load audio when episode changes locally
  useEffect(() => {
    if (!playbackState.episodeGuid || !audioRef.current) {
      return;
    }

    const episode = episodes.find((e) => e.guid === playbackState.episodeGuid);

    if (episode && audioRef.current.src !== episode.audioUrl) {
      console.info("Loading new episode:", episode.title);
      audioRef.current.src = episode.audioUrl;
      audioRef.current.currentTime = playbackState.currentTime;

      // If it should be playing, play it
      // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler
      if (playbackState.isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Failed to autoplay:", error);
        });
      }
    }
  }, [
    playbackState.episodeGuid,
    episodes,
    playbackState.currentTime,
    playbackState.isPlaying,
  ]);

  // Initialize Supabase Realtime
  useEffect(() => {
    const channel = supabase.channel(ROOM_ID);

    // Subscribe to playback state changes
    channel
      .on(
        "broadcast",
        { event: "playback-update" },
        ({ payload }: { payload: PlaybackState }) => {
          if (payload.updatedBy !== localClientId.current) {
            isSyncing.current = true;
            setPlaybackState(payload);

            // Sync audio element
            if (audioRef.current) {
              if (payload.episodeGuid !== playbackState.episodeGuid) {
                // Episode changed
                const episode = episodes.find(
                  (e) => e.guid === payload.episodeGuid,
                );

                if (episode) {
                  audioRef.current.src = episode.audioUrl;
                  audioRef.current.currentTime = payload.currentTime;
                }
              } else {
                // Same episode, sync time if drift > 2 seconds
                const drift = Math.abs(
                  audioRef.current.currentTime - payload.currentTime,
                );

                if (drift > 2) {
                  audioRef.current.currentTime = payload.currentTime;
                }
              }

              if (payload.isPlaying) {
                audioRef.current.play().catch((error) => {
                  console.error("Failed to play from remote command:", error);
                });
              } else {
                audioRef.current.pause();
              }
            }

            setTimeout(() => {
              isSyncing.current = false;
            }, 100);
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);

        setIsConnected(users.length > 1);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user: localClientId.current,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [episodes, playbackState.episodeGuid]);

  const broadcastPlaybackState = (newState: Partial<PlaybackState>) => {
    if (isSyncing.current) {
      return;
    }

    const updatedState = {
      ...playbackState,
      ...newState,
      lastUpdated: new Date().toISOString(),
      updatedBy: localClientId.current,
    };

    setPlaybackState(updatedState);

    supabase.channel(ROOM_ID).send({
      type: "broadcast",
      event: "playback-update",
      payload: updatedState,
    });
  };

  const handlePlay = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        broadcastPlaybackState({ isPlaying: true });
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    } else {
      broadcastPlaybackState({ isPlaying: true });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    broadcastPlaybackState({ isPlaying: false });
  };

  const handleTimeUpdate = (time: number) => {
    // Only broadcast time updates every 3 seconds to reduce traffic
    if (Math.floor(time) % 3 === 0) {
      broadcastPlaybackState({ currentTime: time });
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    broadcastPlaybackState({ currentTime: time });
  };

  const handleEpisodeSelect = (episode: Episode) => {
    broadcastPlaybackState({
      episodeGuid: episode.guid,
      currentTime: 0,
      isPlaying: false,
    });
  };

  const currentEpisode = episodes.find(
    (e) => e.guid === playbackState.episodeGuid,
  );

  return (
    <div className="min-h-screen font-serif">
      {/* Newspaper Header */}
      <header className="border-b-4 border-black ">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[0.65rem] sm:text-xs mb-2 font-mono tracking-wider">
            <span>EST. 2024</span>
            <span className="hidden sm:block uppercase">
              Synchronized Listening Device
            </span>
            <span>Device-NO. 1</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-center tracking-tight py-2">
            LACHSNUDEL.SPACE
          </h1>
          <div className="text-center text-[0.65rem] sm:text-xs mt-2 tracking-widest font-mono">
            LTO — SYNCHRONIZED RECEIVER
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <ConnectionStatus connected={isConnected} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-black text-white px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm ">
              ACTIVE TRANSMISSION
            </div>
            <div className="border-2 sm:border-4 border-black p-4 sm:p-6 bg-white">
              {currentEpisode ? (
                <PodcastPlayer
                  episode={currentEpisode}
                  isPlaying={playbackState.isPlaying}
                  currentTime={playbackState.currentTime}
                  audioRef={audioRef}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onTimeUpdate={handleTimeUpdate}
                  onSeek={handleSeek}
                />
              ) : (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-400">
                  <p className="text-lg sm:text-xl font-mono">
                    NO SIGNAL DETECTED
                  </p>
                  <p className="text-xs sm:text-sm mt-2 text-gray-600">
                    Select an episode to begin synchronized playback
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Episode List */}
          <div className="lg:col-span-1">
            <EpisodeList
              episodes={episodes}
              currentEpisodeGuid={playbackState.episodeGuid}
              onEpisodeSelect={handleEpisodeSelect}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center text-[0.65rem] sm:text-xs font-mono border-t-2 border-black pt-4">
          <p className="italic mb-2">
            "They want us linked," F. explained. "Even apart."
          </p>
          <p className="text-gray-600">
            Device syncs signal to both contactees regardless of location
          </p>
        </footer>
      </div>
    </div>
  );
};
