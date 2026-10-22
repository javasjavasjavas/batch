import { describe, it, expect } from 'vitest';
import { homography, invert, project, mugPoint, mugUV, PHOTO_SURFACES, PHOTO_SIZE } from '../src/processing/brandPhoto';
import { brandCopy, wrapText } from '../src/processing/brandLayouts';
import { BRAND_VIEWS } from '../src/processing/brand';
import { readFileSync } from 'node:fs';

describe('photographic branding', () => {
  it('registers artwork at all four photographed corners and preserves inverse mapping', () => {
    for (const quad of Object.values(PHOTO_SURFACES)) {
      const m = homography(quad), inv = invert(m);
      [[0,0],[1,0],[1,1],[0,1]].forEach(([u,v], i) => {
        const p = project(m,u,v); expect(p[0]).toBeCloseTo(quad[i][0],6); expect(p[1]).toBeCloseTo(quad[i][1],6);
      });
      for (const [u,v] of [[0.2,0.7],[0.5,0.5],[0.99,0.01]]) { const xy=project(m,u,v), back=project(inv,...xy); expect(back[0]).toBeCloseTo(u,8); expect(back[1]).toBeCloseTo(v,8); }
      expect(quad.every(([x,y]) => x >= 0 && x < PHOTO_SIZE.width && y >= 0 && y < PHOTO_SIZE.height)).toBe(true);
    }
  });
  it('wraps mug artwork around a cylinder with side compression and curved baselines', () => {
    for (const [u,v] of [[0,0],[0.1,0.9],[0.5,0.5],[1,1]]) { const back=mugUV(...mugPoint(u,v)); expect(back[0]).toBeCloseTo(u,8); expect(back[1]).toBeCloseTo(v,8); }
    expect(mugPoint(0.2,0.5)[0]-mugPoint(0.1,0.5)[0]).toBeLessThan(mugPoint(0.6,0.5)[0]-mugPoint(0.5,0.5)[0]);
    expect(mugPoint(0.5,0.5)[1]).toBeGreaterThan(mugPoint(0.1,0.5)[1]);
  });
  it('uses localized examples while preserving user-authored copy verbatim', () => {
    const empty={headline:'',body:'',action:'',useCase:'cafe' as const};
    expect(brandCopy(empty,'en').headline).not.toBe(brandCopy(empty,'es').headline);
    const custom={...empty,headline:'Mi marca única',body:'Una descripción propia.',action:'Consultar'};
    expect(brandCopy(custom,'en')).toEqual(brandCopy(custom,'es'));
    expect(brandCopy(custom,'en').headline).toBe(custom.headline);
  });
  it('keeps long headlines and long unbroken words within their allocated text box', () => {
    const drawn:{text:string;y:number;width:number}[]=[];
    const ctx={font:'',fillStyle:'',measureText(text:string){return {width:text.length*parseFloat(this.font)*0.5};},fillText(text:string,_x:number,y:number){drawn.push({text,y,width:this.measureText(text).width});}};
    wrapText(ctx as unknown as CanvasRenderingContext2D,'A long headline for a distinctive creative studio and its next collection',0,50,840,66,76,'Nunito Sans','#111111',2);
    expect(drawn.length).toBeLessThanOrEqual(2); expect(drawn.every(l=>l.width<=840)).toBe(true); expect(drawn.map(l=>l.text).join(' ')).not.toContain('…');
    drawn.length=0; wrapText(ctx as unknown as CanvasRenderingContext2D,'A'.repeat(80),0,50,400,40,50,'Nunito Sans','#111111',4);
    expect(drawn.every(l=>l.width<=400)).toBe(true); expect(drawn.length).toBeLessThanOrEqual(4);
  });
  it('ships every photo asset and exposes both typographic views in the export set', () => {
    for(const name of ['cards','mug','tote','notebook']){const file=readFileSync(new URL(`../public/images/brand-mockups/${name}-v1.webp`,import.meta.url));expect(file.subarray(8,12).toString()).toBe('WEBP');expect(file.subarray(0,4).toString()).toBe('RIFF');expect(file.readUInt32LE(4)).toBe(file.length-8);}
    expect(BRAND_VIEWS.map(v=>v.id)).toEqual(expect.arrayContaining(['tote','notebook','typography','applications']));
    expect(new Set(BRAND_VIEWS.map(v=>v.id)).size).toBe(BRAND_VIEWS.length);
  });
});
