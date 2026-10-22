import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, ShieldCheckIcon, ZapIcon } from 'lucide-react';
import { HOME_USE_CASES } from '../../data/homeUseCases';
import { useI18n } from '../../i18n/LocaleContext';
import { Link } from '../../i18n/router';
import './HomeUseCases.css';

const SHOE = '/0f8e9c78-f8ec-47d6-858a-6c19973b8dfd.jpg';
const BOTTLE = '/cac62e28-3a1b-4ca0-b65f-50afb11e22c7.jpg';

function UseCaseVisual({ kind }: { kind: typeof HOME_USE_CASES[number]['visual'] }) {
  const { tr } = useI18n();
  // These scenes illustrate the adjacent copy; avoid repeating it to screen readers.
  return <div className={`use-case-art use-case-art--${kind}`} aria-hidden="true">
    {kind === 'product' && <>
      <img src={SHOE} width="1264" height="848" alt="" loading="lazy" decoding="async" />
      <span className="use-case-corner use-case-corner--top" /><span className="use-case-corner use-case-corner--bottom" />
      <span className="use-case-tag"><CheckIcon />{tr('Ready for your store')}</span>
    </>}
    {kind === 'website' && <>
      <div className="use-case-browser"><div className="use-case-browser-dots"><span /><span /><span /></div><img src={BOTTLE} width="848" height="1264" alt="" loading="lazy" decoding="async" /><div className="use-case-browser-lines"><span /><span /></div></div>
      <span className="use-case-tag"><ZapIcon />{tr('Less weight. Same story.')}</span>
    </>}
    {kind === 'format' && <>
      <div className="use-case-file"><img src={SHOE} width="1264" height="848" alt="" loading="lazy" decoding="async" /><span>WEBP</span></div>
      <ArrowRightIcon className="use-case-format-arrow" />
      <div className="use-case-file use-case-file--result"><img src={SHOE} width="1264" height="848" alt="" loading="lazy" decoding="async" /><span>JPG <CheckIcon /></span></div>
    </>}
    {kind === 'steam' && <>
      <div className="use-case-capsules">
        <div className="use-case-capsule use-case-capsule--wide"><span className="use-case-sun" /><span className="use-case-hill" /><strong>{tr('YOUR GAME')}</strong></div>
        <div className="use-case-capsule use-case-capsule--portrait"><span className="use-case-sun" /><span className="use-case-hill" /><strong>{tr('YOUR GAME')}</strong></div>
      </div>
      <span className="use-case-tag"><CheckIcon />{tr('One world. Every frame.')}</span>
    </>}
  </div>;
}

export function HomeUseCases() {
  const { tr } = useI18n();
  return <section aria-labelledby="use-cases-title" className="home-use-cases mx-auto max-w-content px-5 py-14 sm:px-8">
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{tr('One batch. Many possibilities.')}</p>
    <h2 id="use-cases-title" className="text-[30px] font-semibold tracking-[-0.03em]">{tr('What are you preparing?')}</h2>
    <p className="mt-2 text-muted">{tr('Your images. Ready for their next destination.')}</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {HOME_USE_CASES.map(item => <article key={item.visual} className="use-case-card flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-line bg-white">
        <UseCaseVisual kind={item.visual} />
        <div className="flex flex-1 flex-col p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{tr(item.category)}</p>
          <h3 className="text-xl font-semibold leading-tight tracking-[-0.025em]">{tr(item.title)}</h3>
          <p className="mb-7 mt-3 text-sm leading-relaxed text-muted">{tr(item.body)}</p>
          <Link to={item.toolHref} className="use-case-action mt-auto flex min-h-11 items-center justify-between gap-3 rounded-lg bg-lime px-4 py-3 text-sm font-semibold text-ink transition-colors">{tr(item.action)}<ArrowUpRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
          <Link to={item.href} className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded px-1 py-2 text-center text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline">{tr(item.label)}<ArrowRightIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></Link>
        </div>
      </article>)}
    </div>
    <p className="mt-6 flex items-center justify-center gap-2 text-xs leading-relaxed text-muted"><ShieldCheckIcon className="h-4 w-4 shrink-0" aria-hidden="true" />{tr('Free to use. No account. Your images stay on your device.')}</p>
  </section>;
}
