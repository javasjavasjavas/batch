import { useI18n } from '../../i18n/LocaleContext';
import { Link } from '../../i18n/router';
import { PLATFORM_PACKS } from '../../data/platforms';
import type { PlatformPack } from '../../types/platform';
import { STEAM_ASSETS } from '../../data/steamAssets';

const linkClass = 'text-sm font-medium underline underline-offset-4 hover:text-muted';

export function PlatformGuide({ pack }: { pack: PlatformPack }) {
  const { tr } = useI18n();
  const related = PLATFORM_PACKS.filter((other) => other.id !== pack.id && other.category === pack.category);
  return <section className="mt-14 border-t border-line pt-10" aria-labelledby="platform-guide">
    <h2 id="platform-guide" className="text-2xl font-semibold">{tr(`How to prepare ${pack.name} images`)}</h2>
    <ol className="mt-5 grid gap-5 text-sm leading-relaxed text-muted md:grid-cols-3">
      <li><h3 className="font-semibold text-ink">{tr("1. Choose the right source")}</h3><p className="mt-2">{tr(pack.category === 'Apps' ? 'Upload actual screenshots for each supported device. Add your app icon and promotional artwork separately; resizing artwork does not create a gameplay or app screenshot.' : pack.category === 'Commerce' ? 'Start with clear product photos. Add your shop identity separately, so your listing images and banners can use different source files.' : 'Add your main artwork, then a separate profile image or icon. Add multiple content images when you need a batch of posts or thumbnails.')}</p></li>
      <li><h3 className="font-semibold text-ink">{tr("2. Review each crop")}</h3><p className="mt-2">{tr("Select the presets you need and open Adjust to position each image. Use crop to fill the frame or fit to retain the entire image. Check the safe-area guides where provided.")}</p></li>
      <li><h3 className="font-semibold text-ink">{tr("3. Prepare and download")}</h3><p className="mt-2">{tr("Prepare the selected files to check dimensions, formats and published file limits. Download a single image or a ZIP, then review the destination preview before publishing.")}</p></li>
    </ol>
    <h2 className="mt-10 text-xl font-semibold">{tr(`${pack.name} image sizes included in this tool`)}</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted">{tr("These are the tool’s export dimensions. “Batch preset” is a practical starting point, not a platform requirement. Account eligibility and content rules can also apply; follow each source for the current specification.")}</p>
    <div className="mt-4 overflow-x-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><caption className="sr-only">{tr(`${pack.name} image export dimensions and source references`)}</caption><thead className="bg-sunken"><tr><th scope="col" className="p-3">{tr("Image")}</th><th scope="col" className="p-3">{tr("Width × height (px)")}</th><th scope="col" className="p-3">{tr("Basis")}</th></tr></thead><tbody>{pack.assets.map((asset) => <tr key={asset.id} className="border-t border-line"><th scope="row" className="p-3 font-medium">{tr(asset.name)}</th><td className="whitespace-nowrap p-3">{tr(asset.width)}{tr(" × ")}{tr(asset.height)}{tr(asset.customSize ? ' (adjustable)' : '')}</td><td className="p-3"><a className="underline underline-offset-4" href={asset.source} target="_blank" rel="noreferrer">{tr(asset.evidence === 'official' ? 'Official guidance' : 'Batch preset')}</a></td></tr>)}</tbody></table></div>
    <h2 className="mt-10 text-xl font-semibold">{tr("Before you export")}</h2>
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">{pack.notes.map((note) => <li key={note}>{tr(note)}</li>)}</ul>
    <nav aria-label={tr("Related image tools")} className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
      {related.map((other) => <Link key={other.id} to={`/tools/${other.id}-assets`} className={linkClass}>{tr(`${other.name} image kit`)}</Link>)}
      <Link to="/tools/bulk-image-resizer" className={linkClass}>{tr("Custom bulk image resizing")}</Link>
      <Link to="/tools/image-compressor" className={linkClass}>{tr("Compress image files")}</Link>
      <Link to="/help/choosing-output-settings" className={linkClass}>{tr("Choose output settings")}</Link>
    </nav>
  </section>;
}

export function SteamGuide() {
  const { tr } = useI18n();
  return <section className="mt-14 border-t border-line pt-10" aria-labelledby="steam-guide">
    <h2 id="steam-guide" className="text-2xl font-semibold">{tr("How to create Steam store and library images")}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{tr("Add your key art, select the capsules and library assets you need, and adjust each crop. Use a separate transparent logo and real gameplay screenshots to complete the set. Library Hero needs artwork without text or logos; review any cleanup before exporting.")}</p>
    <h3 className="mt-7 text-lg font-semibold">{tr("Steam asset dimensions")}</h3>
    <div className="mt-4 overflow-x-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><caption className="sr-only">{tr("Steam image export sizes available in Batch Image Kit")}</caption><thead className="bg-sunken"><tr><th scope="col" className="p-3">{tr("Asset")}</th><th scope="col" className="p-3">{tr("Width × height (px)")}</th><th scope="col" className="p-3">{tr("Format")}</th></tr></thead><tbody>{STEAM_ASSETS.map((asset) => <tr key={asset.id} className="border-t border-line"><th scope="row" className="p-3 font-medium">{tr(asset.name)}</th><td className="p-3">{tr(asset.width)}{tr(" × ")}{tr(asset.height)}{tr(asset.logo ? ' (maximum bounds)' : '')}</td><td className="p-3 uppercase">{tr(asset.format)}</td></tr>)}</tbody></table></div>
    <h3 className="mt-7 text-lg font-semibold">{tr("Does the generator create a complete Steam release?")}</h3>
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{tr("It prepares raster image assets and a named ZIP with a guide. You still need to check content rules, supply actual gameplay captures and upload your files in Steamworks. Review the required-item checklist; exporting an incomplete set does not make it release-ready. macOS ICNS icons are outside this tool.")}</p>
    <nav aria-label={tr("Related creator tools")} className="mt-7 flex flex-wrap gap-x-6 gap-y-3"><Link className={linkClass} to="/tools/discord-assets">{tr("Discord server images")}</Link><Link className={linkClass} to="/tools/youtube-assets">{tr("YouTube thumbnails and banners")}</Link><Link className={linkClass} to="/tools/mobile-assets">{tr("App Store and Google Play images")}</Link><Link className={linkClass} to="/tools/image-compressor">{tr("Compress image files")}</Link></nav>
  </section>;
}
