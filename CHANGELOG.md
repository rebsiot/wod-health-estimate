# Release history

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