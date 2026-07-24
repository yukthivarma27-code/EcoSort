export type WasteCategory = 
  | 'Recyclable Plastics'
  | 'Paper & Cardboard'
  | 'Compostable & Organic'
  | 'E-Waste & Electronics'
  | 'Glass & Glassware'
  | 'Metal & Aluminum'
  | 'Hazardous & Special'
  | 'Non-Recyclable Landfill';

export type BinType = 
  | 'Blue Bin (Recycling)'
  | 'Yellow Bin (Paper/Cardboard)'
  | 'Green Bin (Compost/Organics)'
  | 'Red Bin (E-Waste / Hazardous)'
  | 'Gray Bin (General Landfill)';

export interface MaterialComposition {
  material: string;
  percentage: number;
}

export interface EnvironmentalImpact {
  co2SavedKg: number;      // e.g. 0.18
  energySavedKwh: number;  // e.g. 0.35
  waterSavedLiters: number; // e.g. 1.2
  decompositionYears: number; // e.g. 450
}

export interface ClassificationResult {
  id: string;
  timestamp: string;
  itemName: string;
  brandOrModel?: string;
  category: WasteCategory;
  primaryBin: BinType;
  binColor: string; // hex or tailwind class
  confidence: number; // 0-100
  recyclabilityScore: number; // 0-100
  contaminationRisk: 'Low' | 'Medium' | 'High';
  composition: MaterialComposition[];
  segregationSteps: string[];
  impact: EnvironmentalImpact;
  upcyclingIdeas: string[];
  localDisposalNotice: string;
  imageUrl?: string;
  aiNotes?: string;
}

export interface PresetSample {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: WasteCategory;
  recommendedBin: BinType;
  reusable: boolean;
  recyclable: boolean;
  compostable: boolean;
  commonExamples: string[];
  preparationTips: string[];
  decompositionTime: string;
  commonMistakes: string;
}

export interface AnalyticsStats {
  totalScans: number;
  diversionRatePercent: number;
  co2SavedKgTotal: number;
  contaminationRatePercent: number;
  categoryBreakdown: { name: string; value: number; color: string }[];
  weeklyTrends: { day: string; recycled: number; composted: number; landfill: number }[];
}
