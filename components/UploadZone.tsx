import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix for clean base64 if needed, but Gemini accepts full data URI usually or split it.
      // For the service provided, we usually strip the prefix in the service or pass purely base64. 
      // Let's pass the raw result which includes the prefix, and the service splits it.
      // Actually, the service helper below strips it.
      const rawBase64 = base64String.split(',')[1];
      onImageSelected(rawBase64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div 
      className="w-full max-w-2xl mx-auto mt-10 p-8 border-2 border-dashed border-gray-600 rounded-2xl bg-gray-800/50 hover:bg-gray-800 hover:border-indigo-500 transition-all cursor-pointer group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label className="flex flex-col items-center justify-center w-full h-64 cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-4 bg-gray-700 rounded-full mb-4 group-hover:bg-indigo-600 transition-colors">
            <UploadCloud className="w-10 h-10 text-gray-300 group-hover:text-white" />
          </div>
          <p className="mb-2 text-xl text-gray-300 font-semibold">Sube una foto de tu espacio</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Arrastra y suelta o haz clic para seleccionar. Formatos soportados: JPG, PNG.
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};