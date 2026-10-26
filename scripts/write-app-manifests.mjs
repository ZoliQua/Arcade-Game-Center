#!/usr/bin/env node
/**
 * (Re)write apps/<id>/package.json and tsconfig.json for every game workspace.
 * The game sources come from the standalone repos (sync-games.mjs); these two
 * files are the monorepo-specific wrapper and are generated, not hand-edited.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAMES } from './sync-games.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GAMES_ROOT = resolve(process.env.ARCADE_GAMES_ROOT ?? join(ROOT, '..'));

for (const [id, dir] of Object.entries(GAMES)) {
  const app = join(ROOT, 'apps', id);
  if (!existsSync(join(app, 'src'))) continue;
  const upstreamPkg = join(GAMES_ROOT, dir, 'package.json');
  const upstream = existsSync(upstreamPkg) ? JSON.parse(readFileSync(upstreamPkg, 'utf8')) : {};
  const pkg = {
    name: `@arcade/${id}`,
    version: upstream.version ?? '0.0.0',
    private: true,
    type: 'module',
    description: upstream.description ?? '',
    license: 'MIT',
    homepage: `https://github.com/ZoliQua/${dir}#readme`,
    main: './src/index.ts',
    types: './src/index.ts',
    exports: { '.': './src/index.ts' },
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      typecheck: 'tsc --noEmit -p .',
    },
    peerDependencies: { react: '^18', 'react-dom': '^18' },
  };
  writeFileSync(join(app, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  writeFileSync(
    join(app, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: { noEmit: true, noUnusedLocals: true, noUnusedParameters: true },
        include: ['src'],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`manifest → apps/${id}`);
}
