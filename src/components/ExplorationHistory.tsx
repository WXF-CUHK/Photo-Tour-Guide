import React from "react";
import { Compass, Calendar, ArrowUpRight, Trash2, MapPin } from "lucide-react";
import { ExplorationHistoryItem } from "../types";

interface ExplorationHistoryProps {
  history: ExplorationHistoryItem[];
  onSelectHistoryItem: (item: ExplorationHistoryItem) => void;
  onClearHistory: () => void;
  activeItemId: string | undefined;
}

export function ExplorationHistory({
  history,
  onSelectHistoryItem,
  onClearHistory,
  activeItemId
}: ExplorationHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-[#F5F2ED]/45 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-sm p-6 text-center space-y-4">
        <div className="mx-auto w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-[#8C7851]">
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F4F1EA]">
            Chronicle Log is Empty
          </h4>
          <p className="text-xs text-black/50 dark:text-white/40 mt-1 max-w-[200px] mx-auto">
            Uploaded plates, verified locations, and travel narratives will record here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[#1A1A1A] dark:text-[#F4F1EA]">
      <div className="flex items-center justify-between border-b border-black/5 pb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-1.5 text-black/60 dark:text-white/60">
          <Compass className="w-3.5 h-3.5 text-[#8C7851]" />
          Travel Chronicles ({history.length})
        </h3>
        <button
          onClick={onClearHistory}
          className="text-[9px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-350 flex items-center gap-1 bg-transparent border-0 cursor-pointer p-1"
        >
          <Trash2 className="w-3 h-3" />
          Purge Logs
        </button>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isActive = item.id === activeItemId;
          const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <button
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className={`w-full text-left flex items-center gap-4.5 p-2 rounded-sm transition duration-150 border cursor-pointer ${
                isActive
                  ? "bg-[#F5F2ED] border-[#8C7851] dark:bg-zinc-900 dark:border-zinc-700"
                  : "bg-white border-black/5 hover:border-black/10 hover:bg-[#FDFCF8]/55 dark:bg-zinc-950 dark:border-white/5 dark:hover:bg-zinc-900/60"
              }`}
            >
              {/* Image thumbnail preview */}
              <div className="w-14 h-14 rounded-sm overflow-hidden shrink-0 bg-[#E8E6E1] dark:bg-zinc-900 flex items-center justify-center border border-black/5 dark:border-white/5">
                <img
                  src={`data:${item.mimeType};base64,${item.imageBase64}`}
                  alt={item.analysis.metadata.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text content block */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <h4 className="text-[9px] font-bold text-[#8C7851] tracking-widest uppercase">
                  {item.analysis.metadata.category || "Monument"}
                </h4>
                <h3 className="text-sm font-serif font-black italic text-black dark:text-white truncate">
                  {item.analysis.metadata.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] uppercase font-semibold text-black/50 dark:text-white/40 truncate">
                  <span className="flex items-center gap-0.5 shrink-0">
                    <MapPin className="w-3 h-3 text-[#8C7851]" />
                    {item.analysis.metadata.location}
                  </span>
                  <span className="text-black/20 dark:text-white/20">•</span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Calendar className="w-3 h-3 text-black/30 dark:text-white/30" />
                    {dateStr}
                  </span>
                </div>
              </div>

              {/* Indicator Arrow */}
              <div
                className={`p-1.5 rounded-sm shrink-0 border ${
                  isActive
                    ? "text-[#8C7851] border-[#8C7851]/30 bg-white dark:bg-zinc-800"
                    : "text-black/30 border-black/5 bg-[#FDFCF8] dark:bg-zinc-900 dark:border-white/5"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
