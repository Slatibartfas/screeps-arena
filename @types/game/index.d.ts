declare module "game/constants" {
  export type BodyPartConstant = "move" | "work" | "carry" | "attack" | "ranged_attack" | "heal" | "tough";
  export type ResourceConstant = "energy";

  export type DirectionConstant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  export const OK: 0;
  export const ERR_NOT_OWNER: -1;
  export const ERR_NO_PATH: -2;
  export const ERR_NAME_EXISTS: -3;
  export const ERR_BUSY: -4;
  export const ERR_NOT_FOUND: -5;
  export const ERR_NOT_ENOUGH_RESOURCES: -6;
  export const ERR_NOT_ENOUGH_ENERGY: -6;
  export const ERR_INVALID_TARGET: -7;
  export const ERR_FULL: -8;
  export const ERR_NOT_IN_RANGE: -9;
  export const ERR_INVALID_ARGS: -10;
  export const ERR_TIRED: -11;
  export const ERR_NO_BODYPART: -12;

  export const MOVE: "move";
  export const WORK: "work";
  export const CARRY: "carry";
  export const ATTACK: "attack";
  export const RANGED_ATTACK: "ranged_attack";
  export const HEAL: "heal";
  export const TOUGH: "tough";

  export const TOP: 1;
  export const TOP_RIGHT: 2;
  export const RIGHT: 3;
  export const BOTTOM_RIGHT: 4;
  export const BOTTOM: 5;
  export const BOTTOM_LEFT: 6;
  export const LEFT: 7;
  export const TOP_LEFT: 8;

  export const RESOURCE_ENERGY: "energy";

  export const TERRAIN_PLAIN: 0;
  export const TERRAIN_WALL: 1;
  export const TERRAIN_SWAMP: 2;

  export const BODYPART_COST: Record<BodyPartConstant, number>;
  export const BODYPART_HITS: number;
  export const CARRY_CAPACITY: number;
  export const HARVEST_POWER: number;
  export const BUILD_POWER: number;
  export const ATTACK_POWER: number;
  export const RANGED_ATTACK_POWER: number;
  export const RANGED_HEAL_POWER: number;
  export const HEAL_POWER: number;

  export const MAX_CREEP_SIZE: number;
  export const MAX_CONSTRUCTION_SITES: number;

  export const SPAWN_ENERGY_CAPACITY: number;
  export const EXTENSION_ENERGY_CAPACITY: number;
  export const TOWER_CAPACITY: number;
  export const TOWER_RANGE: number;
  export const TOWER_COOLDOWN: number;
  export const TOWER_ENERGY_COST: number;
  export const TOWER_OPTIMAL_RANGE: number;
  export const TOWER_FALLOFF_RANGE: number;
  export const TOWER_FALLOFF: number;
  export const TOWER_POWER_ATTACK: number;
  export const TOWER_POWER_HEAL: number;
  export const TOWER_POWER_REPAIR: number;
}

declare module "game/prototypes" {
  import type { BodyPartConstant, DirectionConstant, ResourceConstant } from "game/constants";

  export interface RoomPosition {
    x: number;
    y: number;
  }

  export type AnyPosition = RoomPosition;

  export interface GameObject {
    id: string;
    x: number;
    y: number;
    exists: boolean;
    ticksToDecay?: number;
    controlledBy?: Flag;

    findClosestByPath<T extends AnyPosition>(positions: T[], opts?: any): T | null;
    findClosestByRange<T extends AnyPosition>(positions: T[]): T | null;
    findInRange<T extends AnyPosition>(positions: T[], range: number): T[];
    findPathTo(pos: AnyPosition, opts?: any): RoomPosition[];
    getRangeTo(pos: AnyPosition): number;
  }
  export const GameObject: { prototype: GameObject };

  export interface Store {
    getCapacity(resource?: ResourceConstant): number;
    getFreeCapacity(resource?: ResourceConstant): number;
    getUsedCapacity(resource?: ResourceConstant): number;
    [key: string]: number;
  }

  export interface Structure extends GameObject {
    hits: number;
    hitsMax: number;
  }
  export const Structure: { prototype: Structure };

  export interface OwnedStructure extends Structure {
    my?: boolean;
  }
  export const OwnedStructure: { prototype: OwnedStructure };

  export interface Resource extends GameObject {
    amount: number;
    resourceType: ResourceConstant;
  }
  export const Resource: { prototype: Resource };

  export interface Source extends GameObject {
    energy: number;
    energyCapacity: number;
  }
  export const Source: { prototype: Source };

