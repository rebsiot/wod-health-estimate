import { formatWoDHealth, getWoDHealth } from "./health-model.js";

const ELEMENT_ID = "stl-wod20-health-estimate-hover";

/** Severity cues are presentation only; wound semantics come from WoD20. */
export function severityFor(health) {
  if (!health?.totalDamage) return "healthy";
  if (health.fraction >= 0.75) return "minor";
  if (health.fraction >= 0.4) return "wounded";
  return "critical";
}

export function canShowHealth(token, canvas, user) {
  if (!canvas?.ready || !token?.actor || token.isPreview || token.destroyed) return false;
  // Foundry v14 Token.isVisible includes hidden tokens and the current
  // viewer's vision. Do not infer visibility from document data alone.
  if (token.isVisible !== true) return false;
  if (token.document?.hidden && !user?.isGM) return false;
  if (canvas.scene?.id && token.document?.parent?.id
    && canvas.scene.id !== token.document.parent.id) return false;
  return true;
}

/**
 * One read-only DOM overlay on the hovered token. Native Foundry v14 APIs:
 * hook hoverToken, Token.bounds, Canvas.clientCoordinatesFromCanvas.
 * No Health Estimate methods, Actor documents, or Token documents are changed.
 */
export class TokenHealthHover {
  constructor({ getCanvas, getGame, document: doc, viewport, requestFrame, cancelFrame }) {
    this.getCanvas = getCanvas;
    this.getGame = getGame;
    this.doc = doc;
    this.viewport = viewport;
    this.requestFrame = requestFrame;
    this.cancelFrame = cancelFrame;
    this.token = null;
    this.node = null;
    this.frame = null;
  }

  ensureNode() {
    if (this.node) return this.node;
    let node = this.doc.getElementById(ELEMENT_ID);
    if (!node) {
      node = this.doc.createElement("div");
      node.id = ELEMENT_ID;
      node.setAttribute("aria-hidden", "true");
      node.hidden = true;
      this.doc.body.appendChild(node);
    }
    this.node = node;
    return node;
  }

  hover(token, hovered) {
    if (hovered) {
      this.token = token;
      this.refresh();
    } else if (token === this.token) {
      this.hide();
    }
  }

  refresh() {
    if (!this.token) return;
    const game = this.getGame();
    if (!canShowHealth(this.token, this.getCanvas(), game?.user)) return this.hide();
    const health = getWoDHealth(this.token.actor);
    if (!health) return this.hide();
    const mode = game.settings.get("stl-wod20-health-estimate", "displayMode");
    const node = this.ensureNode();
    node.textContent = formatWoDHealth(health, mode, game.i18n?.localize?.bind(game.i18n));
    node.dataset.severity = severityFor(health);
    node.hidden = false;
    this.position();
    if (this.token) this.scheduleFrame();
  }

  /** Canvas units to browser viewport coordinates, following panning and zoom. */
  position() {
    if (!this.token || !this.node) return;
    const canvas = this.getCanvas();
    if (!canShowHealth(this.token, canvas, this.getGame()?.user)) return this.hide();
    const bounds = this.token.bounds;
    const width = Number(bounds?.width);
    const x = Number(bounds?.x);
    const y = Number(bounds?.y);
    if (![width, x, y].every(Number.isFinite)
      || typeof canvas.clientCoordinatesFromCanvas !== "function") return this.hide();
    const point = canvas.clientCoordinatesFromCanvas({ x: x + width / 2, y });
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return this.hide();

    const { width: vw, height: vh } = this.viewport();
    if (point.x < 0 || point.x > vw || point.y < 0 || point.y > vh) {
      this.node.hidden = true;
      return;
    }
    const boxWidth = this.node.offsetWidth || 0;
    const boxHeight = this.node.offsetHeight || 0;
    const margin = 8;
    const minX = Math.min(vw / 2, boxWidth / 2 + margin);
    const maxX = Math.max(minX, vw - minX);
    const left = Math.max(minX, Math.min(maxX, point.x));
    const above = point.y - boxHeight - 12 >= margin;
    const top = above ? point.y - 10 : Math.min(point.y + 10, Math.max(0, vh - boxHeight - margin));
    this.node.style.left = `${Math.round(left)}px`;
    this.node.style.top = `${Math.round(top)}px`;
    this.node.style.transform = above ? "translate(-50%, -100%)" : "translate(-50%, 0)";
    this.node.hidden = false;
  }

  scheduleFrame() {
    if (this.frame !== null) return;
    this.frame = this.requestFrame(() => {
      this.frame = null;
      if (!this.token) return;
      this.position();
      if (this.token) this.scheduleFrame();
    });
  }

  hide() {
    this.token = null;
    if (this.frame !== null) this.cancelFrame(this.frame);
    this.frame = null;
    if (this.node) this.node.hidden = true;
  }

  destroy() {
    this.hide();
    this.node?.remove();
    this.node = null;
  }
}