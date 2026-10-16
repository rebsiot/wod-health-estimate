import { TokenHealthHover } from "./hover-ui.js";

const ID = "stl-wod20-health-estimate";

const DISPLAY_CHOICES = {
  descriptive: "Descriptive: wound level and narrative injuries",
  abstract: "Abstract: broad condition only",
  bar: "Health bar: remaining boxes, no damage types",
  track: "Damage track: Bashing / Lethal / Aggravated symbols",
  detailed: "Detailed: wound level and exact damage counts"
};

let hoverUI;

Hooks.once("init", () => {
  if (game.system?.id !== "worldofdarkness") return;
  game.settings.register(ID, "displayMode", {
    name: "WoD20 Injury Hover: Display Style",
    hint: "Choose what token hovering displays to you. B=Bashing, L=Lethal, A=Aggravated. The damage track uses letters for damaged boxes and dots for empty boxes.",
    scope: "client",
    config: true,
    type: String,
    choices: DISPLAY_CHOICES,
    default: "descriptive",
    onChange: () => hoverUI?.refresh()
  });
});

Hooks.once("ready", () => {
  if (game.system?.id !== "worldofdarkness") return;

  hoverUI = new TokenHealthHover({
    getCanvas: () => canvas,
    getGame: () => game,
    document,
    viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
    requestFrame: cb => window.requestAnimationFrame(cb),
    cancelFrame: id => window.cancelAnimationFrame(id)
  });

  Hooks.on("hoverToken", (token, hovered) => hoverUI.hover(token, hovered));
  Hooks.on("refreshToken", token => {
    if (token === hoverUI.token) hoverUI.refresh();
  });
  Hooks.on("updateToken", doc => {
    if (doc?.id === hoverUI.token?.document?.id
      && doc?.parent?.id === hoverUI.token?.document?.parent?.id) hoverUI.refresh();
  });
  Hooks.on("updateActor", actor => {
    if (actor?.id && actor.id === hoverUI.token?.actor?.id) hoverUI.refresh();
  });
  Hooks.on("deleteToken", doc => {
    if (doc?.id === hoverUI.token?.document?.id
      && doc?.parent?.id === hoverUI.token?.document?.parent?.id) hoverUI.hide();
  });
  Hooks.on("canvasTearDown", () => hoverUI.hide());

  if (game.modules.get("healthEstimate")?.active) {
    console.warn(`${ID} | Health Estimate is also active; disable it in Manage Modules if duplicate hover labels appear.`);
  }
  console.info(`${ID} | Standalone WoD20 health hover ready (no Health Estimate dependency).`);
});