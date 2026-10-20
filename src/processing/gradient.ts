/** Continue a smooth studio background from its edges, without changing source pixels. */
export function extendGradient(source: ImageData, width: number, height: number, dx: number, dy: number, dw: number, dh: number): ImageData {
  const output = new ImageData(width, height);
  const { width: sw, height: sh, data } = source;
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
  // Average a small neighborhood to keep JPEG noise from becoming long stripes.
  const sample = (x: number, y: number, channel: number) => {
    let sum = 0, count = 0;
    const cx = Math.round(clamp(x, 0, sw - 1)), cy = Math.round(clamp(y, 0, sh - 1));
    for (let yy = Math.max(0, cy - 2); yy <= Math.min(sh - 1, cy + 2); yy++)
      for (let xx = Math.max(0, cx - 2); xx <= Math.min(sw - 1, cx + 2); xx++) {
        sum += data[(yy * sw + xx) * 4 + channel]; count++;
      }
    return sum / count;
  };
  // Precompute edge values and inward derivatives; runtime is linear in output size.
  const edges = [new Float32Array(sh * 6), new Float32Array(sh * 6), new Float32Array(sw * 6), new Float32Array(sw * 6)];
  const stepX = Math.max(3, Math.round(sw * 0.08)), stepY = Math.max(3, Math.round(sh * 0.08));
  for (let edge = 0; edge < 4; edge++) {
    const vertical = edge < 2, length = vertical ? sh : sw;
    for (let i = 0; i < length; i++) for (let c = 0; c < 3; c++) {
      const x = vertical ? (edge === 0 ? 0 : sw - 1) : i;
      const y = vertical ? i : (edge === 2 ? 0 : sh - 1);
      const ex = vertical ? x + (edge === 0 ? stepX : -stepX) : x;
      const ey = vertical ? y : y + (edge === 2 ? stepY : -stepY);
      const value = sample(x, y, c);
      edges[edge][i * 6 + c] = value;
      edges[edge][i * 6 + c + 3] = clamp(value - sample(ex, ey, c), -12, 12) / (vertical ? stepX : stepY);
    }
  }
  // Smooth the continuation along each edge so tiny lighting/noise changes do not
  // become stripes. Fade from the original edge into this smoother field.
  const smoothEdges = edges.map((values) => {
    const length = values.length / 6, radius = Math.max(4, Math.round(length * 0.07));
    const blurred = new Float32Array(values.length);
    for (let i = 0; i < length; i++) {
      let weight = 0;
      for (let k = -radius; k <= radius; k++) {
        const w = Math.exp(-k * k / (radius * radius / 2));
        const j = clamp(i + k, 0, length - 1);
        for (let c = 0; c < 6; c++) blurred[i * 6 + c] += values[j * 6 + c] * w;
        weight += w;
      }
      for (let c = 0; c < 6; c++) blurred[i * 6 + c] /= weight;
    }
    return blurred;
  });
  const read = (edge: number, position: number, distance: number, c: number) => {
    const length = edge < 2 ? sh : sw, p = clamp(position, 0, length - 1), a = Math.floor(p), b = Math.min(a + 1, length - 1), t = p - a;
    const values = edges[edge];
    const value = values[a * 6 + c] * (1 - t) + values[b * 6 + c] * t;
    const smooth = smoothEdges[edge];
    const smoothValue = smooth[a * 6 + c] * (1 - t) + smooth[b * 6 + c] * t;
    const slope = smooth[a * 6 + c + 3] * (1 - t) + smooth[b * 6 + c + 3] * t;
    const range = (edge < 2 ? sw : sh) * 0.35;
    const blend = 1 - Math.exp(-distance / (range * 0.25));
    return value * (1 - blend) + smoothValue * blend + slope * range * (1 - Math.exp(-distance / range));
  };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const sx = (x - dx) * (sw - 1) / Math.max(1, dw - 1), sy = (y - dy) * (sh - 1) / Math.max(1, dh - 1);
    const ox = sx < 0 ? -sx : Math.max(0, sx - sw + 1), oy = sy < 0 ? -sy : Math.max(0, sy - sh + 1);
    const index = (y * width + x) * 4;
    for (let c = 0; c < 3; c++) {
      const horizontal = read(sx < 0 ? 0 : 1, sy, ox, c);
      const vertical = read(sy < 0 ? 2 : 3, sx, oy, c);
      output.data[index + c] = ox && oy ? (horizontal * ox + vertical * oy) / (ox + oy) : ox ? horizontal : vertical;
    }
    output.data[index + 3] = 255;
  }
  return output;
}