  export interface Flag extends GameObject {
    my?: boolean;
  }
  export const Flag: { prototype: Flag };

  export interface ConstructionSite extends GameObject {
    my: boolean;
    progress: number;
    progressTotal: number;
    structure: Structure;
    remove(): number;
  }
  export const ConstructionSite: { prototype: ConstructionSite };

  export interface Spawning {
    creep: Creep;
    needTime: number;
    remainingTime: number;
    cancel(): number;
  }

  export interface CreepBodyPart {
    type: BodyPartConstant;
    hits: number;
  }

  export interface Creep extends GameObject {
    body: CreepBodyPart[];
    fatigue: number;
    hits: number;
    hitsMax: number;
    my: boolean;
    spawning: boolean;
    store: Store;

    move(direction: DirectionConstant): number;
    moveTo(target: AnyPosition, opts?: any): number | void;
    attack(target: Creep | Structure | ConstructionSite): number;
    rangedAttack(target: Creep | Structure): number;
    rangedMassAttack(): number;
    heal(target: Creep): number;
    rangedHeal(target: Creep): number;
    harvest(target: Source): number;
    build(target: ConstructionSite): number;
    pickup(target: Resource): number;
    drop(resourceType: ResourceConstant, amount?: number): number;
    transfer(target: Creep | Structure, resourceType: ResourceConstant, amount?: number): number;
    withdraw(target: Structure, resourceType: ResourceConstant, amount?: number): number;
    pull(target: Creep): number;
  }
  export const Creep: { prototype: Creep };

  export interface StructureContainer extends OwnedStructure {
    store: Store;
  }
  export const StructureContainer: { prototype: StructureContainer };

  export interface StructureExtension extends OwnedStructure {
    store: Store;
  }
  export const StructureExtension: { prototype: StructureExtension };

  export interface StructureRampart extends OwnedStructure {}
  export const StructureRampart: { prototype: StructureRampart };

  export interface StructureRoad extends Structure {}
  export const StructureRoad: { prototype: StructureRoad };

  export interface StructureWall extends Structure {}
  export const StructureWall: { prototype: StructureWall };

  export interface StructureSpawn extends OwnedStructure {
    directions: DirectionConstant[];
    spawning: Spawning | null;
    store: Store;

    setDirections(directions: DirectionConstant[]): number;
    spawnCreep(body: BodyPartConstant[]): { error?: number; object?: Creep };
  }
  export const StructureSpawn: { prototype: StructureSpawn };

  export interface StructureTower extends OwnedStructure {
    cooldown: number;
    store: Store;
    attack(target: Creep | Structure): number;
    heal(target: Creep): number;
  }
  export const StructureTower: { prototype: StructureTower };
}

declare module "game/utils" {
  import type { BodyPartConstant, DirectionConstant, ResourceConstant } from "game/constants";
  import type { AnyPosition, ConstructionSite, GameObject, RoomPosition, Store, Structure } from "game/prototypes";

  export interface ConstructionSiteCreateResult {
    error?: number;
    object?: ConstructionSite;
  }

  export function getCpuTime(): number;
  export function getTicks(): number;
  export function getHeapStatistics(): Record<string, number>;

  export function getObjectById<T extends GameObject = GameObject>(id: string): T | null;
  export function getObjects(): GameObject[];
  export function getObjectsByPrototype<T extends GameObject>(prototype: { prototype: T }): T[];

  export function getRange(a: AnyPosition, b: AnyPosition): number;
  export function getDirection(dx: number, dy: number): DirectionConstant;

  export function findClosestByRange<T extends AnyPosition>(fromPos: AnyPosition, positions: T[]): T | null;
  export function findInRange<T extends AnyPosition>(fromPos: AnyPosition, positions: T[], range: number): T[];
  export function findClosestByPath<T extends AnyPosition>(fromPos: AnyPosition, positions: T[], opts?: any): T | null;
  export function findPath(fromPos: AnyPosition, toPos: AnyPosition, opts?: any): RoomPosition[];

  export function getTerrainAt(pos: AnyPosition): number;
  export function createConstructionSite(
    position: AnyPosition,
    prototype: { prototype: Structure }
  ): ConstructionSiteCreateResult;
}

declare module "game/path-finder" {
  import type { AnyPosition, RoomPosition } from "game/prototypes";

  export interface SearchPathGoal {
    pos: AnyPosition;
    range?: number;
  }

  export interface SearchPathOptions {
    costMatrix?: CostMatrix;
    plainCost?: number;
    swampCost?: number;
    flee?: boolean;
    maxOps?: number;
    maxCost?: number;
    heuristicWeight?: number;
  }

