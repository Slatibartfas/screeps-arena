export type CombatSide = "my" | "enemy" | "neutral";

export interface CombatSnapshot {
  id: string;
  my?: boolean;
  exists?: boolean;
  hits?: number;
  hitsMax?: number;
}

export interface CombatTickDelta {
  tick?: number;
  damageToMy: number;
  damageToEnemy: number;
  myDeaths: number;
  enemyDeaths: number;
}

export interface CombatTotals extends CombatTickDelta {
  ticksTracked: number;
}

interface PrevState {
  my?: boolean;
  exists: boolean;
  hits?: number;
}

export class CombatTracker {
  private readonly prevById = new Map<string, PrevState>();
  private totals: CombatTotals = {
    ticksTracked: 0,
    damageToMy: 0,
    damageToEnemy: 0,
    myDeaths: 0,
    enemyDeaths: 0
  };

  public tick(objects: readonly CombatSnapshot[], tick?: number): CombatTickDelta {
    const seenIds = new Set<string>();

    let damageToMy = 0;
    let damageToEnemy = 0;
    let myDeaths = 0;
    let enemyDeaths = 0;

    for (const obj of objects) {
      if (!obj?.id) continue;

      const exists = obj.exists !== false;
      seenIds.add(obj.id);

      const prev = this.prevById.get(obj.id);
      if (prev && prev.exists && exists && typeof prev.hits === "number" && typeof obj.hits === "number") {
        const hitsDelta = prev.hits - obj.hits;
        if (hitsDelta > 0) {
          if (obj.my) damageToMy += hitsDelta;
          else if (obj.my === false) damageToEnemy += hitsDelta;
        }
      }

      this.prevById.set(obj.id, { my: obj.my, exists, hits: obj.hits });
    }

    for (const [id, prev] of this.prevById) {
      if (!prev.exists) continue;
      if (seenIds.has(id)) continue;

      if (prev.my) myDeaths += 1;
      else if (prev.my === false) enemyDeaths += 1;

      this.prevById.set(id, { ...prev, exists: false });
    }

    const delta: CombatTickDelta = { tick, damageToMy, damageToEnemy, myDeaths, enemyDeaths };

    this.totals = {
      tick,
      ticksTracked: this.totals.ticksTracked + 1,
      damageToMy: this.totals.damageToMy + damageToMy,
      damageToEnemy: this.totals.damageToEnemy + damageToEnemy,
      myDeaths: this.totals.myDeaths + myDeaths,
      enemyDeaths: this.totals.enemyDeaths + enemyDeaths
    };

    return delta;
  }

  public getTotals(): CombatTotals {
    return this.totals;
  }

  public reset(): void {
    this.prevById.clear();
    this.totals = {
      ticksTracked: 0,
      damageToMy: 0,
      damageToEnemy: 0,
      myDeaths: 0,
      enemyDeaths: 0
    };
  }
}
