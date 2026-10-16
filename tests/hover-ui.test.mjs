import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canShowHealth, TokenHealthHover } from "../scripts/hover-ui.js";
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
  const canvas = {
    ready: true,
    scene: { id: "scene-1" },
    clientCoordinatesFromCanvas: p => ({ x: p.x * 2 + 40, y: p.y * 2 + 20 })
  };
  const game = {
    user: { isGM: false },
    // A persisted pre-v0.2.1 choice cannot turn the damage bar back on.
    settings: { get() { throw new Error("Legacy displayMode must not be read"); } },
    i18n: { localize: text => text }
  };
  const doc = {
    getElementById: id => node?.id === id ? node : null,
    createElement(tag) {
      assert.equal(tag, "div");
      return {
        hidden: false, dataset: {}, style: {}, offsetWidth: 84, offsetHeight: 16,
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
    runFrame() { const [id, cb] = frames.entries().next().value; frames.delete(id); cb(); }
  };
}

test("status shows only on current visible, non-preview token", () => {
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

test("hover contains only the localized wound name, never the damage bar", () => {
  const h = makeHarness();
  const token = h.makeToken();
  h.ui.hover(token, true);
  assert.equal(h.node.textContent, "Wounded");
  assert.equal(h.node.dataset.wound, "wounded");
  assert.equal(h.node.hidden, false);
  assert.equal(h.frameCount, 1);
  assert.equal(h.node.style.left, "520px");
  assert.equal(h.node.style.top, "398px", "status is above the token");
  assert.equal(h.node.style.fontSize, "24px", "status scales up with the magnified token");
  assert.equal(h.node.style.transform, "translateX(-50%)");
  h.ui.refresh();
  assert.equal(h.node.textContent, "Wounded");
  assert.equal(h.frameCount, 1, "only one requestAnimationFrame loop");
  h.ui.hover(token, false);
  assert.equal(h.node.hidden, true);
  assert.equal(h.frameCount, 0);
});

test("position follows canvas pan/zoom and remains above token while scaling with screen size", () => {
  const h = makeHarness();
  const token = h.makeToken();
  h.ui.hover(token, true);
  h.canvas.clientCoordinatesFromCanvas = p => ({ x: p.x + 5, y: p.y + 5 });
  h.runFrame();
  assert.equal(h.node.style.left, "245px");
  assert.equal(h.node.style.top, "183px");
  assert.equal(h.node.style.fontSize, "14px");
  token.bounds = { x: -80, y: 4, width: 100, height: 80 };
  h.runFrame();
  assert.equal(h.node.hidden, true, "hide rather than pinning to viewport edge");
  token.bounds = { x: 0, y: 3, width: 30, height: 30 };
  h.runFrame();
  assert.equal(h.node.hidden, false);
  assert.equal(h.node.style.left, "50px", "clamp narrow label within viewport");
  assert.equal(h.node.style.top, "8px");
  assert.equal(h.node.style.fontSize, "12px", "small tokens still have a readable minimum size");
  token.bounds = { x: 150, y: 640, width: 90, height: 50 };
  h.runFrame();
  assert.equal(h.node.style.top, "623px", "status stays above the token near the viewport bottom");
  assert.equal(h.node.style.fontSize, "12px");
  h.ui.hide();
  assert.equal(h.frameCount, 0);
});

test("unknown track, hidden token and teardown dismiss the label", () => {
  const h = makeHarness();
  const good = h.makeToken();
  h.ui.hover(good, true);
  const other = h.makeToken();
  h.ui.hover(other, false);
  assert.equal(h.node.hidden, false, "different token's hover-out must not hide current status");
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
  h.ui.destroy();
  assert.equal(h.node, null);
});

test("Actor health update changes wound label and color key without mutation", () => {
  const h = makeHarness();
  const token = h.makeToken();
  const ref = token.actor.system.health;
  h.ui.hover(token, true);
  token.actor.system.health.damage.bashing = 0;
  token.actor.system.health.damage.lethal = 0;
  token.actor.system.health.damage.aggravated = 0;
  h.ui.refresh();
  assert.equal(h.node.textContent, "Uninjured");
  assert.equal(h.node.dataset.wound, "uninjured");
  assert.equal(token.actor.system.health, ref);
  token.actor.system.health.damage.lethal = 7;
  h.ui.refresh();
  assert.equal(h.node.textContent, "Incapacitated", "not automatically Dead");
  assert.equal(h.node.dataset.wound, "incapacitated");
});

test("status color follows each WoD wound level, with no filled tooltip style", () => {
  const css = readFileSync(new URL("../styles/hover.css", import.meta.url), "utf-8");
  const keys = ["uninjured", "bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"];
  for (const key of keys) {
    assert.match(css, new RegExp(`\\[data-wound="${key}"\\] \\{ color: #[0-9a-f]{6}; \\}`), `missing colored ${key} status`);
  }
  assert.match(css, /background:\s*transparent/);
  assert.match(css, /box-shadow:\s*none/);
  assert.match(css, /border:\s*0/);
  assert.match(css, /font:\s*600 12px/);
  assert.match(css, /transform-origin:\s*center bottom/);
  const h = makeHarness();
  const token = h.makeToken();
  for (let damage = 0; damage <= 7; damage++) {
    token.actor.system.health.damage = { bashing: damage, lethal: 0, aggravated: 0 };
    h.ui.hover(token, true);
    assert.equal(h.node.dataset.wound, getWoDHealth(token.actor).wound.key);
    assert.equal(h.node.textContent.includes("·"), false);
    assert.equal(h.node.textContent.includes("["), false);
  }
});

test("dangerous custom wound labels are inserted as text, never HTML", () => {
  const h = makeHarness();
  const actor = makeActor({ bashing: 1, lethal: 0, aggravated: 0 });
  actor.system.health.bruised.label = "<script>alert('x')</script>";
  h.ui.hover(h.makeToken(actor), true);
  assert.equal(h.node.textContent, "<script>alert('x')</script>");
});

test("tokens with zero-sized bounds cannot render a stale label", () => {
  const h = makeHarness();
  const token = h.makeToken();
  h.ui.hover(token, true);
  token.bounds.width = 0;
  h.runFrame();
  assert.equal(h.node.hidden, true);
  assert.equal(h.frameCount, 0);
});