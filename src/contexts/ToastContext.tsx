import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ToastViewport } from '../components/ui/ToastViewport';

export type ToastTone = 'neutral' | 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (t: {title: string;description?: string;tone?: ToastTone;}) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    ({ title, description, tone = 'neutral' }: {title: string;description?: string;tone?: ToastTone;}) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>);

}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}