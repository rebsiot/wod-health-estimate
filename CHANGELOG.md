# Release history

## v0.1.1 — 2026-10-16

- **Added:** Stable Foundry manifest URL and versioned ZIP download URL on GitHub for installation and update checks.
- **Changed:** Module publication packaging: downloadable ZIP now has `module.json` at ZIP root, suitable for Foundry's Install Module dialog.
- **Preserved:** All five display modes, WoD20 health calculations, module ID, Foundry v14 compatibility, native Actor and Token data and existing visibility behavior. No code changes, migrations or world data writes.
- **Upgrade:** Back up the installed `Data/modules/stl-wod20-health-estimate` directory before updating. Install using the manifest URL or manually replace this adapter folder, then restart Foundry and re-enable as needed.
- **Rollback:** Disable the adapter, or restore the previous complete module directory; no world data was migrated.
- **Tests:** Original 16 automated tests rerun plus manifest, archive layout and syntax checks. No live Foundry v14 testing yet.
- **Known limitations:** Same as v0.1.0; first live installation and hover test remain pending.

## v0.1.0 — 2026-10-16

- **Added:** WoD20-native damage, wound-level and health-fraction adapter for Health Estimate token hover.
- **Added:** Per-client display options: Descriptive, Abstract, Health bar (text), Damage track (text), Detailed.
- **Added:** Narrative Bashing/Lethal/Aggravated injury clues by default, with exact values available only in Detailed or Damage track mode.
- **Added:** Extended physical health-track support and client refresh on health updates.
- **Fixed relative to unconfigured generic Health Estimate:** No automatic Dead state merely because a WoD20 NPC's wound track is full.
- **Preserved:** Native WoD20 health data, Health Estimate colors, token visibility rules and explicit defeated/dead flags. No migration or document updates.
- **Compatibility target:** Foundry 14; `worldofdarkness` v7.3.x; Health Estimate v35.x.
- **Known limitations:** Wraith Corpus, Changeling chimerical, Mummy extended overflows are not adapted; bars and tracks are textual, not native Token resource bars or drawn rings. Runtime extension may need updates if Health Estimate internals change.
- **Automated tests:** Health-model and mock integration tests (see TEST-REPORT.md).
- **Live Foundry/browser tests:** Not yet run in the user's installation.
- **Upgrade:** Stop Foundry, back up existing adapter folder (if any), replace only this module folder, restart and enable both modules.
- **Rollback:** Disable adapter and reload, or restore the previous adapter folder. No Actor/Scene schema migration.