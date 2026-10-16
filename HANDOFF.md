# Standalone WoD20 Health Hover — module handoff

**Project:** St. Louis v2  
**Module ID:** `stl-wod20-health-estimate` (unchanged)  
**Repository:** https://github.com/rebsiot/wod-health-estimate  
**Current release:** v0.2.0, October 16, 2026  
**Game:** Foundry v14 + `worldofdarkness` v7.3.x  
**Manifest:** https://raw.githubusercontent.com/rebsiot/wod-health-estimate/main/module.json

## Design decision

User requested the dependency on Health Estimate be removed. v0.2.0 replaces the upstream adapter with its **own token-hover renderer**. **No Health Estimate module, API, monkey patch or data dependency remains.** Package relationship requires only the WoD20 game system. Reuse the existing module ID and displayMode setting (client scope) to maintain upgrade continuity. No world/document migrations.

## Current implementation

- `scripts/health-model.js`: pre-existing read-only physical health calculations/formatting, expanded boxes and seven wound thresholds; five view modes `descriptive`, `abstract`, `bar`, `track`, `detailed`. Unchanged core logic.
- `scripts/hover-ui.js`: standalone `TokenHealthHover` UI anchored via `Token.bounds` and `Canvas.clientCoordinatesFromCanvas` into a single fixed DOM overlay. Runs a requestAnimationFrame position loop only while a token is hovered. Token visibility rules and client settings. Pure functions `canShowHealth`, `severityFor`.
- `scripts/main.js`: client setting init, native Foundry `hoverToken`, `updateActor`, `updateToken`, `refreshToken`, `deleteToken`, `canvasTearDown` wiring. Warns when Health Estimate is also enabled (duplicate labels possible); does not toggle other modules.
- `styles/hover.css`: compact dark tooltip with severity-colored border. Pointer events disabled.
- `module.json`: v0.2.0, id unchanged, only required relationship `worldofdarkness`, versioned `download` URL pointing at `dist/stl-wod20-health-estimate-0.2.0.zip`.

## Behavioral constraints

- Do not call `game.healthEstimate` or patch core WoD/Foundry APIs. Disable upstream Health Estimate in world when deploying v0.2.0; don't uninstall if other worlds use it.
- Standard WoD physical boxes only; skip Wraith/Changeling alternates rather than creating made-up estimates. No fallback provider exists.
- Wound 7+ means Incapacitated; **not necessarily Dead**. Do not infer death from 0 remaining capacity.
- `Token.isVisible` and player-hidden status control display. UI only reads client-accessible Actor data and writes `textContent` (not untrusted HTML).
- Bar/track modes are text characters, not graphical token resource bars. No need to duplicate existing Foundry resource bar systems.
- The same client setting means previous display choices should persist. The old Health Estimate custom hide, font, gradient and dead-flag semantics do **not** carry forward.
- Do not mutate Actors, Tokens, token bar settings, Scenes, Journals, or existing world data.

## Release and continuity requirements

- `00-START-HERE.md` and a dedicated numbered module handoff were not available. Assign an owning numbered handoff/chat series for this new independent module when the project's index is updated. No adjacent modules' contracts changed.
- The complete v0.2.0 module source and installer archive are retained in GitHub; treat that **and the latest live verified ZIP** as starting points for future work. Do not infer active deployment from a published commit.
- Tests: Node mock suite and manifest/package checks. Live Foundry v14 Ubuntu has **not** been tested or updated.
- First live test: with Health Estimate disabled, hover a healthy visible Mage token, then apply mixed B/L/A on its native sheet and hover again. Confirm output and no console errors.

## Upgrade and rollback

- Before replacing, back up `Z:\Data\modules\stl-wod20-health-estimate`. Stop Foundry for a manual Samba copy. Manifest installation uses same stable URL.
- Enable this module and disable Health Estimate in the WoD20 world, refresh clients.
- Rollback: disable v0.2.0, restore v0.1.1 folder/ZIP and re-enable Health Estimate, refresh clients. No Actor/world migration means no schema rollback is needed.