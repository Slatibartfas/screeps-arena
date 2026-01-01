import { constants, prototypes, utils } from "game";
import { Creep, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import type { BodyPartConstant } from "game/constants";

// Module-scoped state for structure placement and creep management
const creepRoles = new Map<string, "harvester" | "melee" | "ranged" | "healer">();

export function loop(): void {
  // Collect game objects once per tick and reuse
  const myCreeps = utils.getObjectsByPrototype(prototypes.Creep).filter((c): c is Creep => c.my === true);
  const mySpawn = utils
    .getObjectsByPrototype(prototypes.StructureSpawn)
    .find((s): s is StructureSpawn => s.my === true);
  const containers = utils
    .getObjectsByPrototype(prototypes.StructureContainer)
    .filter((c): c is StructureContainer => c.my === true);

  // No construction sites used in this simplified aggressive strategy
  const enemies = utils.getObjectsByPrototype(prototypes.Creep).filter((c): c is Creep => c.my === false);
  const sources = utils.getObjectsByPrototype(prototypes.Source);
  const source = sources[0] as Source | undefined;

  // Maintain creep roles and clean up dead creeps
  for (const creep of myCreeps) {
    if (!creepRoles.has(creep.id)) {
      assignCreepRole(creep);
    }
  }
  for (const id of creepRoles.keys()) {
    if (!myCreeps.some(c => c.id === id)) {
      creepRoles.delete(id);
    }
  }

  const harvesters = myCreeps.filter(c => creepRoles.get(c.id) === "harvester");
  const meleeAttackers = myCreeps.filter(c => creepRoles.get(c.id) === "melee");
  const rangedAttackers = myCreeps.filter(c => creepRoles.get(c.id) === "ranged");
  const healers = myCreeps.filter(c => creepRoles.get(c.id) === "healer");

  // STAGE 1: Spawn harvesters first (at least 1 required)
  spawnEconomy(mySpawn, harvesters);

  // STAGE 2: Spawn combat creeps only after first harvester exists
  if (harvesters.length > 0) {
    const energy = mySpawn?.store[constants.RESOURCE_ENERGY] ?? 0;
    spawnCombat(mySpawn, energy, meleeAttackers, rangedAttackers, healers);
  }

  // Creep behaviors
  for (const creep of myCreeps) {
    const role = creepRoles.get(creep.id);
    switch (role) {
      case "harvester":
        behaveHarvester(creep, source, containers, mySpawn);
        break;
      case "melee":
        behaveMelee(creep, enemies, mySpawn);
        break;
      case "ranged":
        behaveRanged(creep, enemies, mySpawn);
        break;
      case "healer":
        behaveHealer(creep, myCreeps);
        break;
    }
  }
}

function assignCreepRole(creep: Creep): void {
  const myCreeps = utils.getObjectsByPrototype(prototypes.Creep).filter((c): c is Creep => c.my === true);
  const harvesters = myCreeps.filter(c => creepRoles.get(c.id) === "harvester");

  if (harvesters.length < 2) {
    creepRoles.set(creep.id, "harvester");
  } else {
    // Assign combat roles: 2 melee, 2 ranged, 1 healer
    const melee = myCreeps.filter(c => creepRoles.get(c.id) === "melee");
    const ranged = myCreeps.filter(c => creepRoles.get(c.id) === "ranged");
    const healers = myCreeps.filter(c => creepRoles.get(c.id) === "healer");

    if (melee.length < 2) {
      creepRoles.set(creep.id, "melee");
    } else if (ranged.length < 2) {
      creepRoles.set(creep.id, "ranged");
    } else if (healers.length < 1) {
      creepRoles.set(creep.id, "healer");
    } else {
      // Default to melee
      creepRoles.set(creep.id, "melee");
    }
  }
}

/**
 * Spawn 2 harvesters only for energy collection.
 */
function spawnEconomy(mySpawn: StructureSpawn | undefined, harvesters: Creep[]): void {
  if (!mySpawn) return;

  const energy = mySpawn.store[constants.RESOURCE_ENERGY];

  // Harvester body: 1 work, 1 carry, 1 move = 200 energy
  const harvesterBody: BodyPartConstant[] = [constants.WORK, constants.CARRY, constants.MOVE];

  // Spawn harvesters up to 2
  if (harvesters.length < 2 && energy >= 200) {
    const res = mySpawn.spawnCreep(harvesterBody);
    if (!res.error) {
      console.log(`Spawned harvester (${harvesters.length + 1}/2)`);
      const newCreep = utils.getObjectsByPrototype(prototypes.Creep).find((c): c is Creep => c.id === res.object?.id);
      if (newCreep) {
        assignCreepRole(newCreep);
      }
    }
  }
}

/**
 * Spawn combat creeps aggressively (melee, ranged, healer).
 */
function spawnCombat(
  mySpawn: StructureSpawn | undefined,
  energy: number,
  melee: Creep[],
  ranged: Creep[],
  healers: Creep[]
): void {
  if (!mySpawn || energy < 200) return;

  const bodies: { role: "melee" | "ranged" | "healer"; parts: BodyPartConstant[]; cost: number }[] = [];

  // Melee bodies (costs: 160, 240, 520)
  bodies.push({
    role: "melee",
    parts: [constants.ATTACK, constants.MOVE],
    cost: 130
  });
  bodies.push({
    role: "melee",
    parts: [constants.ATTACK, constants.ATTACK, constants.MOVE],
    cost: 210
  });
  bodies.push({
    role: "melee",
    parts: [constants.ATTACK, constants.ATTACK, constants.ATTACK, constants.ATTACK, constants.MOVE, constants.MOVE],
    cost: 420
  });

  // Ranged bodies (costs: 200, 350)
  bodies.push({
    role: "ranged",
    parts: [constants.RANGED_ATTACK, constants.MOVE],
    cost: 200
  });
  bodies.push({
    role: "ranged",
    parts: [constants.RANGED_ATTACK, constants.RANGED_ATTACK, constants.MOVE],
    cost: 350
  });

  // Healer bodies (cost: 300)
  bodies.push({
    role: "healer",
    parts: [constants.HEAL, constants.MOVE],
    cost: 300
  });

  // Find the largest affordable body for each role type we're below quota on
  const rolesNeedingUnits: ("melee" | "ranged" | "healer")[] = [];
  if (melee.length < 2) rolesNeedingUnits.push("melee");
  if (ranged.length < 2) rolesNeedingUnits.push("ranged");
  if (healers.length < 1) rolesNeedingUnits.push("healer");

  for (const roleNeeded of rolesNeedingUnits) {
    const largestAffordable = bodies
      .filter(b => b.role === roleNeeded)
      .reverse()
      .find(b => energy >= b.cost);

    if (largestAffordable) {
      const res = mySpawn.spawnCreep(largestAffordable.parts);
      if (!res.error) {
        console.log(`Spawned ${roleNeeded}`);
        const newCreep = utils.getObjectsByPrototype(prototypes.Creep).find((c): c is Creep => c.id === res.object?.id);
        if (newCreep) {
          creepRoles.set(newCreep.id, roleNeeded);
        }
      }
      break;
    }
  }
}

/**
 * Harvester: gather energy from source, transfer to spawn.
 */
function behaveHarvester(
  creep: Creep,
  source: Source | undefined,
  containers: StructureContainer[],
  mySpawn: StructureSpawn | undefined
): void {
  if ((creep.store?.getFreeCapacity(constants.RESOURCE_ENERGY) ?? 0) > 0) {
    if (source && creep.harvest(source) === constants.ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }
  } else {
    // Transfer to spawn only (no containers)
    if (mySpawn && creep.transfer(mySpawn, constants.RESOURCE_ENERGY) === constants.ERR_NOT_IN_RANGE) {
      creep.moveTo(mySpawn);
    }
  }
}

/**
 * Melee attacker: find and attack closest enemy.
 */
function behaveMelee(creep: Creep, enemies: Creep[], mySpawn: StructureSpawn | undefined): void {
  const enemy = utils.findClosestByPath(creep, enemies);
  if (enemy) {
    if (creep.attack(enemy) === constants.ERR_NOT_IN_RANGE) {
      creep.moveTo(enemy);
    }
  } else {
    // Idle at spawn
    if (mySpawn) creep.moveTo(mySpawn);
  }
}

/**
 * Ranged attacker: attack from range, maintain distance.
 */
function behaveRanged(creep: Creep, enemies: Creep[], mySpawn: StructureSpawn | undefined): void {
  const enemy = utils.findClosestByPath(creep, enemies);
  if (enemy) {
    if (creep.rangedAttack(enemy) === constants.ERR_NOT_IN_RANGE) {
      creep.moveTo(enemy);
    }
  } else {
    // Idle at spawn
    if (mySpawn) creep.moveTo(mySpawn);
  }
}

/**
 * Healer: heal damaged creeps, prioritize damaged allies.
 */
function behaveHealer(creep: Creep, myCreeps: Creep[]): void {
  const damaged = myCreeps.find(c => c.hits < c.hitsMax && c.id !== creep.id);
  if (damaged) {
    if (creep.heal(damaged) === constants.ERR_NOT_IN_RANGE) {
      creep.moveTo(damaged);
    }
  }
}
