import { formatWoDHealth, getWoDHealth } from "./health-model.js";

const ELEMENT_ID = "stl-wod20-health-estimate-hover";

export function canShowHealth(token, canvas, user) {
  if (!canvas?.ready || !token?.actor || token.isPreview || token.destroyed) return false;
  // Let Foundry v14 handle vision and token ownership visibility.
  if (token.isVisible !== true) return false;
  if (token.document?.hidden && !user?.isGM) return false;
  if (canvas.scene?.id && token.document?.parent?.id
    && canvas.scene.id !== token.document.parent.id) return false;
  return true;
}

/**
 * Read-only native token-hover status. A small DOM label is placed underneath
 * the existing Foundry token nameplate; it does not change PIXI/token state.
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
    const node = this.ensureNode();
    // Status-only regardless of any persisted v0.2.0 displayMode preference.
    node.textContent = formatWoDHealth(health, "status", game?.i18n?.localize?.bind(game.i18n));
    // A fixed set of CSS selectors; never use Actor data as a CSS color value.
    node.dataset.wound = health.wound.key;
    node.hidden = false;
    this.position();
    if (this.token) this.scheduleFrame();
  }

  /** Follow pan/zoom and token motion using Foundry's canvas-to-client API. */
  position() {
    if (!this.token || !this.node) return;
    const canvas = this.getCanvas();
    if (!canShowHealth(this.token, canvas, this.getGame()?.user)) return this.hide();
    const bounds = this.token.bounds;
    const width = Number(bounds?.width);
    const height = Number(bounds?.height);
    const x = Number(bounds?.x);
    const y = Number(bounds?.y);
    if (![width, height, x, y].every(Number.isFinite)
      || width <= 0 || height <= 0
      || typeof canvas.clientCoordinatesFromCanvas !== "function") return this.hide();

    const centerX = x + width / 2;
    const topPoint = canvas.clientCoordinatesFromCanvas({ x: centerX, y });
    const bottomPoint = canvas.clientCoordinatesFromCanvas({ x: centerX, y: y + height });
    if (![topPoint?.x, topPoint?.y, bottomPoint?.x, bottomPoint?.y].every(Number.isFinite)) return this.hide();

    const { width: vw, height: vh } = this.viewport();
    // When the token has panned outside the visible viewport, remove its label.
    if (bottomPoint.x < 0 || bottomPoint.x > vw || bottomPoint.y < 0 || topPoint.y > vh) {
      this.node.hidden = true;
      return;
    }

    const boxWidth = this.node.offsetWidth || 0;
    const boxHeight = this.node.offsetHeight || 16;
    const margin = 8;
    const nameplateGap = 18; // A second line immediately below the native token name.
    const minX = Math.min(vw / 2, boxWidth / 2 + margin);
    const maxX = Math.max(minX, vw - minX);
    const left = Math.max(minX, Math.min(maxX, bottomPoint.x));
    const below = bottomPoint.y + nameplateGap;
    const above = topPoint.y - boxHeight - 6;
    const top = below + boxHeight <= vh - margin
      ? below
      : above >= margin
        ? above
        : Math.max(margin, Math.min(vh - boxHeight - margin, below));

    this.node.style.left = `${Math.round(left)}px`;
    this.node.style.top = `${Math.round(top)}px`;
    this.node.style.transform = "translateX(-50%)";
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