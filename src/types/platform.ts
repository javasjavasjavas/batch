export type PlatformId = 'youtube' | 'instagram' | 'facebook' | 'linkedin' | 'discord' | 'x' | 'twitch' | 'etsy' | 'shopify' | 'mobile';
export type InputRole = 'artwork' | 'icon' | 'images' | 'product' | 'iphone' | 'ipad' | 'android-phone' | 'android-tablet' | 'android-tv';
export interface SafeArea { x: number; y: number; width: number; height: number; label: string; kind?: 'keep' | 'avoid'; official?: boolean }
export interface PlatformAsset {
  id: string; name: string; group: string; width: number; height: number;
  format: 'jpg' | 'png'; formats?: ('jpg' | 'png')[];
  requirement: 'Required' | 'Recommended' | 'Optional' | 'Conditional';
  description: string; note: string; source: string;
  evidence: 'official' | 'preset'; // A preset must never be presented as a mandated size.
  sourceRule: string; // What the official source actually specifies.
  input?: InputRole; repeat?: boolean; minCount?: number; maxCount?: number;
  maxBytes?: number; defaultSelected?: boolean; condition?: string;
  opaque?: boolean; cleanArtwork?: boolean; circle?: boolean; brand?: boolean;
  text?: string; safeAreas?: SafeArea[]; landscape?: boolean;
  customSize?: boolean; maxWidth?: number; maxHeight?: number; maxPixels?: number;
}
export interface PlatformPack {
  id: PlatformId; name: string; title: string; description: string; category: 'Creators' | 'Social' | 'Commerce' | 'Apps';
  checked: string; notes: string[]; assets: PlatformAsset[];
}
export interface AssetFrame {
  fit: 'cover' | 'contain'; x: number; y: number; zoom: number;
  background: string; transparent: boolean; format: 'jpg' | 'png';
  logo: boolean; logoX: number; logoY: number; logoSize: number;
  text: string; textColor: string; textY: number; textSize: number;
  template: 'plain' | 'caption';
}
