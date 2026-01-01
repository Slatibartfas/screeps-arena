# Arena: tutorial ✅

This is a simple tutorial arena demonstrating a basic economy and combat setup.

## Behavior

- Spawns a small set of roles: **harvester**, **builder**, **melee**, **ranged**, **healer**.
- Uses inferred roles based on creep body parts (WORK+CARRY -> builder, HEAL -> healer, etc.).
- Spawn priorities: harvesters -> builders -> attackers -> healers.
- Automatically attempts to create a container construction site near the spawn, then a tower site.
- Creeps perform simple behaviors: harvest, transfer/withdraw, build, attack, heal.

## Files

- `main.ts` — the arena script implementing the above behavior.

## Notes for contributors

- The code is TypeScript-checked; prefer typed prototypes (e.g. `Creep`) and module-scoped persistent variables for simplicity.
- To run the full build locally:

```bash
npm install
npm run build
npm test
```
