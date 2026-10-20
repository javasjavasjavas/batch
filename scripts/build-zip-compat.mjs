// Restore the ZIP module URLs referenced by already-open published versions.
// This standalone module must not import an old application entrypoint.
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';

const { outputFiles } = await build({
  stdin: {
    contents: `
      import { ZipWriter as Writer, BlobReader, BlobWriter } from '@zip.js/zip.js/lib/zip-core-external.js';
      export { BlobReader, BlobWriter };
      export class ZipWriter extends Writer {
        constructor(writer, options = {}) { super(writer, { ...options, useWebWorkers: false }); }
      }
    `,
    resolveDir: process.cwd(),
    sourcefile: 'zip-compat.js',
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  legalComments: 'inline',
});
await mkdir('public/assets', { recursive: true });
for (const name of ['index-D8jMrnd2.js', 'index-CL41cNlq.js', 'index-82FLp1yE.js', 'index-Cb5nRLPQ.js']) {
  await writeFile(`public/assets/${name}`, outputFiles[0].contents);
}
console.log('Restored ZIP compatibility modules for the four published versions.');
