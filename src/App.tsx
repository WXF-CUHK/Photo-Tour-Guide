import React, { useState, useEffect } from "react";
import { PhotoUploader } from "./components/PhotoUploader";
import { LandmarkDetails } from "./components/LandmarkDetails";
import { ExplorationHistory } from "./components/ExplorationHistory";
import { AnalysisResult, ExplorationHistoryItem } from "./types";
import { SAMPLE_LANDMARKS } from "./data/samples";
import {
  Compass,
  MapPin,
  Sparkles,
  Navigation,
  Globe,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  BookOpen
} from "lucide-react";

const loadingQuotes = [
  "Visualizing landmark signatures against global archives...",
  "Retrieving local chronicles and historical facts...",
  "Sifting Google Search for verified cultural anecdotes...",
  "Pinpointing authentic nearby dining recommendations...",
  "Scouting quiet walking alleys and hidden gems...",
  "Polishing your personalized Tour Guide narrative..."
];

export default function App() {
  // Photo select states
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeMime, setActiveMime] = useState<string>("image/jpeg");

  // Geolocation states
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"unrequested" | "fetching" | "available" | "denied">("unrequested");

  // Loading & error handles
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState<number>(0);

  // Active tour guide metadata results
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);

  // Travel Diary history list
  const [historyList, setHistoryList] = useState<ExplorationHistoryItem[]>([]);

  // Coordinates retrieval effect
  useEffect(() => {
    requestLocation();
  }, []);

  // Sync loading quotes cycle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingQuoteIndex(0);
      interval = setInterval(() => {
        setLoadingQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  // Load adventure history diary on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem("photo_tourism_history_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistoryList(parsed);
        // Load the latest visited landmark automatically as the default welcome landing!
        if (parsed.length > 0) {
          setActiveAnalysis(parsed[0].analysis);
        }
      }
    } catch (e) {
      console.warn("Could not read travel log history from localStorage:", e);
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus("available");
      },
      (err) => {
        console.warn("Geolocation access rejected or failed:", err);
        setLocationStatus("denied");
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoSelected = (base64Data: string, mimeType: string) => {
    setActivePhoto(base64Data);
    setActiveMime(mimeType);
    setErrorMessage(null);
    
    // Automatically trigger analysis on selection/camera capture!
    triggerAnalysis(base64Data, mimeType);
  };

  const triggerAnalysis = async (photoBase64: string, mime: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze-landmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: photoBase64,
          mimeType: mime,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setActiveAnalysis(data);

      // Add to persistent travel diary log
      const logItem: ExplorationHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        imageBase64: photoBase64,
        mimeType: mime,
        analysis: data,
      };

      const updatedLogs = [logItem, ...historyList];
      setHistoryList(updatedLogs);
      localStorage.setItem("photo_tourism_history_v1", JSON.stringify(updatedLogs));

    } catch (err: any) {
      console.error("[App] Analysis failed:", err);
      setErrorMessage(err.message || "We ran into an obstacle analyzing this photo. Please double check your Gemini secret key settings.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_LANDMARKS[0]) => {
    setErrorMessage(null);
    setActivePhoto(sample.imageBase64);
    setActiveMime("image/png");
    setActiveAnalysis(sample.analysis);

    // Add to history if not exists
    const alreadyExists = historyList.some((item) => item.analysis.metadata.name === sample.name);
    if (!alreadyExists) {
      const logItem: ExplorationHistoryItem = {
        id: sample.id,
        timestamp: new Date().toISOString(),
        imageBase64: sample.imageBase64,
        mimeType: "image/png",
        analysis: sample.analysis,
      };
      const updatedLogs = [logItem, ...historyList];
      setHistoryList(updatedLogs);
      localStorage.setItem("photo_tourism_history_v1", JSON.stringify(updatedLogs));
    }
  };

  const handleSelectHistoryItem = (item: ExplorationHistoryItem) => {
    setActiveAnalysis(item.analysis);
    setActivePhoto(item.imageBase64);
    setActiveMime(item.mimeType);
    setErrorMessage(null);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local Adventure Log? This cannot be undone.")) {
      setHistoryList([]);
      localStorage.removeItem("photo_tourism_history_v1");
      setActiveAnalysis(null);
      setActivePhoto(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] dark:bg-[#141412] dark:text-[#F4F1EA] flex flex-col font-sans selection:bg-[#8C7851]/20 selection:text-[#8C7851]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FDFCF8]/90 dark:bg-[#141412]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-6 md:px-10 h-20 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-black/40 dark:text-white/40">Current Location</span>
          {latitude && longitude ? (
            <span className="text-xs font-semibold tracking-tight text-[#8C7851]">
              GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          ) : (
            <span className="text-xs font-semibold tracking-tight text-black/50 dark:text-white/50">
              Awaiting coordinates...
            </span>
          )}
        </div>

        <div className="text-3xl font-serif italic tracking-tight font-black text-black dark:text-white select-none">
          Vignette.
        </div>

        {/* Location GPS Status Badges */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {locationStatus === "fetching" && (
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C7851]" />
                Syncing GPS
              </div>
            )}
            {locationStatus === "available" && (
              <button
                onClick={requestLocation}
                className="text-[10px] uppercase tracking-widest font-bold text-[#8C7851] border-b border-[#8C7851] pb-0.5 hover:opacity-80 transition bg-transparent"
                title="GPS coordinates successfully linked. Tap to refresh."
              >
                Satellite Fix Active
              </button>
            )}
            {(locationStatus === "denied" || locationStatus === "unrequested") && (
              <button
                onClick={requestLocation}
                className="text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white border-b border-black/20 dark:border-white/20 pb-0.5 hover:border-black dark:hover:border-white transition bg-transparent"
              >
                Link GPS
              </button>
            )}
          </div>

          <div className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-[#FDFCF8] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-white dark:text-[#1A1A1A]" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Input and Logs */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-sm p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C7851] block mb-1">
                Landmark Recognition
              </span>
              <h2 className="text-2xl font-serif font-bold text-black dark:text-white">
                Analyze Landmark
              </h2>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1 leading-relaxed">
                Capture local monument shapes, historic statues, architectural elevations, or upload a pre-filled picture to fetch detailed reference logs and stories.
              </p>
            </div>

            {/* Photo Uploader Widget */}
            <PhotoUploader onPhotoSelected={handlePhotoSelected} isLoading={isAnalyzing} />
          </section>

          {/* Curated Historical Presets Showcase */}
          <section className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-sm p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C7851] block mb-1">
                Preset Showcase
              </span>
              <h3 className="text-lg font-serif italic text-black dark:text-white">
                Historical Presets (Offline)
              </h3>
              <p className="text-xs text-black/50 dark:text-white/40 mt-1 leading-relaxed">
                Skip the API queue and instantly load custom landmark records to explore Vignette's complete details.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_LANDMARKS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative flex flex-col text-left border border-black/5 dark:border-white/5 rounded-sm overflow-hidden hover:border-[#8C7851]/50 transition bg-[#FBF9F4] dark:bg-zinc-900 cursor-pointer p-1"
                >
                  <div className="w-full aspect-video rounded-sm overflow-hidden bg-[#E8E6E1]/50 flex items-center justify-center mb-2">
                    <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                      <img src={sample.imgUrl} className="w-full h-full object-cover" alt={sample.name} />
                    </div>
                  </div>
                  <div className="px-1.5 pb-1">
                    <h4 className="text-[10px] font-serif font-black italic truncate text-black dark:text-white leading-tight">
                      {sample.name}
                    </h4>
                    <p className="text-[8px] uppercase tracking-wider text-black/40 dark:text-white/40 truncate">
                      {sample.location.split(",")[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Loader Panel when analyzing */}
          {isAnalyzing && (
            <div className="bg-[#F5F2ED] dark:bg-zinc-900 border-l-2 border-[#8C7851] rounded-sm p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-[#8C7851] animate-spin relative" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                  Vignette-v4-Pro Engine
                </h3>
                <p className="text-sm font-serif italic text-[#8C7851] px-4 min-h-[36px] transition-all duration-300">
                  "{loadingQuotes[loadingQuoteIndex]}"
                </p>
              </div>
            </div>
          )}

          {/* Travel Diary Adventure Logs */}
          <section className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-sm p-6 shadow-xs">
            <ExplorationHistory
              history={historyList}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              activeItemId={activeAnalysis ? historyList.find(x => x.analysis.metadata.name === activeAnalysis.metadata.name)?.id : undefined}
            />
          </section>
        </div>

        {/* Right Column: AI Tour Guide Panel */}
        <div className="lg:col-span-7">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-sm p-5 text-red-700 dark:text-red-400 flex items-start gap-4 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-bold text-sm">Exploration Interrupted</h3>
                <p className="text-xs leading-relaxed">{errorMessage}</p>
                <div className="flex flex-wrap gap-3 items-center pt-1">
                  <button
                    onClick={() => activePhoto && triggerAnalysis(activePhoto, activeMime)}
                    className="px-3 py-1.5 bg-red-150 hover:bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold rounded-sm text-xs transition bg-transparent border-0 cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => handleSelectSample(SAMPLE_LANDMARKS[0])}
                    className="px-3 py-1.5 bg-[#8C7851] hover:opacity-90 text-white font-bold rounded-sm text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    Load Sample (Eiffel Tower)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Active Landmark Details if exists, otherwise welcome frame */}
          {!isAnalyzing && activeAnalysis ? (
            <div className="animate-fade-in space-y-6">
              <LandmarkDetails analysis={activeAnalysis} />
            </div>
          ) : !isAnalyzing ? (
            <div className="bg-[#F5F2ED]/50 dark:bg-zinc-900/30 border border-black/5 dark:border-white/5 rounded-sm p-12 text-center flex flex-col items-center justify-center space-y-6 h-full min-h-[500px] shadow-xs">
              <div className="w-12 h-12 border border-black/10 dark:border-white/15 rounded-full flex items-center justify-center">
                <Compass className="w-5 h-5 text-black/30 dark:text-white/30 animate-spin-slow" />
              </div>
              <div className="max-w-md space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C7851]">Awaiting Exploration</span>
                <h3 className="text-4xl font-serif italic font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
                  No Active Vignette
                </h3>
                <p className="text-sm font-sans text-black/60 dark:text-[#D1CDCE] leading-relaxed max-w-sm mx-auto">
                  Snap a picture of an urban landmark, historical elevation, or mountain monument. The smart companion will compile comprehensive historical context, nearby dining guides, and architectural hidden gems.
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-black/40 dark:text-white/40 max-w-xs pt-4 border-t border-black/5 dark:border-white/5 w-full">
                AI Match Grounded in Google Search
              </p>
            </div>
          ) : (
            /* Silent Placeholder while loading, so we don't have clunky double loaders */
            <div className="bg-[#F5F2ED]/25 dark:bg-zinc-900/10 border border-dense border-black/5 dark:border-white/5 rounded-sm p-12 text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[500px] opacity-40 select-none">
              <div className="w-10 h-10 border-2 border-t-[#8C7851] border-black/10 rounded-full animate-spin" />
              <p className="text-xs tracking-widest uppercase font-bold text-black/60">Retrieving Live Chronicles...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-6 md:px-10 border-t border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40 bg-white dark:bg-zinc-950">
        <span>AI Engine: Vignette-v4-Pro</span>
        <div className="hidden md:flex gap-8">
          <span>Google Search Grounding Connected</span>
          <span>Satellite Fix Active</span>
        </div>
        <span>© 2026 Vignette Travel</span>
      </footer>
    </div>
  );
}
