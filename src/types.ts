export interface LandmarkMetadata {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  year: string;
  category: string;
  confidence: "High" | "Medium" | "Low";
  funFact: string;
}

export interface SearchReference {
  title: string;
  url: string;
}

export interface AnalysisResult {
  metadata: LandmarkMetadata;
  markdown: string;
  sources: SearchReference[];
}

export interface ExplorationHistoryItem {
  id: string;
  timestamp: string;
  imageBase64: string;
  mimeType: string;
  analysis: AnalysisResult;
}
