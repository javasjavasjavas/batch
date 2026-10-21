import { Link } from 'react-router-dom';
import { PLATFORM_PACKS } from '../../data/platforms';
import type { PlatformPack } from '../../types/platform';
import { STEAM_ASSETS } from '../../data/steamAssets';

const linkClass = 'text-sm font-medium underline underline-offset-4 hover:text-muted';

export function PlatformGuide({ pack }: { pack: PlatformPack }) {
  const related = PLATFORM_PACKS.filter((other) => other.id !== pack.id && other.category === pack.category);
  return <section className="mt-14 border-t border-line pt-10" aria-labelledby="platform-guide">
    <h2 id="platform-guide" className="text-2xl font-semibold">How to prepare {pack.name} images</h2>
    <ol className="mt-5 grid gap-5 text-sm leading-relaxed text-muted md:grid-cols-3">
      <li><h3 className="font-semibold text-ink">1. Choose the right source</h3><p className="mt-2">{pack.category === 'Apps' ? 'Upload actual screenshots for each supported device. Add your app icon and promotional artwork separately; resizing artwork does not create a gameplay or app screenshot.' : pack.category === 'Commerce' ? 'Start with clear product photos. Add your shop identity separately, so your listing images and banners can use different source files.' : 'Add your main artwork, then a separate profile image or icon. Add multiple content images when you need a batch of posts or thumbnails.'}</p></li>
      <li><h3 className="font-semibold text-ink">2. Review each crop</h3><p className="mt-2">Select the presets you need and open Adjust to position each image. Use crop to fill the frame or fit to retain the entire image. Check the safe-area guides where provided.</p></li>
      <li><h3 className="font-semibold text-ink">3. Prepare and download</h3><p className="mt-2">Prepare the selected files to check dimensions, formats and published file limits. Download a single image or a ZIP, then review the destination preview before publishing.</p></li>
    </ol>
    <h2 className="mt-10 text-xl font-semibold">{pack.name} image sizes included in this tool</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted">These are the tool’s export dimensions. “Batch preset” is a practical starting point, not a platform requirement. Account eligibility and content rules can also apply; follow each source for the current specification.</p>
    <div className="mt-4 overflow-x-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><caption className="sr-only">{pack.name} image export dimensions and source references</caption><thead className="bg-sunken"><tr><th scope="col" className="p-3">Image</th><th scope="col" className="p-3">Width × height (px)</th><th scope="col" className="p-3">Basis</th></tr></thead><tbody>{pack.assets.map((asset) => <tr key={asset.id} className="border-t border-line"><th scope="row" className="p-3 font-medium">{asset.name}</th><td className="whitespace-nowrap p-3">{asset.width} × {asset.height}{asset.customSize ? ' (adjustable)' : ''}</td><td className="p-3"><a className="underline underline-offset-4" href={asset.source} target="_blank" rel="noreferrer">{asset.evidence === 'official' ? 'Official guidance' : 'Batch preset'}</a></td></tr>)}</tbody></table></div>
    <h2 className="mt-10 text-xl font-semibold">Before you export</h2>
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">{pack.notes.map((note) => <li key={note}>{note}</li>)}</ul>
    <nav aria-label="Related image tools" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
      {related.map((other) => <Link key={other.id} to={`/tools/${other.id}-assets`} className={linkClass}>{other.name} image kit</Link>)}
      <Link to="/tools/bulk-image-resizer" className={linkClass}>Custom bulk image resizing</Link>
      <Link to="/tools/image-compressor" className={linkClass}>Compress image files</Link>
      <Link to="/help/choosing-output-settings" className={linkClass}>Choose output settings</Link>
    </nav>
  </section>;
}

export function SteamGuide() {
  return <section className="mt-14 border-t border-line pt-10" aria-labelledby="steam-guide">
    <h2 id="steam-guide" className="text-2xl font-semibold">How to create Steam store and library images</h2>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">Add your key art, select the capsules and library assets you need, and adjust each crop. Use a separate transparent logo and real gameplay screenshots to complete the set. Library Hero needs artwork without text or logos; review any cleanup before exporting.</p>
    <h3 className="mt-7 text-lg font-semibold">Steam asset dimensions</h3>
    <div className="mt-4 overflow-x-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><caption className="sr-only">Steam image export sizes available in Batch Image Kit</caption><thead className="bg-sunken"><tr><th scope="col" className="p-3">Asset</th><th scope="col" className="p-3">Width × height (px)</th><th scope="col" className="p-3">Format</th></tr></thead><tbody>{STEAM_ASSETS.map((asset) => <tr key={asset.id} className="border-t border-line"><th scope="row" className="p-3 font-medium">{asset.name}</th><td className="p-3">{asset.width} × {asset.height}{asset.logo ? ' (maximum bounds)' : ''}</td><td className="p-3 uppercase">{asset.format}</td></tr>)}</tbody></table></div>
    <h3 className="mt-7 text-lg font-semibold">Does the generator create a complete Steam release?</h3>
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">It prepares raster image assets and a named ZIP with a guide. You still need to check content rules, supply actual gameplay captures and upload your files in Steamworks. Review the required-item checklist; exporting an incomplete set does not make it release-ready. macOS ICNS icons are outside this tool.</p>
    <nav aria-label="Related creator tools" className="mt-7 flex flex-wrap gap-x-6 gap-y-3"><Link className={linkClass} to="/tools/discord-assets">Discord server images</Link><Link className={linkClass} to="/tools/youtube-assets">YouTube thumbnails and banners</Link><Link className={linkClass} to="/tools/mobile-assets">App Store and Google Play images</Link><Link className={linkClass} to="/tools/image-compressor">Compress image files</Link></nav>
  </section>;
}
