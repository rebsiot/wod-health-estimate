# St. Louis WoD20 Health Estimate Adapter

**v0.1.0 — 2026-10-16**  
**For:** Foundry VTT v14, World of Darkness 20th Edition (`worldofdarkness`) v7.3.x, and Health Estimate v35.x (the published v14 release series).

This is a **new companion module**, not a modified copy of Health Estimate or WoD20. It translates native WoD20 health boxes into Health Estimate's token-hover label and color fraction. In a Mage or Vampire world, it can show overall condition, descriptive injury clues, a compact health bar, a type-by-type damage track, or counts. It reads Actors; it never updates Actors, Tokens, Scenes, or settings for Health Estimate itself.

## Example views

For a character with 2 Bashing, 1 Lethal, 1 Aggravated damage on a 7-box track:

| Setting | Example hover text |
|---|---|
| **Descriptive** (default) | `Wounded · battered, bleeding, and grievously hurt` |
| **Abstract** | `Seriously injured` |
| **Health bar** | `Wounded · [▰▰▰▱▱▱▱]` |
| **Damage track** | `Wounded · [ALBB···]` |
| **Detailed** | `Wounded · 2B · 1L · 1A` |

*Bar:* filled symbols are remaining boxes; hollow symbols are damaged boxes. *Damage track:* `A`=Aggravated, `L`=Lethal, `B`=Bashing and `·`=empty. The track is ordered A, L, B, empty, matching WoD's severity-first representation. Bar and track are **compact characters in the Health Estimate hover text**; they do not change Foundry's native token resource bars and do not draw a separate ring. Tracks over 16 boxes are visually abbreviated with `…` (the injury calculations still use all boxes).

The default narrative text describes plausible visible injuries without revealing exact damage counts; it cannot know the fictional appearance or source of an injury, so treat these as broad visual clues rather than definitive physical details.

## Install or upgrade

1. Verify Foundry is v14 and the active game system is `worldofdarkness` (v7.3.x expected). Install **Health Estimate** v35.x from Foundry's package browser and enable it in the world.
2. If replacing an earlier adapter version, back up `Z:\Data\modules\stl-wod20-health-estimate`. Do not overwrite any other module's directory.
3. Stop Foundry before replacing module files. Extract the folder **`stl-wod20-health-estimate`** from the ZIP into `Z:\Data\modules\` (Ubuntu Foundry user-data directory exposed over Samba).
4. Check that `Z:\Data\modules\stl-wod20-health-estimate\module.json` exists directly inside the module's folder.
5. Restart Foundry. In the relevant world, enable **Health Estimate** and **St. Louis WoD20 Health Estimate Adapter** under Manage Modules.
6. Reload clients. Under **Configure Settings > Module Settings**, select **WoD20 Injury Hover: Display Style**. This is a *per-user* selection, so each GM/player may choose their own level of detail. Health Estimate's existing visibility, display timing, fonts, gradients and position settings still apply.

Do **not** change `worldofdarkness` files or Health Estimate's source. This adapter requires both packages active and does nothing in other game systems.

### One real smoke test

Place a Mage or Vampire Actor token on a Scene. Hover over it while healthy and confirm `Uninjured` appears (unless your Health Estimate display settings suppress healthy labels). Mark 2 Bashing + 1 Lethal + 1 Aggravated on the **native actor sheet**, hover again, and check the configured result above. Then switch to **Abstract** and **Health bar** mode and confirm the hover text changes. Clear wounds and confirm recovery. Finally, explicitly mark a defeated token and confirm Health Estimate still displays its dead/defeated state.

If the label is invisible, verify Health Estimate is set to show descriptions and that the token isn't hidden or individually opted out in Health Estimate. Test with the `display` mode set to its default hover mode, not `disabled` or `nameplate`.

## What it does / doesn't do

- Computes **actual standard physical wound-track capacity** by summing each level's `total` boxes (`bruised` through `incapacitated`). The persisted `system.traits.health.totalhealthlevels.max` can be stale after extra boxes are added, so it is intentionally *not* authoritative here.
- Reads **Bashing, Lethal and Aggravated** from `actor.system.health.damage` and calculates the current WoD wound level directly from the track. Color/severity is still controlled by Health Estimate.
- Avoids Health Estimate's generic "NPC at zero HP = dead" conclusion: **Incapacitated does not automatically mean Dead**. Explicit defeated/combat markers and the Health Estimate dead flag remain effective.
- Preserves Health Estimate's existing hide/visibility controls and colors. No gameplay automation or extra health tracking is introduced.
- Delegates **Wraith Corpus** and **Changeling chimerical** tracks to Health Estimate's default behavior rather than pretending they are standard physical tracks. Those alternate tracks and Mummy-specific overflow states are **not implemented** in this release.
- Does **not** render a separate circular ring, fill native token bars, modify token bar attributes, or migrate documents. If you want Foundry's built-in bar, configure the token's own resource-bar display separately; it is not necessary to use this adapter.
- Is a *runtime integration* with Health Estimate's provider, `getEstimation`, and `isDead` methods. Those are implementation-specific extension points rather than a formal published plugin API and may change in a later Health Estimate version.

## Troubleshooting and rollback

If Health Estimate still shows percentages or generic HP labels, confirm the world runs `worldofdarkness`, the adapter is enabled, and no console error says that the adapter couldn't attach. Use an Actor with the standard WoD health schema and switch Health Estimate's display to its default hover mode. Reload clients after changing modules.

To **roll back**, disable the adapter in Manage Modules, reload clients, then (optionally) stop Foundry and restore/remove only `Z:\Data\modules\stl-wod20-health-estimate`. No Actors, world documents, or Health Estimate configuration are migrated, so uninstalling the companion should restore the original Health Estimate behavior. Keep your normal Foundry world backup discipline nonetheless.

## Test status

- **Automated/mock tested:** Node unit/integration tests for health damage, wound thresholds, expanded health tracks, output modes, unknown data, skipped alternate splats, hidden/dead flag behavior, idempotent adapter hookup, original colors and fallback handling.
- **Syntax/package:** module manifest JSON and JavaScript syntax tests; ZIP structure checked at delivery.
- **Live Foundry v14:** **not run** in the user's Ubuntu world. Nothing has been installed or deployed.

Run tests locally from this directory with `npm test` (Node.js 20+), or `node --test tests/*.test.mjs`. npm does not download any dependencies.

**Sources inspected:**

- [Health Estimate — Foundry package](https://foundryvtt.com/packages/healthEstimate) and [upstream `HealthEstimate.js`](https://github.com/mclemente/healthEstimate/blob/master/src/module/HealthEstimate.js).
- [WoD20 — Foundry package](https://foundryvtt.com/packages/worldofdarkness) and [WoD20 health data schema](https://github.com/JohanFalt/Foundry_WoD20/blob/main/module/actor/datamodel/base/actor_health.js).
- [WoD20 wound calculations](https://github.com/JohanFalt/Foundry_WoD20/blob/main/module/actor/data/wod-actor-base.js) and [health-capacity logic](https://github.com/JohanFalt/Foundry_WoD20/blob/main/module/scripts/combat-helpers.js).

The project global architecture/testing/decision references were available; `00-START-HERE.md` and a new numbered Health Estimate module handoff were **not provided** in this conversation.