import type { BatchImage } from '../types/batch';

/**
 * Curated demo dataset. Sizes and dimensions describe the sample set and are
 * labeled as sample data wherever they appear. They are never mixed with real files.
 */
export const SAMPLE_IMAGES: BatchImage[] = [
{
  id: 'sample-sneaker',
  name: 'Sneaker Cream Side.jpg',
  size: 4_180_000,
  type: 'image/jpeg',
  width: 3600,
  height: 2400,
  url: "/0f8e9c78-f8ec-47d6-858a-6c19973b8dfd.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-headphones',
  name: 'headphones_black_01.jpg',
  size: 3_620_000,
  type: 'image/jpeg',
  width: 2400,
  height: 3200,
  url: "/24aefd3e-e003-4a7a-8166-5b1ed0cf1875.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-bottle',
  name: 'Bottle Sage Steel.jpg',
  size: 2_410_000,
  type: 'image/jpeg',
  width: 2000,
  height: 3000,
  url: "/cac62e28-3a1b-4ca0-b65f-50afb11e22c7.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-jar',
  name: 'terracotta-jar.jpg',
  size: 3_090_000,
  type: 'image/jpeg',
  width: 3200,
  height: 2400,
  url: "/c1502d49-b269-4286-863e-7a8ba66f3e88.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-serum',
  name: 'Serum Amber.jpg',
  size: 2_760_000,
  type: 'image/jpeg',
  width: 2400,
  height: 3000,
  url: "/3f85deda-9a1b-458b-8db7-5ec624ab6ef2.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-mug',
  name: 'mug-speckled.png',
  size: 9_640_000,
  type: 'image/png',
  width: 3024,
  height: 3024,
  url: "/103a5722-d537-433f-a274-e806b3756d9d.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-sunglasses',
  name: 'Sunglasses Tortoise.jpg',
  size: 3_870_000,
  type: 'image/jpeg',
  width: 3840,
  height: 2160,
  url: "/d332e695-73cc-494c-8524-545654d141a2.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
},
{
  id: 'sample-candle',
  name: 'candle-smoke.webp',
  size: 910_000,
  type: 'image/webp',
  width: 1800,
  height: 2400,
  url: "/c913ad96-d951-438b-9ee9-07ee90edf786.jpg",
  source: 'sample',
  status: 'ready',
  lastModified: null
}];


export const UNREADABLE_SAMPLE: BatchImage = {
  id: 'sample-unreadable',
  name: 'Damaged scan.jpg',
  size: 1_240_000,
  type: 'image/jpeg',
  width: null,
  height: null,
  url: null,
  source: 'sample',
  status: 'unreadable',
  lastModified: null
};