# WoD20 Health Hover — handoff v0.2.2

**Project:** St. Louis v2  
**Module ID:** `stl-wod20-health-estimate` (unchanged)  
**Repository:** https://github.com/rebsiot/wod-health-estimate  
**Manifest:** https://raw.githubusercontent.com/rebsiot/wod-health-estimate/main/module.json  
**Version:** v0.2.2 — 2026-10-16  
**Compatibility target:** Foundry v14, WoD20 (`worldofdarkness`) approx v7.3.x, verify live version if needed.

## Latest decision

The user supplied live Foundry screenshots: v0.2.0 had a dark health bar, and v0.2.1 showed a small colored wound level below the nameplate. The user then requested v0.2.2 to move the status **above the token** and have its font **scale on zoom**, while retaining wound-level text and color. v0.2.2 implements this without a new controls/settings panel. This supersedes the v0.2.0 optional five-mode UI; older client preferences remain stored but ignored, not deleted.

## Source of truth

Use v0.2.2's complete installer ZIP and GitHub `main`, with the user's next live feedback, as the next starting point. The user confirmed v0.2.0 was visible on the map, but the new v0.2.2 placement/appearance is still pending live validation.

## Contract and implementation

- `scripts/health-model.js` continues to read WoD20 standard health levels/damage, honors extra boxes, and does not infer `Dead` from `Incapacitated`. `formatWoDHealth(health)` defaults to a new `status` output; old formatters remain for source-compatibility but UI only renders status.
- `scripts/hover-ui.js` reads health, sets the DOM node's `textContent` to the wound label and `data-wound` to one of eight known WoD level IDs. It follows Foundry `hoverToken` and native canvas-to-client coordinates. It anchors above the top of the token, scales font size with its on-screen height (12–24px), and clamps against viewport edges.
- `styles/hover.css` sets baseline 12px Signika text (overridden per frame for zoom) without background/border/padding/shadow box; minimal text-shadow aids readability. Eight static wound-level color selectors; no dynamic styles from Actor data.
- `scripts/main.js` retains hooks on `hoverToken`, `refreshToken`, `updateToken`, `updateActor`, `deleteToken`, `canvasTearDown`, but **no longer registers** a display-style setting or reads the old `displayMode` key. There is no migration/write.
- `module.json` changes only version, description, and download ZIP URL. Retains module ID, original stable manifest, `worldofdarkness` system relationship only, and the `styles` entry. No Health Estimate dependency.
- No Actor, Scene, Token, Journal, compendium, or stored player character updates.

## Tests and known boundaries

- Node mock unit/startup suite: **24 passed**, zero failed. Includes all eight wound level colors, move/pan/zoom, viewport-edge clamping, visibility/hidden user, client stale settings ignored, health updates, safe text rendering, and original health-model boundary tests.
- JS syntax, CSS, manifest, ZIP structure/integrity: validated for release.
- No live Foundry v14 verification of v0.2.2. First test: after updating via existing manifest and refreshing browser, hover the same `ThugMelee(1)` token; look for `Wounded` in orange above the token, increasing/decreasing in size with zoom and without a black box or track.
- Native token name placement varies with zoom, font, and other modules. The CSS-font-size zoom mapping and 6px vertical gap may need adjustment against a real screenshot. Token isVisible hides unseen tokens; optional content for Wraith Corpus, Changeling chimerical and Mummy special tracks remains unsupported.

## Release / rollback

Back up `Z:\Data\modules\stl-wod20-health-estimate` before overwriting, use Foundry manifest update and hard refresh. For manual Samba replacement, stop Foundry and copy ZIP contents to module folder with `module.json` directly inside. Disable Health Estimate to avoid competing token hover labels. If v0.2.2 is unsuitable, restore v0.2.0 backed-up folder/ZIP and reload; no world data migration.

## Continuity

`00-START-HERE.md` and a numbered component handoff weren't available in this conversation. Assign an owning `NN.K` health-hover series when updating the project index and record this release there; no other module APIs changed.