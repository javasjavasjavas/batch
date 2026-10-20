import { Link } from 'react-router-dom';
import { usePrefs } from '../../contexts/PrefsContext';
import { TOOLS } from '../../data/tools';
import { Logo } from '../ui/Logo';

const footLink = 'text-sm text-muted transition-colors duration-150 hover:text-ink';

export function SiteFooter() {
  const { setCookieDialogOpen } = usePrefs();
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-content gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Resize, compress, convert, and rename images in bulk. Free, with no account, and designed to keep your files on your
            device.
          </p>
        </div>
        <nav aria-label="Tools">
          <h2 className="text-[13px] font-semibold text-ink">Tools</h2>
          <ul className="mt-3 space-y-2.5">
            {TOOLS.map((t) =>
            <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className={footLink}>
                  {t.name}
                </Link>
              </li>
            )}
            <li><Link to="/tools/steam-assets" className={footLink}>Steam Asset Generator</Link></li>
            <li>
              <Link to="/tools" className={footLink}>
                All tools
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Help">
          <h2 className="text-[13px] font-semibold text-ink">Help</h2>
          <ul className="mt-3 space-y-2.5">
            <li>
              <Link to="/help" className={footLink}>
                Help center
              </Link>
            </li>
            <li>
              <Link to="/help/getting-started-with-a-batch" className={footLink}>
                Getting started
              </Link>
            </li>
            <li>
              <Link to="/help/local-processing-and-browser-limits" className={footLink}>
                Local processing
              </Link>
            </li>
            <li>
              <Link to="/#how-it-works" className={footLink}>
                How it works
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company and legal">
          <h2 className="text-[13px] font-semibold text-ink">Batch</h2>
          <ul className="mt-3 space-y-2.5">
            <li>
              <Link to="/about" className={footLink}>
                About
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={footLink}>
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className={footLink}>
                Terms
              </Link>
            </li>
            <li>
              <button type="button" onClick={() => setCookieDialogOpen(true)} className={footLink}>
                Cookie preferences
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col gap-2 px-5 py-5 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Images are processed locally and never uploaded.</p>
          <p>Batch · 2026</p>
        </div>
      </div>
    </footer>);

}
