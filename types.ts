export interface StyleSuggestion {
  name: string;
  description: string;
  colorPalette: string[];
  lightingTips: string;
  furnitureAdvice: string;
  generatedImageUrl?: string; // Optional, populated as they are generated
}

export interface SpaceAnalysis {
  currentStyle: string;
  detectedFurniture: string[];
  pros: string[];
  cons: string[];
  suggestions: StyleSuggestion[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  SELECTION = 'SELECTION',
  GENERATING = 'GENERATING', // Can be used if we block, but we will mostly stay in SELECTION while generating
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  styleName: string;
  imageUrl: string;
}
