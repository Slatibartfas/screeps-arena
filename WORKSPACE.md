# Screeps Arena — Workspace notes

This workspace was created from a starter template and placed in:

    G:\Repositories\screeps-arena

Notes & next steps:

- The project targets Node >=16.
- If you manage multiple Node versions, nvm-windows is convenient: https://github.com/coreybutler/nvm-windows

  1. Install/enable Node 16: `nvm install 16 && nvm use 16`
  2. Run: `npm ci` (or `npm install`)

- If you prefer to inspect sources without switching Node, you can run a safe install that skips lifecycle scripts:

  `npm install --ignore-scripts`

- VS Code workspace file: `screeps-arena.code-workspace` (open with `code screeps-arena.code-workspace`)
- Recommended extensions (auto-recommended by the workspace): ESLint, Prettier, TypeScript Next, npm Scripts

- Note: this project avoids running upstream `prepare` scripts during install by using bundled typing shims in `./@types`. If you prefer fully maintained upstream types, consider depending on a published package or a tagged release to avoid lifecycle script issues.

- This repo bundles `@types/game` and `@types/global` so you get autocomplete and typechecking out of the box.
