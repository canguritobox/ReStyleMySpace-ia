import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ResultViewer } from './components/ResultViewer';
import { LoadingState } from './components/LoadingState';
import { analyzeSpaceImage, generateRedesign } from './services/geminiService';
import { AppState, SpaceAnalysis, StyleSuggestion } from './types';
import { Sofa, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SpaceAnalysis | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleSuggestion | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleImageSelected = async (base64: string) => {
    setOriginalImage(base64);
    setCurrentState(AppState.ANALYZING);
    
    try {
      // Step 1: Analyze text content
      const analysis = await analyzeSpaceImage(base64);
      setAnalysisResult(analysis);
      setCurrentState(AppState.SELECTION);

      // Step 2: Auto-generate images for all suggestions in the background
      generateAllImages(base64, analysis);

    } catch (error) {
      console.error(error);
      setErrorMessage('Hubo un problema analizando tu imagen. Por favor intenta con otra foto más clara.');
      setCurrentState(AppState.ERROR);
    }
  };

  const generateAllImages = async (base64: string, analysis: SpaceAnalysis) => {
    // We iterate and trigger requests. To avoid hitting rate limits too hard, 
    // we could sequence them or just fire them. For best UX speed, we fire.
    // We update the state as each one completes.
    
    analysis.suggestions.forEach(async (style, index) => {
      try {
        const generatedUrl = await generateRedesign(
          base64, 
          style.name, 
          style.description, 
          style.lightingTips, 
          style.furnitureAdvice
        );

        setAnalysisResult((prev) => {
          if (!prev) return null;
          const newSuggestions = [...prev.suggestions];
          // Update the specific suggestion with the image URL
          newSuggestions[index] = { ...newSuggestions[index], generatedImageUrl: generatedUrl };
          return { ...prev, suggestions: newSuggestions };
        });
      } catch (err) {
        console.error(`Failed to generate image for ${style.name}`, err);
        // Optionally mark as failed in state so UI shows retry button, 
        // but for now we just leave it undefined/loading.
      }
    });
  };

  const handleStyleSelect = (style: StyleSuggestion) => {
    // Since images are auto-generating, we just select it.
    // If the image isn't ready yet, the ResultViewer will handle the loading state or we wait.
    setSelectedStyle(style);
    setCurrentState(AppState.RESULT);
  };

  const resetApp = () => {
    setOriginalImage('');
    setAnalysisResult(null);
    setSelectedStyle(null);
    setErrorMessage('');
    setCurrentState(AppState.UPLOAD);
  };

  const backToSelection = () => {
    setCurrentState(AppState.SELECTION);
    setSelectedStyle(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 selection:bg-indigo-500 selection:text-white font-inter">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              InteriorAI
            </h1>
          </div>
          {currentState !== AppState.UPLOAD && (
            <button 
              onClick={resetApp}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Nueva Foto
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Error Banner */}
        {currentState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-900/20 border border-red-800 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
            <AlertCircle className="text-red-500 w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-400">Error</h3>
              <p className="text-sm text-red-300">{errorMessage}</p>
              <button 
                onClick={resetApp}
                className="mt-2 text-xs bg-red-900/50 hover:bg-red-800 text-white px-3 py-1 rounded transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {/* Views based on state */}
        {currentState === AppState.UPLOAD && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
            <div className="text-center mb-10 max-w-3xl">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 tracking-tight">
                Transforma tu espacio
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Sube una foto y deja que nuestra IA analice el mobiliario, la iluminación y el estilo para generar 7 propuestas de rediseño fotorrealistas al instante.
              </p>
            </div>
            <UploadZone onImageSelected={handleImageSelected} />
          </div>
        )}

        {currentState === AppState.ANALYZING && (
          <LoadingState 
            message="Analizando arquitectura y mobiliario..." 
            subMessage="Nuestra IA está escaneando tu espacio para detectar muebles y condiciones de luz." 
          />
        )}

        {currentState === AppState.SELECTION && analysisResult && (
          <AnalysisDashboard 
            analysis={analysisResult} 
            onSelectStyle={handleStyleSelect} 
          />
        )}

        {currentState === AppState.RESULT && selectedStyle && (
          <ResultViewer 
            originalImage={originalImage}
            generatedImage={selectedStyle.generatedImageUrl || ''} // Should be ready or loading logic handled inside
            styleName={selectedStyle.name}
            styleInfo={selectedStyle}
            onBack={backToSelection}
          />
        )}

      </main>
    </div>
  );
};

export default App;
