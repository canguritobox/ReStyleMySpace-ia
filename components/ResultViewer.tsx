import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Split, Smartphone, Maximize, Lamp, Armchair, Palette } from 'lucide-react';
import { StyleSuggestion } from '../types';

interface ResultViewerProps {
  originalImage: string;
  generatedImage: string;
  styleName: string;
  styleInfo?: StyleSuggestion;
  onBack: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ originalImage, generatedImage, styleName, styleInfo, onBack }) => {
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'generated'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Ensure original image has prefix for rendering if missing
  const renderOriginal = originalImage.startsWith('data:') ? originalImage : `data:image/jpeg;base64,${originalImage}`;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? (e as any).touches[0].clientX : (e as MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as any);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div className="w-full h-full flex flex-col animate-fade-in pb-10">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800 self-start md:self-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        
        <div className="flex bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-700">
          <button 
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'slider' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Split className="w-4 h-4" /> Slider
          </button>
          <button 
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'side-by-side' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Smartphone className="w-4 h-4" /> Lado a Lado
          </button>
          <button 
            onClick={() => setViewMode('generated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'generated' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Maximize className="w-4 h-4" /> Resultado
          </button>
        </div>

        <a 
          href={generatedImage} 
          download={`redesign-${styleName}.png`}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg transition-colors shadow-lg font-medium self-end md:self-auto"
        >
          <Download className="w-4 h-4" />
          Descargar
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Image Viewer */}
        <div className="lg:col-span-8 xl:col-span-9 h-[600px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
          
          {viewMode === 'generated' && (
            <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
          )}

          {viewMode === 'side-by-side' && (
            <div className="w-full h-full flex">
              <div className="w-1/2 h-full relative border-r border-gray-800 bg-gray-900">
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10">Original</div>
                <img src={renderOriginal} alt="Original" className="w-full h-full object-contain" />
              </div>
              <div className="w-1/2 h-full relative bg-gray-900">
                <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10">Resultado</div>
                <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {viewMode === 'slider' && (
            <div 
              ref={containerRef}
              className="relative w-full h-full select-none cursor-ew-resize group overflow-hidden bg-gray-900"
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <img 
                src={renderOriginal} 
                alt="Original" 
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" 
              />
              
              <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="absolute top-0 left-0 w-full h-full object-contain" 
                />
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                   <Split className="w-4 h-4 text-indigo-600 rotate-90" />
                </div>
              </div>

              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 pointer-events-none">Original</div>
              <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 pointer-events-none">Estilo {styleName}</div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
           <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">{styleName}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{styleInfo?.description}</p>
           </div>

           {styleInfo?.lightingTips && (
             <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h4 className="flex items-center gap-2 text-yellow-400 font-semibold mb-3">
                  <Lamp className="w-5 h-5" />
                  Iluminación Sugerida
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{styleInfo.lightingTips}</p>
             </div>
           )}

           {styleInfo?.furnitureAdvice && (
             <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h4 className="flex items-center gap-2 text-indigo-400 font-semibold mb-3">
                  <Armchair className="w-5 h-5" />
                  Mobiliario
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{styleInfo.furnitureAdvice}</p>
             </div>
           )}

           <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h4 className="flex items-center gap-2 text-gray-200 font-semibold mb-3">
                <Palette className="w-5 h-5" />
                Paleta de Colores
              </h4>
              <div className="flex flex-col gap-2">
                {styleInfo?.colorPalette.map((color, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-gray-500 border border-gray-600 shadow-sm"></div>
                    <span className="text-sm text-gray-300 capitalize">{color}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
