import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const KIT_SRC = resolve(here, '../../packages/kit/src');

/**
 * Every game vendors the kit as `src/arcade/` so it can build standalone.
 * Inside the portal, point all of those copies at packages/kit so the bundle
 * contains the kit once (`npm run sync:check` guarantees they are identical).
 */
function dedupeVendoredKit(): Plugin {
  return {
    name: 'arcade:dedupe-vendored-kit',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !source.startsWith('.')) return null;
      const abs = resolve(dirname(importer), source);
      const match = abs.match(/[\\/]apps[\\/][^\\/]+[\\/]src[\\/]arcade(?:([\\/].*))?$/);
      if (!match) return null;
      return this.resolve(KIT_SRC + (match[1] ?? ''), importer, { ...options, skipSelf: true });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [dedupeVendoredKit(), react()],
  server: { port: 5173, open: false },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 900,
  },
});
