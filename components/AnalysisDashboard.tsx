import React from 'react';
import { SpaceAnalysis, StyleSuggestion } from '../types';
import { CheckCircle2, XCircle, Sparkles, Lamp, Armchair, Loader2, Info } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: SpaceAnalysis;
  onSelectStyle: (style: StyleSuggestion) => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, onSelectStyle }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-20">
      
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        
        {/* Main Analysis Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-indigo-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Diagnóstico IA
          </h2>
          <div className="mb-6">
             <p className="text-indigo-200 text-sm uppercase tracking-wider font-semibold mb-1">Estilo Actual</p>
             <p className="text-2xl font-bold text-white">{analysis.currentStyle}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
              <Armchair className="w-4 h-4 text-indigo-400" /> Mobiliario Detectado
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedFurniture.map((item, idx) => (
                <span key={idx} className="bg-indigo-950/50 border border-indigo-800 text-indigo-200 text-xs px-2 py-1 rounded-md">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Puntos Fuertes
          </h3>
          <ul className="space-y-3">
            {analysis.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                {pro}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            A Mejorar
          </h3>
          <ul className="space-y-3">
            {analysis.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Propuestas de Rediseño</h2>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          Generando vistas automáticamente...
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {analysis.suggestions.map((style, idx) => (
          <div 
            key={idx}
            onClick={() => style.generatedImageUrl && onSelectStyle(style)}
            className={`group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col h-full transition-all duration-300 ${style.generatedImageUrl ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:shadow-2xl hover:-translate-y-2' : 'opacity-80'}`}
          >
            {/* Image Preview Area */}
            <div className="h-48 bg-gray-900 relative overflow-hidden">
              {style.generatedImageUrl ? (
                <>
                  <img src={style.generatedImageUrl} alt={style.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Ver Resultado
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-3 bg-gray-800/50">
                   <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                   <span className="text-xs font-medium">Diseñando...</span>
                </div>
              )}
            </div>

            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{style.name}</h3>
              </div>
              
              <p className="text-gray-400 text-xs mb-4 line-clamp-2">{style.description}</p>
              
              <div className="mt-auto space-y-3">
                 <div className="flex items-start gap-2 text-xs text-gray-300 bg-gray-700/30 p-2 rounded">
                    <Lamp className="w-3 h-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                    <span className="line-clamp-2">{style.lightingTips}</span>
                 </div>
                 
                 <div className="flex items-start gap-2 text-xs text-gray-300 bg-gray-700/30 p-2 rounded">
                    <Armchair className="w-3 h-3 mt-0.5 text-blue-400 flex-shrink-0" />
                    <span className="line-clamp-2">{style.furnitureAdvice}</span>
                 </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex flex-wrap gap-1.5">
                  {style.colorPalette.map((color, cIdx) => (
                    <span key={cIdx} className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: 'gray' /* We don't have hex codes, just names. Could map them or just use text */ }} title={color}></span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1 self-center">{style.colorPalette.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
