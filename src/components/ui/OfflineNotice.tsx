import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOffIcon, XIcon } from 'lucide-react';
import { usePrefs } from '../../contexts/PrefsContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineNotice() {
  const { tr } = useI18n();
  const online = useOnlineStatus();
  const { demoOffline, setDemoOffline } = usePrefs();
  const offline = !online || demoOffline;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (offline) setDismissed(false);
  }, [offline]);

  const visible = offline && !dismissed;

  return (
    <AnimatePresence>
      {visible &&
      <motion.div
        role="status"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="fixed inset-x-3 top-3 z-[65] mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-warning/20 bg-warning-soft px-4 py-3 shadow-pop">
        
          <WifiOffIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-ink">{tr("You’re offline")}</p>
            <p className="mt-0.5 leading-snug text-[#5C4A2A]">{tr("Your batch and settings stay available because they live on this device. Help pages and ad space may not load until you reconnect.")}{tr(demoOffline && online && ' (Simulated from the demo menu.)')}
            </p>
          </div>
          <button
          type="button"
          onClick={() => {
            setDismissed(true);
            setDemoOffline(false);
          }}
          aria-label={tr("Dismiss offline notice")}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#5C4A2A] transition-colors duration-150 hover:bg-warning/10">
          
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>
      }
    </AnimatePresence>);

}