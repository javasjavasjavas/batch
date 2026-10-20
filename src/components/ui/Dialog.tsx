import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Button } from './Button';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  variant?: 'center' | 'drawer';
  role?: 'dialog' | 'alertdialog';
  bodyClassName?: string;
  headerAside?: React.ReactNode;
}

const SIZE: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-5xl'
};

const FOCUSABLE =
'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const stack: string[] = [];
const EASE = [0.23, 1, 0.32, 1] as const;

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'center',
  role = 'dialog',
  bodyClassName,
  headerAside
}: DialogProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isSm = useMediaQuery('(min-width: 640px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isDrawer = variant === 'drawer';

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    stack.push(id);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const auto = panel.querySelector<HTMLElement>('[data-autofocus]');
      (auto ?? panel).focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null
      );
      if (!nodes.length) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      const idx = stack.lastIndexOf(id);
      if (idx >= 0) stack.splice(idx, 1);
      if (stack.length === 0) document.body.style.overflow = prevOverflow;
      if (restore && document.contains(restore)) restore.focus();
    };
  }, [open, id]);

  const hidden = isDrawer ?
  isLg ?
  { x: 40, opacity: 0 } :
  { y: 56, opacity: 0 } :
  isSm ?
  { y: 8, scale: 0.98, opacity: 0 } :
  { y: 56, opacity: 0 };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open &&
      <div
        key="dialog"
        className={twMerge(
          'fixed inset-0 z-50 flex',
          isDrawer ? 'items-end lg:items-stretch lg:justify-end' : 'items-end justify-center sm:items-center sm:p-6'
        )}>
        
          <motion.div
          className="absolute inset-0 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          onClick={onClose}
          aria-hidden="true" />
        
          <motion.div
          ref={panelRef}
          role={role}
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          aria-describedby={description ? `${id}-desc` : undefined}
          tabIndex={-1}
          initial={hidden}
          animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          exit={hidden}
          transition={{ duration: 0.22, ease: EASE }}
          className={twMerge(
            'relative flex max-h-[92dvh] w-full flex-col bg-white shadow-pop outline-none',
            isDrawer ?
            'rounded-t-2xl lg:h-full lg:max-h-none lg:w-[400px] lg:rounded-none lg:rounded-l-2xl' :
            twMerge('rounded-t-2xl sm:max-h-[88vh] sm:rounded-2xl', SIZE[size])
          )}>
          
            <div
            className={twMerge('mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line', isDrawer ? 'lg:hidden' : 'sm:hidden')}
            aria-hidden="true" />
          
            <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-3 sm:px-6 sm:pt-5">
              <div className="min-w-0 flex-1">
                <h2 id={`${id}-title`} className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {title}
                </h2>
                {description &&
              <div id={`${id}-desc`} className="mt-1 text-sm leading-relaxed text-muted">
                    {description}
                  </div>
              }
              </div>
              {headerAside}
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close" className="-mr-1.5 -mt-0.5 shrink-0">
                <XIcon className="h-[18px] w-[18px]" aria-hidden="true" />
              </Button>
            </div>
            <div className={twMerge('scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6', bodyClassName)}>
              {children}
            </div>
            {footer &&
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
                {footer}
              </div>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}