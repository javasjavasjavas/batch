import { YoutubeIcon, InstagramIcon, FacebookIcon, LinkedinIcon, MessageCircleIcon, AtSignIcon, TwitchIcon, StoreIcon, ShoppingBagIcon, SmartphoneIcon } from 'lucide-react';
import type { PlatformId } from '../../types/platform';
const icons = { youtube: YoutubeIcon, instagram: InstagramIcon, facebook: FacebookIcon, linkedin: LinkedinIcon, discord: MessageCircleIcon, x: AtSignIcon, twitch: TwitchIcon, etsy: StoreIcon, shopify: ShoppingBagIcon, mobile: SmartphoneIcon };
export function PlatformIcon({ id, className = 'h-5 w-5' }: { id: PlatformId; className?: string }) { const Icon = icons[id]; return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />; }
