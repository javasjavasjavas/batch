import type { BatchSettings, EnabledTools } from '../types/batch';
import { plannedDimensions } from '../utils/planning';
import { mimeFor, sniffFormat, type InputFormat, LIMITS } from './formats';
import jpegWasmUrl from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import webpWasmUrl from '@jsquash/webp/codec/enc/webp_enc.wasm?url';
import webpSimdWasmUrl from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url';
import pngWasmUrl from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm?url';
import oxipngWasmUrl from '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm?url';
import { simd } from 'wasm-feature-detect';
import { encodingOptions } from './encodingOptions';
import { extendGradient } from './gradient';
import { encodeToTarget } from './targetSize';

export interface ProcessResult { blob: Blob; width: number; height: number; format: string }

async function decodeSource(file: File): Promise<{source: CanvasImageSource; width: number; height: number; release: () => void}> {
  if (typeof createImageBitmap !== 'undefined') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  }
  if (typeof document === 'undefined') throw new Error('This browser cannot decode images in a worker.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch (error) { URL.revokeObjectURL(url); throw error; }
}

function color(hex: string) { return hex || '#FFFFFF'; }

function canvasFor(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  if (typeof document !== 'undefined') { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; return canvas; }
  throw new Error('This browser cannot create a processing canvas.');
}

async function encode(data: ImageData, format: string, settings: BatchSettings, enabled: EnabledTools): Promise<ArrayBuffer> {
  const options = encodingOptions(settings, enabled);
  if (format === 'jpg') {
    const { default: jpeg, init } = await import('@jsquash/jpeg/encode.js');
    await init(await WebAssembly.compile(await (await fetch(jpegWasmUrl)).arrayBuffer()));
    return jpeg(data, options.jpeg);
  }
  if (format === 'webp') {
    const { default: webp, init } = await import('@jsquash/webp/encode.js');
    await init(await WebAssembly.compile(await (await fetch((await simd()) ? webpSimdWasmUrl : webpWasmUrl)).arrayBuffer()));
    return webp(data, options.webp);
  }
  if (format === 'png') {
    const { default: png, init: initPng } = await import('@jsquash/png/encode.js');
    const { default: optimise, init: initOxi } = await import('@jsquash/oxipng/optimise.js');
    await initPng(pngWasmUrl);
    await initOxi(oxipngWasmUrl);
    const raw = await png(data);
    const level = enabled.convert ? { fast: 0, balanced: 2, smallest: 5 }[settings.convert.pngLevel] : 2;
    return optimise(raw, { level, optimiseAlpha: false, interlace: false });
  }
  throw new Error(`Select JPG, PNG or WebP output to transform ${format.toUpperCase()} images.`);
}

