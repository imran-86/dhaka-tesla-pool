// frontend/src/components/shared/Toast.tsx
'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-950/80 border-emerald-700 text-emerald-200',
    error: 'bg-rose-950/80 border-rose-700 text-rose-200',
    info: 'bg-sky-950/80 border-sky-700 text-sky-200',
  }[type];

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-xs shadow-lg transition-all ${styles}`}
    >
      <div className="flex items-center gap-2.5">
        {icons}
        <span className="font-medium leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="বার্তা বন্ধ করুন"
          className="text-slate-400 hover:text-white transition p-1 rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}