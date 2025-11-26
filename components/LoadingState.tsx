import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, subMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-96 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
        <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
      </div>
      <h3 className="mt-8 text-2xl font-semibold text-white">{message}</h3>
      {subMessage && <p className="mt-2 text-gray-400 text-center max-w-md">{subMessage}</p>}
      
      <div className="mt-8 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-full animate-[shimmer_2s_infinite_linear]" style={{ backgroundSize: '200% 100%' }}></div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};