import { formatWoDHealth, getWoDHealth } from "./health-model.js";

const ID = "stl-wod20-health-estimate";

const MODE_CHOICES = {
  descriptive: "Descriptive: wound level and narrative injuries",
  abstract: "Abstract: broad condition only",
  bar: "Health bar: remaining boxes, no damage types",
  track: "Damage track: Bashing / Lethal / Aggravated symbols",
  detailed: "Detailed: wound level and exact damage counts"
};

function refreshTokens() {
  for (const token of canvas?.tokens?.placeables ?? []) token.refresh?.();
}

function hasExplicitDeathMarker(he, token) {
  const doc = token?.document ?? token;
  if (doc?.getFlag?.("healthEstimate", "dead")) return true;
  if (!he.showDead) return false;
  if (token?.combatant?.defeated) return true;
  try {
    return he.provider?.tokenEffects?.(token) === true;
  } catch (_err) {
    return false;
  }
}

/**
 * Integration with the published Health Estimate v35 API. Its normal hover
 * rendering, hidden-token rules, font/position/colors and status controls
 * remain in charge. This module only supplies WoD fraction and text.
 */
export function integrateHealthEstimate(he) {
  if (!he || he.__stlWoD20Integrated) return false;
  if (!he.provider || typeof he.provider.fraction !== "function"
    || typeof he.getEstimation !== "function") return false;

  const originalFraction = he.provider.fraction.bind(he.provider);
  const originalGetEstimation = he.getEstimation.bind(he);
  const originalIsDead = typeof he.isDead === "function" ? he.isDead.bind(he) : () => false;

  he.provider.fraction = function (token) {
    const health = getWoDHealth(token?.actor);
    if (health) return health.fraction;
    return originalFraction(token);
  };

  he.isDead = function (token, stage) {
    // In WoD20 a full wound track is not necessarily death: Kindred may be
    // torpid, and mortals may be incapacitated rather than dead.
    if (getWoDHealth(token?.actor)) return hasExplicitDeathMarker(this, token);
    return originalIsDead(token, stage);
  };

  he.getEstimation = function (token) {
    const estimate = originalGetEstimation(token);
    const health = getWoDHealth(token?.actor);
    if (!health || !estimate || typeof estimate.desc !== "string") return estimate;
    // Do not bypass Health Estimate's hidden-estimate or blank-label behavior.
    if (this.hideEstimate?.(token) || !estimate.desc.trim()) return estimate;
    if (hasExplicitDeathMarker(this, token)) return estimate;
    const mode = game.settings.get(ID, "displayMode");
    return {
      ...estimate,
      desc: formatWoDHealth(health, mode, game.i18n?.localize?.bind(game.i18n))
    };
  };

  // Expose a diagnostic only; not used for storage or actor mutation.
  he.__stlWoD20Integrated = true;
  return true;
}

function updateTouchesHealth(update) {
  if (!update || typeof update !== "object") return false;
  const obj = foundry.utils.flattenObject(update);
  return Object.keys(obj).some(key =>
    key === "system.health" || key.startsWith("system.health.")
    || key === "system.traits.health" || key.startsWith("system.traits.health.")
  );
}

Hooks.once("init", () => {
  if (game.system?.id !== "worldofdarkness") return;
  game.settings.register(ID, "displayMode", {
    name: "WoD20 Injury Hover: Display Style",
    hint: "Choose how much injury detail Health Estimate shows to you. The setting is per-user. B=Bashing, L=Lethal, A=Aggravated. The damage track uses letters for damaged boxes and dots for empty boxes.",
    scope: "client",
    config: true,
    type: String,
    choices: MODE_CHOICES,
    default: "descriptive",
    onChange: refreshTokens
  });
});

Hooks.once("ready", () => {
  if (game.system?.id !== "worldofdarkness") return;
  if (!game.modules.get("healthEstimate")?.active) {
    console.warn(`${ID} | Health Estimate is not active; the adapter has not been installed.`);
    return;
  }
  if (!integrateHealthEstimate(game.healthEstimate)) {
    console.error(`${ID} | Could not attach to Health Estimate. Check the installed version and reload.`);
    return;
  }
  Hooks.on("updateActor", (actor, changes) => {
    if (!updateTouchesHealth(changes)) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
      if (token?.actor?.id === actor.id) token.refresh?.();
    }
  });
  refreshTokens();
  console.info(`${ID} | WoD20 damage hover integration active.`);
});