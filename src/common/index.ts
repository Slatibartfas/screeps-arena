import { getTicks } from "game/utils";

export { CombatTracker } from "./combatTracker";

export function isFirstTick(): boolean {
  return getTicks() === 1;
}
