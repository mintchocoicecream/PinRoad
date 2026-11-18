import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  themeColorClass?: string; // 테마 버튼 색상 연동용
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title = '알림',
  message,
  onClose,
  themeColorClass = 'bg-indigo-600 hover:bg-indigo-700',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className={`mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-md transition-all cursor-pointer ${themeColorClass}`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};