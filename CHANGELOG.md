# Change history — St. Louis WoD20 Health Hover

## v0.2.2 — 2026-10-16
- Moved the wound-status label above the token.
- Made the label scale with the token's apparent on-screen size so it grows and shrinks with zoom like the native nameplate.
- Preserved the plain text-only wound label and wound-level color styling from v0.2.1.

## v0.2.1 — 2026-10-16

- **Changed:** Hover shows only the native WoD wound level, for example `Wounded`. No bars, type counts, narrative injury text or large black tooltip.
- **Changed:** Position as a small second line underneath the Foundry token nameplate, using similar font scale, without a background, border, or box shadow; flip above the token when space is limited.
- **Changed:** Text color is keyed to the actual wound level (Uninjured through Incapacitated), not percentage-based broad severity. Eight wound-specific color selectors.
- **Simplified:** Removed the visible five-choice display-style setting; persisted legacy preferences are ignored, not deleted. Retained historical formatter functions internally for compatibility.
- **Preserved:** Module ID, GitHub manifest URL, WoD20 health calculations, Foundry visibility protections, token-pan/zoom following, read-only nature, and no Health Estimate dependency.
- **Upgrade:** Back up the existing module; use the same manifest URL; reload clients to refresh JavaScript/CSS. No world data migration.
- **Rollback:** Disable or restore your backed-up v0.2.0 module directory/ZIP and reload.
- **Automated:** 24 Node/mock tests passed; static syntax, manifest and ZIP integrity verified.
- **Live Foundry:** New v0.2.1 label not yet tested in the user's world. User screenshot confirmed the previous v0.2.0 renderer was visibly running.

## v0.2.0 — 2026-10-16

- **Changed:** Completely removes the `healthEstimate` required relationship. The only package requirement is the `worldofdarkness` game system; keeps Foundry v14 compatibility.
- **Added:** Standalone, pointer-transparent HTML hover label using native v14 `hoverToken`, `updateActor`, `updateToken`, `refreshToken`, `deleteToken`, and canvas teardown events; follows pan/zoom and moving tokens.
- **Added:** Token visibility and hidden-to-player checks; hides on scene teardown or deletion, and skips unsupported physical-health data.
- **Preserved:** Module ID `stl-wod20-health-estimate`, stable manifest URL, five per-client display-mode values, native WoD20 injury calculations, extended health boxes, and no Actor/Token data mutation.
- **Changed:** Health Estimate's old settings (including hide-estimate behavior, color/position and dead-flag interpretation) no longer control this tooltip. A simple severity border replaces Health Estimate's label color. Unsupported splat tracks display no tooltip rather than delegating to Health Estimate.
- **Upgrade note:** Disable Health Estimate in the world to avoid duplicate token-hover labels; do not uninstall it if other worlds use it. No data migration.
- **Rollback note:** Restore prior module directory and re-enable Health Estimate to return to v0.1.1.
- **Automated:** Node test suite, syntax/manifest assertions, archive integrity checks.
- **Live Foundry:** Not tested in this environment.

## v0.1.1 — 2026-10-16

- Added stable GitHub-hosted Foundry manifest and versioned installer archive in `dist/`.
- Preserved Health Estimate integration, five display modes and module ID.

## v0.1.0 — 2026-10-16

- First WoD20 companion adapter for Health Estimate v35.x and `worldofdarkness` v7.3.x.
- Native damage types, wound-level descriptors, abstract condition, compact bar, type track, exact count mode.
- Health-level box sum and precautions about incapacitation versus death.