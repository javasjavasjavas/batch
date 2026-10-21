import { socialPacks } from './social';
import { communityPacks } from './community';
import { commercePacks } from './commerce';
import { mobilePack } from './mobile';
import type { PlatformPack } from '../../types/platform';
export const PLATFORM_PACKS: PlatformPack[] = [...socialPacks, ...communityPacks, ...commercePacks, mobilePack].map((pack) => ({ ...pack, assets: pack.assets.map((asset) => asset.repeat && !asset.input ? { ...asset, input: 'images' as const } : asset) }));
