# WoD20 Health Hover — handoff v0.2.1

**Project:** St. Louis v2  
**Module ID:** `stl-wod20-health-estimate` (unchanged)  
**Repository:** https://github.com/rebsiot/wod-health-estimate  
**Manifest:** https://raw.githubusercontent.com/rebsiot/wod-health-estimate/main/module.json  
**Version:** v0.2.1 — 2026-10-16  
**Compatibility target:** Foundry v14, WoD20 (`worldofdarkness`) approx v7.3.x, verify live version if needed.

## Latest decision

The user supplied a Foundry screenshot showing the v0.2.0 dark tooltip visibly rendered above a token: `Wounded · [health boxes]`. The user asked that the label be **small like the existing token name below the token**, display **only the wound status**, and use **wound-level-colored text**. v0.2.1 implements this without a new controls/settings panel. This supersedes the v0.2.0 optional five-mode UI; older client preferences remain stored but ignored, not deleted.

## Source of truth

Use v0.2.1's complete installer ZIP and GitHub `main`, with the user's next live feedback, as the next starting point. The user confirmed v0.2.0 was visible on the map, but the new v0.2.1 placement/appearance is still pending live validation.

## Contract and implementation

- `scripts/health-model.js` continues to read WoD20 standard health levels/damage, honors extra boxes, and does not infer `Dead` from `Incapacitated`. `formatWoDHealth(health)` defaults to a new `status` output; old formatters remain for source-compatibility but UI only renders status.
- `scripts/hover-ui.js` reads health, sets the DOM node's `textContent` to the wound label and `data-wound` to one of eight known WoD level IDs. It follows Foundry `hoverToken` and native canvas-to-client coordinates. It anchors below token's bottom edge, accounting for existing nameplate, flips above token near bottom edge, and clamps horizontally.
- `styles/hover.css` renders 12px Signika text without background/border/padding/shadow box; minimal text-shadow aids readability. Eight static wound-level color selectors; no dynamic styles from Actor data.
- `scripts/main.js` retains hooks on `hoverToken`, `refreshToken`, `updateToken`, `updateActor`, `deleteToken`, `canvasTearDown`, but **no longer registers** a display-style setting or reads the old `displayMode` key. There is no migration/write.
- `module.json` changes only version, description, and download ZIP URL. Retains module ID, original stable manifest, `worldofdarkness` system relationship only, and the `styles` entry. No Health Estimate dependency.
- No Actor, Scene, Token, Journal, compendium, or stored player character updates.

## Tests and known boundaries

- Node mock unit/startup suite: **24 passed**, zero failed. Includes all eight wound level colors, move/pan/zoom, bottom viewport fallback, visibility/hidden user, client stale settings ignored, health updates, safe text rendering, and original health-model boundary tests.
- JS syntax, CSS, manifest, ZIP structure/integrity: validated for release.
- No live Foundry v14 verification of v0.2.1. First test: after updating via existing manifest and refreshing browser, hover the same `ThugMelee(1)` token; look for `Wounded` in orange directly below its name without the black box/track.
- Native token name placement varies with zoom, font, and other modules. The fixed viewport-based 18px nameplate gap may need adjustment against a real screenshot. Token isVisible hides unseen tokens; optional content for Wraith Corpus, Changeling chimerical and Mummy special tracks remains unsupported.

## Release / rollback

Back up `Z:\Data\modules\stl-wod20-health-estimate` before overwriting, use Foundry manifest update and hard refresh. For manual Samba replacement, stop Foundry and copy ZIP contents to module folder with `module.json` directly inside. Disable Health Estimate to avoid competing token hover labels. If v0.2.1 is unsuitable, restore v0.2.0 backed-up folder/ZIP and reload; no world data migration.

## Continuity

`00-START-HERE.md` and a numbered component handoff weren't available in this conversation. Assign an owning `NN.K` health-hover series when updating the project index and record this release there; no other module APIs changed.