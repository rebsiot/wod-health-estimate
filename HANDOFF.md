# WoD20 Health Estimate Companion Module — Handoff

**Date:** 2026-10-16  
**Current module ID:** `stl-wod20-health-estimate`  
**Current version:** `0.1.0`  
**Ownership:** New component. Assign its own numbered conversation/handoff after consulting `00-START-HERE.md`; do not file its code under Player Actions, Paradox, or Dice Improvements.

## Decisions

- Support Foundry 14, `worldofdarkness` v7.3.x and Health Estimate's current v14 release series.
- Do **not** fork Health Estimate or change World of Darkness system source. Use a small independent companion.
- Descriptive mode defaults to wound-level text plus narrative B/L/A clues. Individual users can switch to abstract, textual health bar, damage track or exact counts.
- Preserve Health Estimate hover display logic, individual token hide flags, settings and gradients. Do not force player/GM permission gates.
- Treat full wound track as Incapacitated, not automatically Dead. Respect explicit defeat/death state.
- Exclude alternate Wraith/Changeling tracks from our calculations in first release.
- No Actor/Token/Scene/document writes and no migration.

## Code/data contracts

- `scripts/health-model.js`: reads `actor.system.health.damage.{bashing,lethal,aggravated}` and `actor.system.health.{bruised,hurt,injured,wounded,mauled,crippled,incapacitated}.total`.
- `scripts/main.js`: on Foundry `ready`, wraps Health Estimate `provider.fraction`, `getEstimation`, and `isDead`, with idempotence protection. Default Health Estimate hook/visibility/canvas rendering remain responsible for actual hovering.
- Module requires `worldofdarkness` system and `healthEstimate` module; there are no data contract changes to any existing St. Louis v2 component.

## Verification

- **Source inspected:** upstream Health Estimate master (provider API, module setup, current v14 manifest); upstream WoD20 main (`actor_health.js`, `health.js`, `combat-helpers.js`, `wod-actor-base.js`).
- **Automated/mock:** see `TEST-REPORT.md`.
- **Live Foundry:** pending. Install only after backing up module folders and retain a normal world backup.

## Next step

1. Install complete ZIP into the Foundry Data `modules` directory, verify dependencies and enable in a test world.
2. Hover a **real PC Mage token** with mixed Bashing/Lethal/Aggravated and an **NPC Vampire token** with a full track. Confirm updated labels, no automatic Dead, normal Health Estimate hide rules, and that switching all modes works for a player and GM.
3. If a failure appears, capture browser console errors, installed Health Estimate version, WoD20 version, and a **redacted** sample exported Actor JSON (no sensitive content). Base any code change on those actual versions and data.
4. Update the owning numbered module handoff (once assigned), `00-START-HERE.md`, `GLOBAL-03-RELEASE-DEPLOYMENT-TESTING.md` release/test status, and `GLOBAL-04-DECISIONS-ROADMAP-RISKS.md` only after a confirmed live milestone.