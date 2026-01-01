import { expect } from "chai";

import { CombatTracker } from "../../src/common/combatTracker";

describe("CombatTracker", () => {
  it("tracks damage deltas by side", () => {
    const tracker = new CombatTracker();

    tracker.tick([
      { id: "a", my: true, hits: 100 },
      { id: "b", my: false, hits: 100 }
    ]);

    const delta = tracker.tick([
      { id: "a", my: true, hits: 80 },
      { id: "b", my: false, hits: 90 }
    ]);

    expect(delta.damageToMy).to.equal(20);
    expect(delta.damageToEnemy).to.equal(10);
    expect(delta.myDeaths).to.equal(0);
    expect(delta.enemyDeaths).to.equal(0);
  });

  it("counts deaths when objects disappear", () => {
    const tracker = new CombatTracker();

    tracker.tick([
      { id: "a", my: true, hits: 100 },
      { id: "b", my: false, hits: 100 }
    ]);

    const delta = tracker.tick([{ id: "a", my: true, hits: 100 }]);

    expect(delta.myDeaths).to.equal(0);
    expect(delta.enemyDeaths).to.equal(1);
  });
});
