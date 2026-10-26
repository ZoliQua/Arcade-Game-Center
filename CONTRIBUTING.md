# Contributing to Arcade-Game-Center

Thanks for your interest! Arcade-Game-Center is the portal that hosts every Zoltan’s Arcade game.
Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) first.

## Getting started

```bash
git clone https://github.com/ZoliQua/Arcade-Game-Center.git
cd Arcade-Game-Center
npm install
npm run dev
```

Node.js **20 or newer** is required (see `.nvmrc`).

## Before you open a pull request

Run the full check — the same one CI runs:

```bash
npm run check   # lint → typecheck → tests → production build
```

- Keep game rules in pure functions under `src/logic/` and cover them with tests.
- Keep pull requests small and focused: one fix or one feature.
- Update the README and CHANGELOG when behaviour changes.
- Game code under `apps/<id>/` mirrors the standalone repos. Change it in either place, then run
  `node scripts/sync-games.mjs push <id>` (or `pull <id>`) and `node scripts/sync-games.mjs check`.
- The shared kit lives in `packages/kit/`. After changing it run `node scripts/sync-games.mjs kit`
  and commit the vendored copy in every game repo.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: …`, `fix: …`,
`docs: …`, `test: …`, `refactor: …`, `chore: …`. Write the subject in the imperative
and explain the *why* in the body.

## Reporting bugs and ideas

Open an issue using one of the templates. For security problems see [SECURITY.md](./SECURITY.md).

## License

By contributing you agree that your contributions are licensed under the [MIT License](./LICENSE).
