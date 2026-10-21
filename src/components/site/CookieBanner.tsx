import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CookieIcon } from 'lucide-react';
import { usePrefs } from '../../contexts/PrefsContext';
import { Button } from '../ui/Button';
import { advertisingReady } from '../../advertising/config';

export function CookieBanner() {
  const { consent, acceptAll, rejectAll, setCookieDialogOpen, cookieDialogOpen } = usePrefs();
  const visible = !advertisingReady && !consent.decided && !cookieDialogOpen;

  return (
    <AnimatePresence>
      {visible &&
      <motion.section
        aria-label="Cookie consent"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-line bg-white p-4 shadow-pop sm:inset-x-6 sm:bottom-6 sm:p-5">
        
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 gap-3">
              <CookieIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink" strokeWidth={1.75} aria-hidden="true" />
              <div className="text-sm">
                <h2 className="font-semibold text-ink">Your privacy choices</h2>
                <p className="mt-1 leading-relaxed text-muted">
                  With your permission, optional cookies would personalize ads and measure usage. Necessary storage keeps your
                  preferences working.{' '}
                  <Link to="/privacy" className="font-medium text-ink underline underline-offset-2">
                    Privacy
                  </Link>
                </p>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
              <Button variant="ghost" size="md" onClick={() => setCookieDialogOpen(true)} className="col-span-2 sm:col-span-1">
                Customize
              </Button>
              <Button variant="secondary" onClick={rejectAll}>
                Reject optional
              </Button>
              <Button variant="primary" onClick={acceptAll}>
                Accept optional
              </Button>
            </div>
          </div>
        </motion.section>
      }
    </AnimatePresence>);

}
