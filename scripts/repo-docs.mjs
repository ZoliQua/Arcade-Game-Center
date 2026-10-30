#!/usr/bin/env node
/**
 * Write the shared community/health files into every arcade repo so they stay
 * identical: CODE_OF_CONDUCT, CONTRIBUTING, CONTRIBUTORS, SECURITY, LICENSE,
 * .editorconfig, .nvmrc, GitHub issue/PR templates and the CI workflow.
 *
 *   node scripts/repo-docs.mjs            all game repos + this monorepo
 *   node scripts/repo-docs.mjs snake      one game
 *
 * README.md and CHANGELOG.md are hand-written per repo and never touched here.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GAMES_ROOT = resolve(process.env.ARCADE_GAMES_ROOT ?? join(ROOT, '..'));
const YEAR = 2026;
const AUTHOR = 'Zoltán Dul';
const CONTACT = 'zoltan.dul@gmail.com';

const REPOS = {
  tetris: { dir: 'Tetris-Game', name: 'Tetris' },
  snake: { dir: 'Snake-Game', name: 'Snake' },
  2048: { dir: '2048-Game', name: '2048' },
  pacman: { dir: 'Pac-Man-Game', name: 'Pac-Man' },
  gomoku: { dir: 'Gomoku-Game', name: 'Gomoku' },
  tictactoe: { dir: 'Tic-Tac-Toe-Game', name: 'Tic-Tac-Toe' },
  breakout: { dir: 'Breakout-Game', name: 'Breakout' },
  invaders: { dir: 'Space-Invaders-Game', name: 'Space Invaders' },
  connect4: { dir: 'Connect-Four-Game', name: 'Connect Four' },
  nutsort: { dir: 'Nut-Sort-Game', name: 'Nut Sort' },
  center: { dir: 'Arcade-Game-Center', name: 'Arcade-Game-Center', monorepo: true },
};

const license = () => `MIT License

Copyright (c) ${YEAR} ${AUTHOR}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const codeOfConduct = () => `# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the overall
  community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of
  any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email address,
  without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Community leaders have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include using an official e-mail address,
posting via an official social media account, or acting as an appointed
representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
**${CONTACT}**. All complaints will be reviewed and investigated promptly and
fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

## Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series of
actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or permanent
ban.

### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified period of time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior, harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within the
community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.1, available at
[https://www.contributor-covenant.org/version/2/1/code_of_conduct.html][v2.1].

Community Impact Guidelines were inspired by
[Mozilla's code of conduct enforcement ladder][Mozilla CoC].

For answers to common questions about this code of conduct, see the FAQ at
[https://www.contributor-covenant.org/faq][FAQ]. Translations are available at
[https://www.contributor-covenant.org/translations][translations].

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
[Mozilla CoC]: https://github.com/mozilla/diversity
[FAQ]: https://www.contributor-covenant.org/faq
[translations]: https://www.contributor-covenant.org/translations
`;

const contributing = (r) => `# Contributing to ${r.name}

Thanks for your interest! ${r.monorepo ? 'Arcade-Game-Center is the portal that hosts every Zoltan’s Arcade game.' : `${r.name} is one of the Zoltan’s Arcade games — it runs on its own and inside [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center).`}
Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) first.

## Getting started

\`\`\`bash
git clone https://github.com/ZoliQua/${r.dir}.git
cd ${r.dir}
npm install
npm run dev
\`\`\`

Node.js **20 or newer** is required (see \`.nvmrc\`).

## Before you open a pull request

Run the full check — the same one CI runs:

\`\`\`bash
npm run check   # lint → typecheck → tests → production build
\`\`\`

- Keep game rules in pure functions under \`src/logic/\` and cover them with tests.
- Keep pull requests small and focused: one fix or one feature.
- Update the README and CHANGELOG when behaviour changes.
${r.monorepo ? `- Game code under \`apps/<id>/\` mirrors the standalone repos. Change it in either place, then run
  \`node scripts/sync-games.mjs push <id>\` (or \`pull <id>\`) and \`node scripts/sync-games.mjs check\`.
- The shared kit lives in \`packages/kit/\`. After changing it run \`node scripts/sync-games.mjs kit\`
  and commit the vendored copy in every game repo.` : `- \`src/arcade/\` is the vendored shared kit. **Do not edit it here** — change it in
  [Arcade-Game-Center/packages/kit](https://github.com/ZoliQua/Arcade-Game-Center/tree/main/packages/kit)
  and sync it to every game.`}

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): \`feat: …\`, \`fix: …\`,
\`docs: …\`, \`test: …\`, \`refactor: …\`, \`chore: …\`. Write the subject in the imperative
and explain the *why* in the body.

## Reporting bugs and ideas

Open an issue using one of the templates. For security problems see [SECURITY.md](./SECURITY.md).

## License

By contributing you agree that your contributions are licensed under the [MIT License](./LICENSE).
`;

const contributors = (r) => `# Contributors

Thank you to everyone who has helped build ${r.name}.

## Maintainer

- **${AUTHOR}** ([@ZoliQua](https://github.com/ZoliQua)) — design, development and maintenance

## Contributors

<!-- Add yourself in your first pull request: - **Name** ([@handle](https://github.com/handle)) — what you did -->

_Your name could be here — see [CONTRIBUTING.md](./CONTRIBUTING.md)._
`;

const security = (r) => `# Security Policy

## Supported versions

Only the latest release on the \`main\` branch of ${r.name} receives fixes.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.
Email **${CONTACT}** with a description, steps to reproduce and the affected
version or commit. You will get an answer within 7 days.

${r.monorepo ? 'The portal talks to a small PHP leaderboard API (`arcade-api/`); reports about score submission, rate limiting or input validation are especially welcome.' : 'The game runs entirely in the browser and stores data only in `localStorage` (stats, settings, autosaved session). It has no server component.'}
`;

const editorconfig = () => `root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
`;

const bugTemplate = (r) => `---
name: Bug report
about: Something in ${r.name} does not work as expected
title: 'fix: '
labels: bug
---

**What happened**

**What you expected**

**Steps to reproduce**
1.
2.

**Environment**
- Browser and version:
- ${r.monorepo ? 'Portal or standalone game:' : 'Standalone or inside Arcade-Game-Center:'}
- Commit / version:
`;

const featureTemplate = (r) => `---
name: Feature request
about: Suggest an idea for ${r.name}
title: 'feat: '
labels: enhancement
---

**The problem or wish**

**Proposed solution**

**Alternatives considered**
`;

const issueConfig = () => `blank_issues_enabled: true
contact_links:
  - name: Zoltan's Arcade portal
    url: https://github.com/ZoliQua/Arcade-Game-Center
    about: Issues that affect the whole arcade (shared kit, portal, leaderboard)
`;

const prTemplate = () => `## What and why

## How it was tested

- [ ] \`npm run check\` passes (lint, typecheck, tests, build)
- [ ] Played it in the browser (standalone and/or in Arcade-Game-Center)

## Notes for the reviewer
`;

const ci = () => `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
`;

function write(root, rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

const only = process.argv[2];
for (const [id, r] of Object.entries(REPOS)) {
  if (only && only !== id) continue;
  const root = r.monorepo ? ROOT : join(GAMES_ROOT, r.dir);
  if (!existsSync(root)) {
    console.warn(`skip ${id}: ${root} not found`);
    continue;
  }
  write(root, 'LICENSE', license());
  write(root, 'CODE_OF_CONDUCT.md', codeOfConduct());
  write(root, 'CONTRIBUTING.md', contributing(r));
  write(root, 'CONTRIBUTORS.md', contributors(r));
  write(root, 'SECURITY.md', security(r));
  write(root, '.editorconfig', editorconfig());
  write(root, '.nvmrc', '22\n');
  write(root, '.github/ISSUE_TEMPLATE/bug_report.md', bugTemplate(r));
  write(root, '.github/ISSUE_TEMPLATE/feature_request.md', featureTemplate(r));
  write(root, '.github/ISSUE_TEMPLATE/config.yml', issueConfig());
  write(root, '.github/PULL_REQUEST_TEMPLATE.md', prTemplate());
  write(root, '.github/workflows/ci.yml', ci());
  console.log(`docs → ${r.dir}`);
}
