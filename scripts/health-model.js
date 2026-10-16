/**
 * Read-only World of Darkness 20th health-track adapter.
 * Source schema verified against JohanFalt/Foundry_WoD20 (system v7.3.x).
 * No Actor or Token document writes occur here.
 */
export const WOUND_LEVELS = Object.freeze([
  ["bruised", "Bruised"],
  ["hurt", "Hurt"],
  ["injured", "Injured"],
  ["wounded", "Wounded"],
  ["mauled", "Mauled"],
  ["crippled", "Crippled"],
  ["incapacitated", "Incapacitated"]
]);

const ALTERNATE_SPLATS = /(?:wraith|changeling)/i;

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
}

/**
 * Get the standard physical damage track. Wraith Corpus and Changeling
 * chimerical damage are distinct tracks; this release intentionally leaves
 * them for Health Estimate's default provider rather than misreport them.
 *
 * @param {Actor} actor
 * @returns {object|null}
 */
export function getWoDHealth(actor) {
  const system = actor?.system;
  const health = system?.health;
  const damage = health?.damage;
  if (!health || !damage || typeof damage !== "object") return null;

  const identity = [actor?.type, system?.settings?.splat, system?.settings?.game]
    .filter(v => typeof v === "string").join(" ");
  if (ALTERNATE_SPLATS.test(identity) || system?.settings?.usechimerical === true) return null;

  if (!["bashing", "lethal", "aggravated"].every(key =>
    damage[key] !== undefined && damage[key] !== null && Number.isFinite(Number(damage[key]))
  )) return null;

  // The current WoD20 system explicitly warns against trusting the persisted
  // traits.health.totalhealthlevels.max when extra health boxes are present.
  // Sum each health level's 'total' instead, in the same order as the sheet.
  const levels = WOUND_LEVELS.map(([key, fallback]) => ({
    key,
    label: health[key]?.label || `wod.health.${key}`,
    fallback,
    boxes: nonNegativeInteger(health[key]?.total)
  }));
  const max = levels.reduce((sum, level) => sum + level.boxes, 0);
  if (!max) return null;

  const bashing = nonNegativeInteger(damage.bashing);
  const lethal = nonNegativeInteger(damage.lethal);
  const aggravated = nonNegativeInteger(damage.aggravated);
  const totalDamage = bashing + lethal + aggravated;
  const applied = Math.min(totalDamage, max);

  let wound = { key: "uninjured", label: "wod.health.uninjured", fallback: "Uninjured" };
  if (totalDamage > 0) {
    let remaining = totalDamage;
    wound = levels.at(-1);
    for (const level of levels) {
      remaining -= level.boxes;
      if (remaining <= 0) {
        wound = level;
        break;
      }
    }
  }

  return {
    levels, max, bashing, lethal, aggravated, totalDamage, applied,
    remaining: Math.max(0, max - applied),
    fraction: Math.max(0, Math.min(1, (max - applied) / max)),
    wound
  };
}

function labelFor(wound, localize) {
  const key = wound.label;
  if (typeof key !== "string") return wound.fallback;
  if (!key.startsWith("wod.") && !key.startsWith("WORLD")) return key;
  const result = typeof localize === "function" ? localize(key) : key;
  return result && result !== key ? result : wound.fallback;
}

function abstractCondition(health) {
  const { key } = health.wound;
  if (key === "uninjured") return "Uninjured";
  if (key === "bruised") return "Minor injuries";
  if (key === "hurt" || key === "injured") return "Visibly injured";
  if (key === "wounded" || key === "mauled") return "Seriously injured";
  if (key === "crippled") return "Barely standing";
  return "Incapacitated";
}

function injuryClues(health) {
  const descriptions = [];
  if (health.bashing) descriptions.push("battered");
  if (health.lethal) descriptions.push("bleeding");
  if (health.aggravated) descriptions.push("grievously hurt");
  if (descriptions.length === 1) return descriptions[0];
  if (descriptions.length === 2) return descriptions.join(" and ");
  return `${descriptions.slice(0, -1).join(", ")}, and ${descriptions.at(-1)}`;
}

function bar(health, typed = false) {
  // Avoid unreasonably long hover labels for supernatural health expansions.
  const limit = Math.min(health.max, 16);
  let filled = "";
  if (typed) {
    // WoD's sheet arranges aggravated, lethal and bashing wounds first.
    filled = "A".repeat(health.aggravated)
      + "L".repeat(health.lethal)
      + "B".repeat(health.bashing);
    filled = filled.slice(0, limit);
    const empty = "·".repeat(Math.max(0, limit - filled.length));
    return `[${filled}${empty}]${health.max > limit ? "…" : ""}`;
  }
  const visibleRemaining = Math.min(limit, health.remaining);
  filled = "▰".repeat(visibleRemaining) + "▱".repeat(limit - visibleRemaining);
  return `[${filled}]${health.max > limit ? "…" : ""}`;
}

/** @param {ReturnType<getWoDHealth>} health */
export function formatWoDHealth(health, mode = "descriptive", localize = x => x) {
  if (!health) return "";
  const wound = labelFor(health.wound, localize);
  switch (mode) {
    case "abstract":
      return abstractCondition(health);
    case "bar":
      return `${wound} · ${bar(health)}`;
    case "track":
      return `${wound} · ${bar(health, true)}`;
    case "detailed": {
      if (!health.totalDamage) return wound;
      const detail = [
        health.bashing ? `${health.bashing}B` : null,
        health.lethal ? `${health.lethal}L` : null,
        health.aggravated ? `${health.aggravated}A` : null
      ].filter(Boolean).join(" · ");
      return `${wound} · ${detail}`;
    }
    case "descriptive":
    default:
      if (!health.totalDamage) return wound;
      return `${wound} · ${injuryClues(health)}`;
  }
}