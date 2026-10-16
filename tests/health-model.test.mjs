import test from "node:test";
import assert from "node:assert/strict";
import { getWoDHealth, formatWoDHealth } from "../scripts/health-model.js";

function actor({ damage = {}, type = "PC", splat = "mage", extraBruised = 0, traitMax = 7 } = {}) {
  const levels = ["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"];
  return {
    id: "testactor", type,
    system: {
      settings: { splat },
      traits: { health: { totalhealthlevels: { max: traitMax, value: 7 } } },
      health: {
        damage: { bashing: 0, lethal: 0, aggravated: 0, ...damage },
        ...Object.fromEntries(levels.map(l => [l, { total: l === "bruised" ? 1 + extraBruised : 1, label: `wod.health.${l}` }]))
      }
    }
  };
}

test("healthy Mage with correct fraction and label", () => {
  const hp = getWoDHealth(actor());
  assert.equal(hp.totalDamage, 0);
  assert.equal(hp.fraction, 1);
  assert.equal(formatWoDHealth(hp, "descriptive"), "Uninjured");
  assert.equal(formatWoDHealth(hp, "abstract"), "Uninjured");
});

test("M20/V20 wound levels follow native track boundaries", () => {
  assert.equal(getWoDHealth(actor({ damage: { bashing: 1 } })).wound.key, "bruised");
  assert.equal(getWoDHealth(actor({ damage: { bashing: 2 } })).wound.key, "hurt");
  assert.equal(getWoDHealth(actor({ damage: { bashing: 3 } })).wound.key, "injured");
  assert.equal(getWoDHealth(actor({ damage: { bashing: 4 } })).wound.key, "wounded");
  assert.equal(getWoDHealth(actor({ damage: { bashing: 5 } })).wound.key, "mauled");
  assert.equal(getWoDHealth(actor({ damage: { bashing: 6 } })).wound.key, "crippled");
  assert.equal(getWoDHealth(actor({ damage: { bashing: 7 } })).wound.key, "incapacitated");
});

test("mixed damage has descriptive, abstract, bar, track and detailed displays", () => {
  const hp = getWoDHealth(actor({ damage: { bashing: 2, lethal: 1, aggravated: 1 } }));
  assert.equal(hp.fraction, 3 / 7);
  assert.equal(formatWoDHealth(hp, "descriptive"), "Wounded · battered, bleeding, and grievously hurt");
  assert.equal(formatWoDHealth(hp, "abstract"), "Seriously injured");
  assert.equal(formatWoDHealth(hp, "bar"), "Wounded · [▰▰▰▱▱▱▱]");
  assert.equal(formatWoDHealth(hp, "track"), "Wounded · [ALBB···]");
  assert.equal(formatWoDHealth(hp, "detailed"), "Wounded · 2B · 1L · 1A");
});

test("single damage type uses narrative rather than exact damage values", () => {
  const hp = getWoDHealth(actor({ damage: { aggravated: 2 } }));
  assert.equal(formatWoDHealth(hp, "descriptive"), "Hurt · grievously hurt");
  assert.equal(formatWoDHealth(hp, "track"), "Hurt · [AA·····]");
  assert.equal(formatWoDHealth(hp, "detailed"), "Hurt · 2A");
});

test("complete track is incapacitated, not declared dead", () => {
  const hp = getWoDHealth(actor({ splat: "vampire", damage: { lethal: 7 } }));
  assert.equal(hp.remaining, 0);
  assert.equal(hp.fraction, 0);
  assert.equal(formatWoDHealth(hp, "abstract"), "Incapacitated");
  assert.equal(formatWoDHealth(hp, "bar"), "Incapacitated · [▱▱▱▱▱▱▱]");
});

test("excess damage never makes the fraction negative", () => {
  const hp = getWoDHealth(actor({ damage: { bashing: 9, aggravated: 2 } }));
  assert.equal(hp.totalDamage, 11);
  assert.equal(hp.applied, 7);
  assert.equal(hp.fraction, 0);
  assert.equal(hp.wound.key, "incapacitated");
});

test("extended health tracks sum real levels rather than stale traits max", () => {
  const a = actor({ extraBruised: 2, traitMax: 7, damage: { bashing: 2 } });
  const hp = getWoDHealth(a);
  assert.equal(hp.max, 9);
  assert.equal(hp.remaining, 7);
  assert.equal(hp.wound.key, "bruised");
  assert.equal(formatWoDHealth(hp, "track"), "Bruised · [BB·······]");
  assert.equal(getWoDHealth(actor({extraBruised: 2, damage: { bashing: 4 }})).wound.key,"hurt");
});

test("custom level labels localize if possible", () => {
  const a = actor({ damage: { bashing: 2 } });
  a.system.health.hurt.label = "wod.health.hurt";
  assert.equal(formatWoDHealth(getWoDHealth(a), "descriptive", k => k === "wod.health.hurt" ? "Beaten" : k), "Beaten · battered");
});

test("missing health / unsupported alternate splats do not get fabricated estimates", () => {
  assert.equal(getWoDHealth({ system: {} }), null);
  assert.equal(getWoDHealth(actor({ splat: "wraith" })), null);
  assert.equal(getWoDHealth(actor({ splat: "changeling" })), null);
  assert.equal(getWoDHealth(actor({ type: "Wraith" })), null);
  const a = actor();
  a.system.settings.usechimerical = true;
  assert.equal(getWoDHealth(a), null);
});

test("invalid and nonpositive boxes do not crash or leak fractions", () => {
  const a = actor();
  a.system.health.damage.lethal = "unknown";
  assert.equal(getWoDHealth(a), null);
  const b = actor();
  for (const level of ["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"])
    b.system.health[level].total = 0;
  assert.equal(getWoDHealth(b), null);
});

test("sixteen-box hover visual is capped", () => {
  const hp = getWoDHealth(actor({ extraBruised: 20, damage: { lethal: 18 } }));
  assert.ok(formatWoDHealth(hp, "track").endsWith("…"));
  assert.ok(formatWoDHealth(hp, "bar").endsWith("…"));
});


test("status-only formatter returns wound name without bars or counts", () => {
  for (let n = 0; n <= 7; n++) {
    const h = getWoDHealth(actor({ damage: { bashing: n } }));
    const status = formatWoDHealth(h);
    assert.equal(status, h.wound.fallback);
    assert.ok(!status.includes("·"));
    assert.ok(!status.includes("["));
  }
  const h = getWoDHealth(actor({ damage: { bashing: 2 } }));
  assert.equal(formatWoDHealth(h, "status", k => k === "wod.health.hurt" ? "Battered" : k), "Battered");
});