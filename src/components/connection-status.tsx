import { Link2Off, Signal } from "lucide-react";
import type { JSX } from "react";

interface ConnectionStatusProps {
  connected: boolean;
}

export const ConnectionStatus = ({
  connected,
}: ConnectionStatusProps): JSX.Element => {
  return (
    <div className="border-2 sm:border-4 border-black bg-white p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 border-2 sm:border-4 border-black flex items-center justify-center shrink-0 ${
              connected ? "bg-black text-white animate-pulse" : "bg-white"
            }`}
          >
            {connected ? (
              <Signal className="w-6 h-6 sm:w-8 sm:h-8" />
            ) : (
              <Link2Off className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-2xl font-display uppercase tracking-tight mb-1 leading-tight">
              {connected ? "LINK ESTABLISHED" : "AWAITING CONNECTION"}
            </div>
            <div className="text-xs sm:text-sm font-mono text-gray-600">
              {connected ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Both contactees online • Signal strength: STRONG
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Waiting for second contactee to join transmission
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right font-mono text-[0.65rem] sm:text-xs border-t sm:border-t-0 sm:border-l-2 border-black pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div className="mb-2 text-gray-600">DEVICE STATUS</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-start sm:justify-end gap-2">
              <span>RECEIVER A</span>
              <div className="w-3 h-3 bg-green-500 border border-black" />
            </div>
            <div className="flex items-center justify-start sm:justify-end gap-2">
              <span>RECEIVER B</span>
              <div
                className={`w-3 h-3 border border-black ${
                  connected ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {connected && (
        <div className="mt-4 pt-4 border-t-2 border-black text-center">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white font-mono text-[0.65rem] sm:text-xs">
            "WE MUST HEAR IT TOGETHER. THAT'S WHAT THEY WANT."
          </div>
        </div>
      )}
    </div>
  );
};
