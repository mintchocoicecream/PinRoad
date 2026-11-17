import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = '정보를 불러오는 중입니다...',
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-[1500] bg-slate-900/20 backdrop-blur-xs flex items-center justify-center pointer-events-none transition-opacity duration-300">
      <div className="bg-white/90 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
        <span className="text-xs font-medium text-slate-800">{message}</span>
      </div>
    </div>
  );
};