  export interface SearchPathResult {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
  }

  export class CostMatrix {
    constructor();
    clone(): CostMatrix;
    get(x: number, y: number): number;
    set(x: number, y: number, cost: number): void;
  }

  export function searchPath(
    origin: AnyPosition,
    goal: AnyPosition | SearchPathGoal | (AnyPosition | SearchPathGoal)[],
    opts?: SearchPathOptions
  ): SearchPathResult;
}

declare module "game/visual" {
  import type { AnyPosition } from "game/prototypes";

  export interface TextStyle {
    color?: string;
    font?: number | string;
    stroke?: string;
    strokeWidth?: number;
    backgroundColor?: string;
    backgroundPadding?: number;
    align?: "center" | "left" | "right";
    opacity?: number;
  }

  export interface LineStyle {
    width?: number;
    color?: string;
    opacity?: number;
    lineStyle?: "dashed" | "dotted";
  }

  export interface PolyStyle {
    fill?: string;
    opacity?: number;
    stroke?: string;
    strokeWidth?: number;
    lineStyle?: "dashed" | "dotted";
  }

  export interface CircleStyle extends PolyStyle {
    radius?: number;
  }

  export class Visual {
    constructor(layer?: number, persistent?: boolean);
    layer: number;
    persistent: boolean;

    clear(): this;
    size(): number;
    text(text: string, pos: AnyPosition, style?: TextStyle): this;
    line(pos1: AnyPosition, pos2: AnyPosition, style?: LineStyle): this;
    poly(points: AnyPosition[], style?: PolyStyle): this;
    rect(pos: AnyPosition, w: number, h: number, style?: PolyStyle): this;
    circle(pos: AnyPosition, style?: CircleStyle): this;
  }
}

declare module "game" {
  export const arenaInfo: {
    cpuTimeLimit: number;
    cpuTimeLimitFirstTick: number;
    level: number;
    name: string;
    season: string;
    ticksLimit: number;
  };

  export const constants: typeof import("game/constants");
  export const prototypes: typeof import("game/prototypes");
  export const utils: typeof import("game/utils");
  export const visual: typeof import("game/visual");
  export const pathFinder: typeof import("game/path-finder");

  // Some docs snippets import getTicks from 'game'. Declare it here as a convenience.
  export { getTicks } from "game/utils";
}

// Re-export submodules used in the official docs examples.
declare module "game/prototypes/game-object" {
  export { GameObject } from "game/prototypes";
}
declare module "game/prototypes/store" {
  export type { Store } from "game/prototypes";
}
declare module "game/prototypes/structure" {
  export type { Structure } from "game/prototypes";
  export { Structure } from "game/prototypes";
}
declare module "game/prototypes/owned-structure" {
  export type { OwnedStructure } from "game/prototypes";
  export { OwnedStructure } from "game/prototypes";
}
declare module "game/prototypes/creep" {
  export type { Creep } from "game/prototypes";
  export { Creep } from "game/prototypes";
}
declare module "game/prototypes/spawn" {
  export type { StructureSpawn, Spawning } from "game/prototypes";
  export { StructureSpawn } from "game/prototypes";
}
declare module "game/prototypes/tower" {
  export type { StructureTower } from "game/prototypes";
  export { StructureTower } from "game/prototypes";
}
declare module "game/prototypes/container" {
  export type { StructureContainer } from "game/prototypes";
  export { StructureContainer } from "game/prototypes";
}
declare module "game/prototypes/extension" {
  export type { StructureExtension } from "game/prototypes";
  export { StructureExtension } from "game/prototypes";
}
declare module "game/prototypes/rampart" {
  export type { StructureRampart } from "game/prototypes";
  export { StructureRampart } from "game/prototypes";
}
declare module "game/prototypes/road" {
  export type { StructureRoad } from "game/prototypes";
  export { StructureRoad } from "game/prototypes";
}
declare module "game/prototypes/wall" {
  export type { StructureWall } from "game/prototypes";
  export { StructureWall } from "game/prototypes";
}
declare module "game/prototypes/source" {
  export type { Source } from "game/prototypes";
  export { Source } from "game/prototypes";
}
declare module "game/prototypes/resource" {
  export type { Resource } from "game/prototypes";
  export { Resource } from "game/prototypes";
}
declare module "game/prototypes/construction-site" {
  export type { ConstructionSite } from "game/prototypes";
  export { ConstructionSite } from "game/prototypes";
}
declare module "game/prototypes/flag" {
  export type { Flag } from "game/prototypes";
  export { Flag } from "game/prototypes";
}
