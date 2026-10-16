# Change history — St. Louis WoD20 Health Hover

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