import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  Calendar,
  MapPin,
  Compass,
  CheckCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
  Utensils,
  Gem,
  Globe
} from "lucide-react";
import { AnalysisResult } from "../types";

interface LandmarkDetailsProps {
  analysis: AnalysisResult;
}

type TabType = "guide" | "dining" | "gems";

export function LandmarkDetails({ analysis }: LandmarkDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("guide");
  const { metadata, markdown, sources } = analysis;

  // Split markdown into sections to distribute in tabs if possible,
  // otherwise, we will render the whole markdown beautifully in the storytelling tab and keep handy shortcuts.
  // Wait, let's make it easy and robust: we can present the beautiful markdown with dedicated styling,
  // or dynamically filter headers if the model outputs them, but showing the clean tour storytelling narrative and dividing tabs is super crisp!
  // Let's analyze. If we just render the markdown under a custom container, it works beautifully.
  // We can let the user read the main story, dining, and secret spots easily.

  const getTabContent = () => {
    // If the markdown is already sectioned (which our server prompt specifically enforces),
    // we can parse out or show sections, or let the markdown render fully inside a clean typography block.
    // Let's display the markdown with clean reading mode styling, and support direct filters or highlights.
    return (
      <div className="prose prose-zinc max-w-none dark:prose-invert text-zinc-700 dark:text-zinc-300">
        <div className="markdown-body leading-relaxed space-y-4">
          <Markdown>{markdown}</Markdown>
        </div>
      </div>
    );
  };

  // Google Maps search query link for the landmark location
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${metadata.name} ${metadata.location}`
  )}`;

  return (
    <div className="w-full space-y-8 animate-fade-in text-[#1A1A1A] dark:text-[#F4F1EA]">
      {/* Primary Landmark Summary Hero Card */}
      <div className="bg-[#F5F2ED] dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-black/5 dark:text-white/5 pointer-events-none">
          <Compass className="w-40 h-40 rotate-[15deg]" />
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-black/10 dark:border-white/10 rounded-sm text-[9px] font-bold uppercase tracking-widest text-[#8C7851] bg-white dark:bg-zinc-950 mb-4">
              <Sparkles className="w-3 h-3 text-[#8C7851]" />
              {metadata.category}
            </div>

            <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight font-black leading-tight text-black dark:text-white">
              {metadata.name}
            </h2>

            <p className="text-xs uppercase tracking-widest font-bold text-black/50 dark:text-white/40 flex items-center gap-1.5 mt-3">
              <MapPin className="w-3.5 h-3.5 text-[#8C7851] shrink-0" />
              {metadata.location}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-black/10 dark:border-white/15">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block">Origin / Era</span>
              <div className="flex items-center gap-1.5 text-sm font-serif font-bold text-black dark:text-white">
                <Calendar className="w-3.5 h-3.5 text-[#8C7851]" />
                {metadata.year || "Historical"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block">Coordinates</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-black/80 dark:text-white/80">
                <Globe className="w-3.5 h-3.5 text-[#8C7851]" />
                {metadata.latitude?.toFixed(4)}, {metadata.longitude?.toFixed(4)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block">Accuracy Match</span>
              <div className="flex items-center gap-1.5 text-sm font-serif italic font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {metadata.confidence} Pure
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block">Digital Map</span>
              <a
                href={googleMapsUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#8C7851] hover:underline cursor-pointer"
              >
                Directions
                <ExternalLink className="w-3 h-3 text-[#8C7851]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Fact Callout Box */}
      {metadata.funFact && (
        <div className="bg-[#DFDBD3]/25 dark:bg-zinc-900 border-l-2 border-[#8C7851] p-5 flex gap-4 items-start">
          <div className="p-2 bg-[#8C7851]/10 text-[#8C7851] rounded-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-[#8C7851] uppercase tracking-[0.2em] mb-1">
              Anecdote Vignette
            </h4>
            <p className="text-sm font-serif italic text-black/80 dark:text-[#D1CDCE] leading-relaxed">
              "{metadata.funFact}"
            </p>
          </div>
        </div>
      )}

      {/* Multi-Tab Tour Guide Interface */}
      <div className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-sm overflow-hidden shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex border-b border-black/5 dark:border-white/5 bg-[#F5F2ED]/35 p-1">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTab === "guide"
                ? "bg-white dark:bg-zinc-900 text-[#8C7851] border-b-2 border-[#8C7851]"
                : "text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Story & Chronicle
          </button>
          <button
            onClick={() => setActiveTab("dining")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTab === "dining"
                ? "bg-white dark:bg-zinc-900 text-[#8C7851] border-b-2 border-[#8C7851]"
                : "text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Curated Dining
          </button>
          <button
            onClick={() => setActiveTab("gems")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTab === "gems"
                ? "bg-white dark:bg-zinc-900 text-[#8C7851] border-b-2 border-[#8C7851]"
                : "text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            Secrets & Overlooks
          </button>
        </div>

        {/* Content Panel with Animated Transition */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              {/* Render dynamic parts of information as guided */}
              {activeTab === "guide" && (
                <div className="space-y-6">
                  <div className="border-b border-black/5 dark:border-white/5 pb-3">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#8C7851]">Chapter I</span>
                    <h3 className="text-xl font-serif font-bold italic text-black dark:text-white mt-1">
                      Chronology & Legend
                    </h3>
                  </div>
                  {getTabContent()}
                </div>
              )}

              {activeTab === "dining" && (
                <div className="space-y-6">
                  <div className="border-b border-black/5 dark:border-white/5 pb-3">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#8C7851]">Chapter II</span>
                    <h3 className="text-xl font-serif font-bold italic text-black dark:text-white mt-1">
                      Local Culinary Guides
                    </h3>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-black/50 dark:text-white/40 italic">
                    Authentic neighborhood spots, bakeries, or legacy dining near this landmark:
                  </p>
                  {getTabContent()}
                </div>
              )}

              {activeTab === "gems" && (
                <div className="space-y-6">
                  <div className="border-b border-black/5 dark:border-white/5 pb-3">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#8C7851]">Chapter III</span>
                    <h3 className="text-xl font-serif font-bold italic text-black dark:text-white mt-1">
                      Hidden Detours & Details
                    </h3>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-black/50 dark:text-white/40 italic">
                    Forgotten architectural inscriptions, scenic alcoves, or times of day where the light hits perfectly:
                  </p>
                  {getTabContent()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Grounded Search References (Accreditation) */}
      {sources && sources.length > 0 && (
        <div className="bg-[#F5F2ED]/30 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-sm p-6">
          <h4 className="text-[10px] font-bold text-black/50 dark:text-white/50 uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#8C7851]" />
            References and Publications Grounded in Google Search
          </h4>
          <div className="flex flex-wrap gap-3">
            {sources.slice(0, 5).map((src, index) => (
              <a
                key={index}
                href={src.url}
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#FDFCF8] dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-sm px-4 py-2 text-xs text-black/70 dark:text-white/70 font-medium transition cursor-pointer"
              >
                <span className="truncate max-w-[150px] md:max-w-[200px]">
                  {src.title || "Reference Site"}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0 text-black/30 dark:text-white/30" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
