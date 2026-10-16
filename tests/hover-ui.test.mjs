import test from "node:test";
import assert from "node:assert/strict";
import { canShowHealth, severityFor, TokenHealthHover } from "../scripts/hover-ui.js";
import { getWoDHealth } from "../scripts/health-model.js";

function makeActor(damage = { bashing: 2, lethal: 1, aggravated: 1 }) {
  const health = Object.fromEntries(["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"]
    .map(level => [level, { total: 1, label: `wod.health.${level}` }]));
  health.damage = { bashing: 0, lethal: 0, aggravated: 0, ...damage };
  return { id: "actor-1", type: "PC", system: { settings: { splat: "mage" }, health } };
}

function makeHarness() {
  let node = null;
  let nextFrame = 0;
  const frames = new Map();
  let mode = "descriptive";
  const canvas = {
    ready: true,
    scene: { id: "scene-1" },
    clientCoordinatesFromCanvas: p => ({ x: p.x * 2 + 40, y: p.y * 2 + 20 })
  };
  const game = {
    user: { isGM: false },
    settings: { get: (id, key) => {
      assert.equal(id, "stl-wod20-health-estimate");
      assert.equal(key, "displayMode");
      return mode;
    } },
    i18n: { localize: text => text }
  };
  const doc = {
    getElementById: id => node?.id === id ? node : null,
    createElement(tag) {
      assert.equal(tag, "div");
      return {
        hidden: false, dataset: {}, style: {}, offsetWidth: 300, offsetHeight: 34,
        setAttribute(name, value) { this[name] = value; },
        remove() { node = null; }
      };
    },
    body: { appendChild(element) { node = element; } }
  };
  const ui = new TokenHealthHover({
    getCanvas: () => canvas, getGame: () => game, document: doc,
    viewport: () => ({ width: 1000, height: 700 }),
    requestFrame(cb) { const id = ++nextFrame; frames.set(id, cb); return id; },
    cancelFrame(id) { frames.delete(id); }
  });
  function makeToken(actor = makeActor()) {
    return {
      actor, isVisible: true, bounds: { x: 200, y: 200, width: 80, height: 80 },
      document: { id: "token-1", hidden: false, parent: { id: "scene-1" } }
    };
  }
  return {
    ui, canvas, game, makeToken, get node() { return node; },
    get frameCount() { return frames.size; },
    setMode(next) { mode = next; },
    runFrame() { const [id, cb] = frames.entries().next().value; frames.delete(id); cb(); }
  };
}

test("health is visible only for current visible non-preview token", () => {
  const h = makeHarness();
  const token = h.makeToken();
  assert.equal(canShowHealth(token, h.canvas, h.game.user), true);
  token.isVisible = false;
  assert.equal(canShowHealth(token, h.canvas, h.game.user), false);
  token.isVisible = true;
  token.document.hidden = true;
  assert.equal(canShowHealth(token, h.canvas, h.game.user), false);
  assert.equal(canShowHealth(token, h.canvas, { isGM: true }), true);
  token.document.hidden = false;
  token.isPreview = true;
  assert.equal(canShowHealth(token, h.canvas, h.game.user), false);
  token.isPreview = false;
  token.document.parent.id = "scene-2";
  assert.equal(canShowHealth(token, h.canvas, h.game.user), false);
  token.document.parent.id = "scene-1";
  token.destroyed = true;
  assert.equal(canShowHealth(token, h.canvas, h.game.user), false);
  token.destroyed = false;
  h.canvas.ready = false;
  assert.equal(canShowHealth(token, h.canvas, h.game.user), false);
});

test("standalone hover renders five modes without Health Estimate", () => {
  const h = makeHarness();
  const token = h.makeToken();
  h.ui.hover(token, true);
  assert.equal(h.node.textContent, "Wounded · battered, bleeding, and grievously hurt");
  assert.equal(h.node.dataset.severity, "wounded");
  assert.equal(h.node.hidden, false);
  assert.equal(h.frameCount, 1);
  for (const [mode, text] of [
    ["abstract", "Seriously injured"],
    ["bar", "Wounded · [▰▰▰▱▱▱▱]"],
    ["track", "Wounded · [ALBB···]"],
    ["detailed", "Wounded · 2B · 1L · 1A"]
  ]) {
    h.setMode(mode);
    h.ui.refresh();
    assert.equal(h.node.textContent, text);
    assert.equal(h.frameCount, 1, "must not start duplicate position loops");
  }
  assert.equal(h.node.style.left, "520px");
  assert.equal(h.node.style.top, "410px");
  assert.equal(h.node.style.transform, "translate(-50%, -100%)");
  h.ui.hover(token, false);
  assert.equal(h.node.hidden, true);
  assert.equal(h.frameCount, 0);
});

test("position follows pan/zoom or movement and avoids the viewport edge", () => {
  const h = makeHarness();
  const token = h.makeToken();
  h.ui.hover(token, true);
  h.canvas.clientCoordinatesFromCanvas = p => ({ x: p.x + 5, y: p.y + 5 });
  h.runFrame();
  assert.equal(h.node.style.left, "245px");
  token.bounds = { x: -80, y: 4, width: 100, height: 80 };
  h.runFrame();
  assert.equal(h.node.hidden, true, "hide rather than sticking at edge when token pans offscreen");
  token.bounds = { x: 0, y: 3, width: 30, height: 30 };
  h.runFrame();
  assert.equal(h.node.hidden, false);
  assert.equal(h.node.style.left, "158px", "tooltip clamped inside viewport");
  assert.equal(h.node.style.transform, "translate(-50%, 0)", "flip label when no top space");
  h.ui.hide();
  assert.equal(h.frameCount, 0);
});

test("unknown track, hidden token, and teardown remove current hover", () => {
  const h = makeHarness();
  const good = h.makeToken();
  h.ui.hover(good, true);
  const other = h.makeToken();
  h.ui.hover(other, false);
  assert.equal(h.node.hidden, false, "hover-out for unrelated token cannot hide current tooltip");
  good.actor.system.health.damage.lethal = "unavailable";
  h.ui.refresh();
  assert.equal(h.node.hidden, true);
  assert.equal(h.frameCount, 0);
  const hidden = h.makeToken();
  hidden.isVisible = false;
  h.ui.hover(hidden, true);
  assert.equal(h.node.hidden, true);
  assert.equal(h.ui.token, null);
  const unsupported = h.makeToken({ type: "Changeling", system: {} });
  h.ui.hover(unsupported, true);
  assert.equal(h.node.hidden, true);
  h.ui.hover(good, true);
  h.ui.destroy();
  assert.equal(h.node, null);
});

test("damage changed while hovered updates without actor mutation", () => {
  const h = makeHarness();
  const token = h.makeToken();
  const healthRef = token.actor.system.health;
  h.ui.hover(token, true);
  token.actor.system.health.damage.bashing = 0;
  token.actor.system.health.damage.lethal = 0;
  token.actor.system.health.damage.aggravated = 0;
  h.ui.refresh();
  assert.equal(h.node.textContent, "Uninjured");
  assert.equal(h.node.dataset.severity, "healthy");
  assert.equal(token.actor.system.health, healthRef);
});

test("severity cues never classify incapacitation as death", () => {
  const actor = makeActor({ bashing: 0, lethal: 7, aggravated: 0 });
  const health = getWoDHealth(actor);
  assert.equal(health.wound.key, "incapacitated");
  assert.equal(severityFor(health), "critical");
  assert.equal(severityFor(getWoDHealth(makeActor({ bashing: 0, lethal: 0, aggravated: 0 }))), "healthy");
});