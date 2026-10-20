import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, XIcon } from 'lucide-react';
import type { ToastItem } from '../../contexts/ToastContext';

const ICONS = {
  neutral: <InfoIcon className="h-[18px] w-[18px] text-white/70" />,
  info: <InfoIcon className="h-[18px] w-[18px] text-white/70" />,
  success: <CircleCheckIcon className="h-[18px] w-[18px] text-lime" />,
  error: <CircleAlertIcon className="h-[18px] w-[18px] text-[#FF9C8F]" />
};

export function ToastViewport({ toasts, onDismiss }: {toasts: ToastItem[];onDismiss: (id: number) => void;}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6">
      
      <AnimatePresence initial={false}>
        {toasts.map((t) =>
        <motion.div
          key={t.id}
          layout
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-ink px-4 py-3 text-white shadow-pop">
          
            <span className="mt-px shrink-0" aria-hidden="true">
              {ICONS[t.tone]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] leading-snug text-white/70">{t.description}</p>}
            </div>
            <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white">
            
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

}