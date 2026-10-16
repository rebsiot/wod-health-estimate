import test from "node:test";
import assert from "node:assert/strict";

// These tests model the publicly inspected Health Estimate contract; they
// are mocks, NOT proof of compatibility in a live Foundry v14 browser.
function makeActor(b = 2, l = 1, a = 1) {
  const h = Object.fromEntries(["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"]
    .map(level => [level, { total: 1, label: `wod.health.${level}` }]));
  h.damage = { bashing: b, lethal: l, aggravated: a };
  return { id: "test", type: "PC", system: { settings: { splat: "mage" }, health: h } };
}

function makeToken(actor, opts = {}) {
  const flags = { ...opts };
  return {
    actor, combatant: { defeated: false },
    document: { getFlag(_scope, key) { return flags[key] ?? false; } }
  };
}

globalThis.game = {
  settings: { get(_id, key) { return key === "displayMode" ? "descriptive" : null; } },
  i18n: { localize(key) { return key; } }
};

const oneShotHooks = new Map();
const eventHooks = new Map();
globalThis.Hooks = {
  once(event, fn) { oneShotHooks.set(event, fn); },
  on(event, fn) { eventHooks.set(event, fn); }
};
const { integrateHealthEstimate } = await import("../scripts/main.js");

test("adapter integrates idempotently and retains estimated colors", () => {
  const he = {
    provider: { fraction: () => 0.6, tokenEffects: () => false },
    showDead: true,
    getEstimation: () => ({ desc: "Hurt", color: "#abcdef", stroke: "#123456" }),
    isDead: () => true,
    hideEstimate: () => false
  };
  assert.equal(integrateHealthEstimate(he), true);
  assert.equal(integrateHealthEstimate(he), false);
  const token = makeToken(makeActor());
  assert.equal(he.provider.fraction(token), 3 / 7);
  assert.deepEqual(he.getEstimation(token), {
    desc: "Wounded · battered, bleeding, and grievously hurt",
    color: "#abcdef", stroke: "#123456"
  });
  assert.equal(he.isDead(token, 0), false, "Incapacitation must not auto-mean death");
  token.combatant.defeated = true;
  assert.equal(he.isDead(token, 0), true, "Explicit combat defeat must still count");
  assert.equal(he.getEstimation(token).desc, "Hurt", "Respect existing explicit death label output");
});

test("health overlay respects Hide Estimate and empty Health Estimate text", () => {
  const he = {
    provider: { fraction: () => 1 }, showDead: false,
    getEstimation: () => ({ desc: "Original", color: "#fff", stroke: "#000" }),
    hideEstimate: () => true,
    isDead: () => false
  };
  integrateHealthEstimate(he);
  assert.equal(he.getEstimation(makeToken(makeActor())).desc, "Original");
  const blankHe = {
    provider: { fraction: () => 1 }, showDead: false,
    getEstimation: () => ({ desc: "", color: "#fff", stroke: "#000" }),
    hideEstimate: () => false,
    isDead: () => false
  };
  integrateHealthEstimate(blankHe);
  assert.equal(blankHe.getEstimation(makeToken(makeActor())).desc, "");
});

test("unsupported actor data delegates to Health Estimate", () => {
  const he = {
    provider: { fraction: () => 0.33 }, showDead: true,
    getEstimation: () => ({ desc: "Default", color: "#fff", stroke: "#000" }),
    hideEstimate: () => false,
    isDead: () => true
  };
  integrateHealthEstimate(he);
  const token = makeToken({ system: {}, type: "Monster" });
  assert.equal(he.provider.fraction(token), 0.33);
  assert.equal(he.getEstimation(token).desc, "Default");
  assert.equal(he.isDead(token, 0), true);
});

test("explicit Health Estimate dead flag is not overwritten", () => {
  const he = {
    provider: { fraction: () => 1, tokenEffects: () => false }, showDead: true,
    getEstimation: () => ({ desc: "Dead", color: "#red", stroke: "#000" }),
    hideEstimate: () => false,
    isDead: () => false
  };
  integrateHealthEstimate(he);
  const token = makeToken(makeActor(), {dead:true});
  assert.equal(he.isDead(token, 0), true);
  assert.equal(he.getEstimation(token).desc, "Dead");
});


test("Foundry startup hooks register client mode and refresh only on health changes", () => {
  let refreshes = 0;
  const actor = makeActor();
  const token = makeToken(actor);
  token.refresh = () => refreshes++;
  globalThis.canvas = { tokens: { placeables: [token] } };
  globalThis.foundry = { utils: { flattenObject: update => update } };
  globalThis.game.system = { id: "worldofdarkness" };
  globalThis.game.modules = new Map([["healthEstimate", { active: true }]]);
  const settings = new Map();
  globalThis.game.settings.register = (id, key, config) => settings.set(`${id}:${key}`, config);
  globalThis.game.healthEstimate = {
    provider: { fraction: () => 1, tokenEffects: () => false },
    getEstimation: () => ({ desc: "healthy", color: "#fff", stroke: "#111" }),
    isDead: () => false, hideEstimate: () => false, showDead: true
  };
  oneShotHooks.get("init")();
  const styleSetting = settings.get("stl-wod20-health-estimate:displayMode");
  assert.equal(styleSetting.scope, "client");
  assert.equal(styleSetting.default, "descriptive");
  assert.deepEqual(Object.keys(styleSetting.choices), ["descriptive", "abstract", "bar", "track", "detailed"]);
  oneShotHooks.get("ready")();
  assert.equal(game.healthEstimate.__stlWoD20Integrated, true);
  assert.equal(refreshes, 1, "ready refreshes a hovered token");
  styleSetting.onChange("track");
  assert.equal(refreshes, 2, "changing display mode refreshes tokens");
  eventHooks.get("updateActor")(actor, { "system.bio.name": "Changed" });
  assert.equal(refreshes, 2, "non-health update does not trigger refresh");
  eventHooks.get("updateActor")(actor, { "system.health.damage.lethal": 2 });
  assert.equal(refreshes, 3, "health update triggers refresh");
});