# screeps-arena-bot

> Note: This is a private copy of `Slatibartfas/screeps-arena` prepared for personal development.

A complete TypeScript boilerplate for building [Screeps Arena](https://store.steampowered.com/app/464350/Screeps_Arena/) bots with modern tooling:

- 🔧 **Rollup build system** — compiles TypeScript to `.mjs` modules
- 📘 **Bundled type definitions** — full autocomplete for the Arena API
- 🧰 **Shared utilities** — reusable code across different arenas
- ✅ **Testing setup** — Mocha + Chai for unit tests

**Official Documentation**: https://arena.screeps.com/docs#

---

## Table of Contents

- [Getting Started](#getting-started)
- [Building Your Bot](#building-your-bot)
- [Using Your Bot in Game](#using-your-bot-in-game)
- [Creating a New Arena](#creating-a-new-arena)
- [Project Structure](#project-structure)
- [Writing Bot Logic](#writing-bot-logic)
- [Shared Utilities](#shared-utilities)
- [Testing](#testing)
- [Updating Type Definitions](#updating-type-definitions)
- [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- **Node.js** `>=16` ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Screeps Arena** game client ([Steam](https://store.steampowered.com/app/464350/Screeps_Arena/))

### Installation

1. **Clone or download this repository**

   ```bash
   git clone https://github.com/Slatibartfas/screeps-arena.git
   cd screeps-arena
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

   This compiles all arena bots and outputs them to `dist/arena_*/main.mjs`.

---

## Building Your Bot

### Build all arenas

```bash
npm run build
```

### Build a specific arena

Use a string filter to build only matching arenas:

```bash
npm run build -- tutorial      # Builds only arena_tutorial
npm run build -- capture       # Builds any arena with "capture" in the name
```

### Watch mode

Auto-rebuild on file changes:

```bash
npm run watch
```

**Output**: Compiled code goes to `dist/arena_<name>/main.mjs`

---

## Using Your Bot in Game

After building, you need to copy your bot code into the Screeps Arena game client:

### Step 1: Locate your Arena's local storage

The game stores custom scripts in your system's local storage directory:

- **Windows**: `%LOCALAPPDATA%\screeps-arena\scripts\`
- **macOS**: `~/Library/Application Support/screeps-arena/scripts/`
- **Linux**: `~/.local/share/screeps-arena/scripts/`

### Step 2: Copy your built bot

Each arena in the game has a unique identifier. To use your bot:

1. **Launch Screeps Arena** and navigate to the arena you want to play
2. **Find the arena ID** in the game's script editor (top of the screen, format: `arena_alpha_capture_the_flag`)
3. **Copy the corresponding built file**:
   ```bash
   # Example for "tutorial" arena
   # Copy from: dist/arena_tutorial/main.mjs
   # To: %LOCALAPPDATA%\screeps-arena\scripts\arena_alpha_tutorial\main.mjs
   ```

### Step 3: Reload in game

- Click the **"Reload"** or **"Reset"** button in the arena to use your updated script
- The game will now execute your TypeScript bot!

**💡 Tip**: Create a simple script to automate copying files to the game directory after each build.

---

## Creating a New Arena

To create a bot for a new arena scenario:

### 1. Create the arena directory

```bash
mkdir src/arena_my_custom_arena
```

### 2. Create the main entry point

Create `src/arena_my_custom_arena/main.ts`:

```typescript
import { ATTACK, MOVE } from "game/constants";
import { Creep } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

// Module-scoped variables persist for the entire match
let initialized = false;

export function loop(): void {
  // This runs every game tick

  // One-time initialization
  if (!initialized) {
    console.log("Bot initialized!");
    initialized = true;
  }

  // Get all my creeps
  const myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);

  // Get enemy creeps
  const enemies = getObjectsByPrototype(Creep).filter(c => !c.my);

  // Simple combat logic
  for (const creep of myCreeps) {
    const nearestEnemy = enemies[0]; // Simplified - find closest in real bot

    if (nearestEnemy) {
      if (creep.getRangeTo(nearestEnemy) > 1) {
        creep.moveTo(nearestEnemy);
      } else {
        creep.attack(nearestEnemy);
      }
    }
  }
}
```

### 3. Build your new arena

```bash
npm run build -- my_custom
```

### 4. Deploy to game

Copy `dist/arena_my_custom_arena/main.mjs` to the game's script directory.

---

## Project Structure

```
screeps-arena/
├── src/
│   ├── arena_tutorial/         # Tutorial arena bot
│   │   └── main.ts             # Main logic for tutorial
│   └── common/                 # Shared utilities
│       ├── combatTracker.ts    # Combat tracking utility
│       └── index.ts            # Common exports
├── @types/                     # TypeScript type definitions
│   ├── game/                   # Game API types
│   └── global/                 # Global type declarations
├── dist/                       # Built output (gitignored)
│   └── arena_*/main.mjs        # Compiled arena scripts
├── test/
│   └── unit/                   # Unit tests
├── rollup.config.js            # Build configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## Writing Bot Logic

### Core Concepts

#### 1. No Global Objects

**❌ Wrong** (MMO-style globals don't exist):

```typescript
Game.creeps; // ❌ Not available in Arena
Memory; // ❌ Not available in Arena
```

**✅ Correct** (import from `game` modules):

```typescript
import { getObjectsByPrototype } from "game/utils";
import { Creep } from "game/prototypes";

const myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);
```

#### 2. The loop() Function

Every bot must export a `loop()` function that runs each game tick:

```typescript
export function loop(): void {
  // Your bot logic here - runs every tick
}
```

#### 3. Module-Scoped Persistence

Variables declared at module level persist for the entire match:

```typescript
// These persist between ticks (no reset during match)
let myStrategy = "aggressive";
let targetedEnemies = new Map<string, string>();

export function loop(): void {
  // Use persistent variables here
  console.log(`Current strategy: ${myStrategy}`);
}
```

### Example: Simple Harvester Bot

```typescript
import { WORK, CARRY, MOVE, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from "game/constants";
import { Creep, StructureSpawn, Source } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export function loop(): void {
  const myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);
  const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
  const sources = getObjectsByPrototype(Source);

  // Spawn a harvester if we have none
  if (myCreeps.length === 0 && mySpawn) {
    mySpawn.spawnCreep([WORK, CARRY, MOVE]);
  }

  // Make each creep harvest or transfer energy
  for (const creep of myCreeps) {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      // Go harvest
      const source = sources[0];
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    } else {
      // Go deposit energy at spawn
      if (mySpawn && creep.transfer(mySpawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(mySpawn);
      }
    }
  }
}
```

### Importing Arena APIs

```typescript
// Constants (body parts, resources, error codes)
import { ATTACK, HEAL, MOVE, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from "game/constants";

// Game objects (creeps, structures, etc.)
import { Creep, StructureSpawn, Source } from "game/prototypes";

// Utility functions
import { getObjectsByPrototype, getTicks, getRange } from "game/utils";

// Pathfinding
import { searchPath } from "game/path-finder";

// Visual debugging
import { Visual } from "game/visual";
```

---

## Shared Utilities

### CombatTracker

Track damage and deaths across ticks:

```typescript
import { CombatTracker } from "common/combatTracker";
import { Creep } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

const tracker = new CombatTracker();

export function loop(): void {
  const allCreeps = getObjectsByPrototype(Creep);

  const delta = tracker.tick(allCreeps);

  console.log(`Damage to my creeps: ${delta.damageToMy}`);
  console.log(`Damage to enemies: ${delta.damageToEnemy}`);
  console.log(`My deaths: ${delta.myDeaths}`);
  console.log(`Enemy deaths: ${delta.enemyDeaths}`);
}
```

### isFirstTick()

Run initialization code only once:

```typescript
import { isFirstTick } from "common";

export function loop(): void {
  if (isFirstTick()) {
    console.log("Match started!");
    // One-time setup
  }

  // Regular tick logic
}
```

---

## Testing

Run unit tests:

```bash
npm test
```

Run lint checks:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

### Writing Tests

Create test files in `test/unit/`:

```typescript
// test/unit/myUtility.test.ts
import { expect } from "chai";
import { myFunction } from "../../src/common/myUtility";

describe("myFunction", () => {
  it("should return expected value", () => {
    const result = myFunction(5);
    expect(result).to.equal(10);
  });
});
```

---

## Updating Type Definitions

The `@types/game/` directory contains TypeScript definitions for the Arena API. To update them:

### 1. Check the official API reference

Visit https://arena.screeps.com/docs# and review the API documentation.

### 2. Update type files

Edit files in `@types/game/index.d.ts` to match the current API:

```typescript
// Example: Adding a new method to Creep
declare module "game/prototypes" {
  interface Creep extends RoomObject {
    // Add new method signature here
    newMethod(target: RoomObject): number;
  }
}
```

### 3. Verify with TypeScript

Run the build to check for type errors:

```bash
npm run build
```

**💡 Note**: This project bundles types locally to avoid external dependencies and installation issues. For maintained upstream types, consider using published packages once available.

---

## Best Practices

### Performance

1. **Cache object lookups** — Call `getObjectsByPrototype()` once per tick:

   ```typescript
   export function loop(): void {
     // ✅ Good - cache at start of tick
     const myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);

     for (const creep of myCreeps) {
       // Use cached array
     }
   }
   ```

2. **Limit pathfinding** — Use `maxOps` to prevent expensive searches:

   ```typescript
   import { searchPath } from "game/path-finder";

   const path = searchPath(start, goal, { maxOps: 2000 });
   ```

3. **Use range checks** — Prefer `getRangeTo()` over pathfinding for distance:
   ```typescript
   if (creep.getRangeTo(target) <= 3) {
     // Close enough to act
   }
   ```

### Code Organization

1. **Separate concerns** — Split large bots into multiple files:

   ```
   src/arena_my_bot/
   ├── main.ts           # Entry point and loop()
   ├── spawning.ts       # Spawn logic
   ├── combat.ts         # Combat logic
   └── economy.ts        # Resource gathering
   ```

2. **Use TypeScript features** — Leverage types and interfaces:

   ```typescript
   interface CreepRole {
     type: "harvester" | "fighter" | "healer";
     target?: RoomObject;
   }

   declare module "game/prototypes" {
     interface Creep {
       role?: CreepRole;
     }
   }
   ```

3. **Reuse logic** — Put common code in `src/common/`:
   ```typescript
   // src/common/targeting.ts
   export function findClosestEnemy(creep: Creep, enemies: Creep[]): Creep | null {
     // Reusable targeting logic
   }
   ```

### Debugging

1. **Use console.log()** — Output appears in the game client:

   ```typescript
   console.log(`Creep ${creep.id} moving to ${target.x}, ${target.y}`);
   ```

2. **Visual debugging** — Draw on the game map:

   ```typescript
   import { Visual } from "game/visual";

   const visual = new Visual();
   visual.line(creep, target);
   visual.circle(target.x, target.y);
   ```

3. **Tick-based logging** — Avoid spamming logs every tick:

   ```typescript
   import { getTicks } from "game/utils";

   if (getTicks() % 10 === 0) {
     console.log("Status update every 10 ticks");
   }
   ```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Run tests (`npm test`) and linting (`npm run lint`)
4. Submit a pull request

---

## Resources

- **Official Docs**: https://arena.screeps.com/docs#
- **Steam Page**: https://store.steampowered.com/app/464350/Screeps_Arena/

---

## License

Unlicense - see [LICENSE](LICENSE) for details.