export async function processFile(file: File, input: InputFormat, animated: boolean, settings: BatchSettings, enabled: EnabledTools, report: (message: string) => void = () => { /* Progress is optional outside the workspace. */ }): Promise<ProcessResult> {
  const original = new Uint8Array(await file.arrayBuffer());
  if (sniffFormat(original) !== input) throw new Error('The input format changed or could not be verified.');
  const pixelWork = enabled.resize || enabled.compress || enabled.convert;
  if (!pixelWork) return { blob: file, width: 0, height: 0, format: input };
  if (animated) throw new Error('Animated images can only be renamed unchanged. Disable Resize, Compress and Convert for this file.');
  if (enabled.compress && !settings.compress.stripMetadata) throw new Error('Metadata preservation during pixel processing is not available. Turn on Remove metadata or use Rename only.');
  const format = enabled.convert ? settings.convert.format : input;
  const backgroundMode = enabled.resize ? settings.resize.backgroundMode || 'original' : 'original';
  if (backgroundMode === 'transparent' && format === 'jpg') throw new Error('Choose PNG or WebP to keep the background transparent.');
  if (format === 'gif' || format === 'avif') throw new Error(`Select JPG, PNG or WebP output to transform ${input.toUpperCase()} images.`);
  // Browser decoding applies EXIF orientation. Canvas output has no stale EXIF orientation tag.
  const bitmap = await decodeSource(file);
  try {
    const dims = plannedDimensions(bitmap.width, bitmap.height, settings, enabled);
    if (!dims || dims.width > LIMITS.dimension || dims.height > LIMITS.dimension || dims.width * dims.height > LIMITS.pixels) throw new Error('Output dimensions exceed the browser processing limit.');
    const canvas = canvasFor(dims.width, dims.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) throw new Error('Canvas processing is unavailable.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    let source = bitmap.source;
    if (backgroundMode === 'transparent' || backgroundMode === 'color') {
      // The AI analyzes a 512px copy; compose the mask at the source resolution.
      const sourceCanvas = canvasFor(bitmap.width, bitmap.height);
      const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
      sourceCtx.drawImage(bitmap.source, 0, 0);
      const { removeBackground } = await import('./background');
      sourceCtx.putImageData(await removeBackground(sourceCtx.getImageData(0, 0, bitmap.width, bitmap.height), report), 0, 0);
      source = sourceCanvas;
    }
    if (format === 'jpg' || backgroundMode === 'color') {
      ctx.fillStyle = color(backgroundMode === 'color' ? settings.resize.padColor : enabled.convert ? settings.convert.background : '#FFFFFF');
      ctx.fillRect(0, 0, dims.width, dims.height);
    }
    let dx = 0, dy = 0, dw = dims.width, dh = dims.height;
    if (enabled.resize && settings.resize.unit === 'px' && !settings.resize.lockAspect) {
      const scale = settings.resize.fit === 'cover' ? Math.max(dims.width / bitmap.width, dims.height / bitmap.height) : Math.min(dims.width / bitmap.width, dims.height / bitmap.height);
      dw = Math.round(bitmap.width * scale); dh = Math.round(bitmap.height * scale);
      dx = Math.round((dims.width - dw) / 2); dy = Math.round((dims.height - dh) / 2);
      if (settings.resize.fit === 'pad' && backgroundMode === 'original') { ctx.fillStyle = color(settings.resize.padColor); ctx.fillRect(0, 0, dims.width, dims.height); }
    }
    if (backgroundMode === 'extend' && (dw < dims.width || dh < dims.height)) {
      report('Extending the studio gradient…');
      const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
      const sw = Math.max(2, Math.round(bitmap.width * scale)), sh = Math.max(2, Math.round(bitmap.height * scale));
      const sampleCanvas = canvasFor(sw, sh);
      const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
      sampleCtx.drawImage(bitmap.source, 0, 0, sw, sh);
      ctx.putImageData(extendGradient(sampleCtx.getImageData(0, 0, sw, sh), dims.width, dims.height, dx, dy, dw, dh), 0, 0);
    }
    ctx.drawImage(source, dx, dy, dw, dh);
    report('Encoding the output…');
    const data = ctx.getImageData(0, 0, dims.width, dims.height);
    const target = enabled.compress && settings.compress.targetKB?.trim();
    const result = target ? await encodeToTarget({
      width: dims.width, height: dims.height, maxBytes: Number(target) * 1000,
      quality: settings.compress.quality, allowResize: !!settings.compress.allowTargetResize,
      lossy: format !== 'png' && !(format === 'webp' && enabled.convert && settings.convert.webpLossless),
      encode: async (width, height, quality) => {
        report('Finding an output within the size limit…');
        let pixels = data;
        if (width !== dims.width || height !== dims.height) {
          const smaller = canvasFor(width, height);
          const context = smaller.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
          context.imageSmoothingQuality = 'high';
          context.drawImage(canvas, 0, 0, width, height);
          pixels = context.getImageData(0, 0, width, height);
        }
        return encode(pixels, format, { ...settings, compress: { ...settings.compress, quality } }, enabled);
      }
    }) : { bytes: await encode(data, format, settings, enabled), ...dims };
    const { bytes } = result;
    if (sniffFormat(new Uint8Array(bytes)) !== format) throw new Error('Encoder returned an unexpected format.');
    return { blob: new Blob([bytes], { type: mimeFor(format) }), width: result.width, height: result.height, format };
  } finally { bitmap.release(); }
}
