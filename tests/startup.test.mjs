import test from "node:test";
import assert from "node:assert/strict";

// Simulated Foundry hooks: checks event wiring, not a live Foundry session.
const once = new Map();
const events = new Map();
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
  settings: { register() { throw new Error("Display-style control should be gone"); },
    get() { throw new Error("Legacy display-mode key should not be read"); } }
};
globalThis.document = {
  getElementById: () => overlay,
  createElement() {
    return {
      style: {}, dataset: {}, hidden: false, offsetWidth: 84, offsetHeight: 16,
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

test("status-only module does not register unnecessary display controls", () => {
  assert.equal(once.has("init"), false);
  assert.equal(typeof once.get("ready"), "function");
});

test("ready registers native hooks and renders without Health Estimate", () => {
  once.get("ready")();
  for (const event of ["hoverToken", "updateActor", "updateToken", "refreshToken", "deleteToken", "canvasTearDown"]) {
    assert.equal(typeof events.get(event), "function", `missing ${event}`);
  }
  events.get("hoverToken")(token, true);
  assert.equal(overlay.textContent, "Uninjured");
  assert.equal(overlay.dataset.wound, "uninjured");
  actor.system.health.damage.lethal = 1;
  events.get("updateActor")(actor);
  assert.equal(overlay.textContent, "Bruised");
  assert.equal(overlay.dataset.wound, "bruised");
  events.get("canvasTearDown")();
  assert.equal(overlay.hidden, true);
  assert.equal(frameCallbacks.size, 0);
});

test("updateToken refreshes unlinked token and deletion dismisses status", () => {
  events.get("hoverToken")(token, true);
  actor.system.health.damage.aggravated = 1;
  events.get("updateToken")(token.document);
  assert.equal(overlay.textContent, "Hurt");
  events.get("deleteToken")(token.document);
  assert.equal(overlay.hidden, true);
});

test("non-WoD20 system leaves the hover module inactive", () => {
  game.system.id = "dnd5e";
  events.clear();
  once.get("ready")();
  assert.equal(events.size, 0);
});