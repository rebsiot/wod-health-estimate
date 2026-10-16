import test from "node:test";
import assert from "node:assert/strict";

// Simulated Foundry hooks: checks the public API wiring but is not live testing.
const once = new Map();
const events = new Map();
const settings = new Map();
const frameCallbacks = new Map();
let nextId = 0;
let overlay;
const actor = {
  id: "a-1", system: {
    settings: { splat: "vampire" },
    health: {
      damage: { bashing: 0, lethal: 0, aggravated: 0 },
      ...Object.fromEntries(["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"]
        .map(level => [level, { total: 1, label: `wod.health.${level}` }]))
    }
  }
};
const token = {
  actor, isVisible: true, bounds: { x: 200, y: 200, width: 100, height: 100 },
  document: { id: "t-1", parent: { id: "scene-1" } }
};

globalThis.Hooks = {
  once(event, fn) { once.set(event, fn); },
  on(event, fn) { events.set(event, fn); }
};
globalThis.canvas = {
  ready: true, scene: { id: "scene-1" },
  clientCoordinatesFromCanvas: ({ x, y }) => ({ x, y })
};
globalThis.game = {
  system: { id: "worldofdarkness" }, user: { isGM: true },
  modules: new Map(),
  i18n: { localize: k => k },
  settings: {
    register: (id, key, config) => settings.set(`${id}:${key}`, config),
    get: () => "descriptive"
  }
};
globalThis.document = {
  getElementById: () => overlay,
  createElement() {
    return {
      style: {}, dataset: {}, hidden: false, offsetWidth: 200, offsetHeight: 35,
      setAttribute() {}, remove() { overlay = null; }
    };
  },
  body: { appendChild(node) { overlay = node; } }
};
globalThis.window = {
  innerWidth: 1200, innerHeight: 800,
  requestAnimationFrame(fn) { const id = ++nextId; frameCallbacks.set(id, fn); return id; },
  cancelAnimationFrame(id) { frameCallbacks.delete(id); }
};
await import("../scripts/main.js");

test("init preserves per-client display mode key and five choices", () => {
  once.get("init")();
  const setting = settings.get("stl-wod20-health-estimate:displayMode");
  assert.equal(setting.scope, "client");
  assert.equal(setting.default, "descriptive");
  assert.deepEqual(Object.keys(setting.choices), ["descriptive", "abstract", "bar", "track", "detailed"]);
});

test("ready registers native events and renders without Health Estimate installed", () => {
  once.get("ready")();
  for (const event of ["hoverToken", "updateActor", "updateToken", "refreshToken", "deleteToken", "canvasTearDown"]) {
    assert.equal(typeof events.get(event), "function", `missing ${event}`);
  }
  events.get("hoverToken")(token, true);
  assert.equal(overlay.textContent, "Uninjured");
  actor.system.health.damage.lethal = 1;
  events.get("updateActor")(actor);
  assert.equal(overlay.textContent, "Bruised · bleeding");
  settings.get("stl-wod20-health-estimate:displayMode").onChange("detailed");
  assert.equal(overlay.textContent, "Bruised · bleeding", "current mock setting is still descriptive");
  events.get("canvasTearDown")();
  assert.equal(overlay.hidden, true);
  assert.equal(frameCallbacks.size, 0);
});

test("updateToken refreshes synthetic actor and deletion dismisses tooltip", () => {
  events.get("hoverToken")(token, true);
  actor.system.health.damage.aggravated = 1;
  events.get("updateToken")(token.document);
  assert.equal(overlay.textContent, "Hurt · bleeding and grievously hurt");
  events.get("deleteToken")(token.document);
  assert.equal(overlay.hidden, true);
});

test("non-worldofdarkness system leaves hover inactive", () => {
  game.system.id = "dnd5e";
  events.clear();
  settings.clear();
  once.get("init")();
  once.get("ready")();
  assert.equal(events.size, 0);
  assert.equal(settings.size, 0);
});