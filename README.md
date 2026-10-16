# St. Louis WoD20 Health Hover

**v0.2.0 — 2026-10-16**  
**For:** Foundry VTT v14 and `worldofdarkness` (WoD20) v7.3.x.  
**Repository:** https://github.com/rebsiot/wod-health-estimate

A **standalone**, read-only health status tooltip for Mage M20 and Vampire V20 Actors in the WoD20 system. **Health Estimate is not required.** Hover a visible token to see its current standard physical wound condition and, if selected, Bashing/Lethal/Aggravated details. The tooltip follows token positions and canvas pan/zoom.

This version **replaces the old Health Estimate adapter**, but keeps its `stl-wod20-health-estimate` module ID, per-client `displayMode` setting and five display formats. Foundry's normal token visibility/vision determines whether the module displays a label.

## Hover display modes

Example: 2 Bashing + 1 Lethal + 1 Aggravated on a 7-box track.

| Per-user mode | Example |
|---|---|
| Descriptive (default) | `Wounded · battered, bleeding, and grievously hurt` |
| Abstract | `Seriously injured` |
| Health bar | `Wounded · [▰▰▰▱▱▱▱]` |
| Damage track | `Wounded · [ALBB···]` |
| Detailed | `Wounded · 2B · 1L · 1A` |

The symbols are **compact text**, not native Foundry resource bars. In a health bar, solid boxes mean *remaining* capacity; open boxes mean *damage*. In a damage track `A`=Aggravated, `L`=Lethal, `B`=Bashing, and `·`=empty. Tracks longer than 16 boxes use `…` to limit tooltip width; actual damage calculations do not truncate.

The descriptive mode gives general visual clues and **does not reveal exact counts**. Those descriptions cannot determine the specific fictional appearance or origin of an injury. A colored border provides a broad condition cue, not a new rule or Actor status.

## Install or update via manifest (recommended)

Use the same stable **Manifest URL** for all future versions:

`https://raw.githubusercontent.com/rebsiot/wod-health-estimate/main/module.json`

1. In Foundry's **Setup → Add-on Modules → Install Module**, paste the manifest URL and install/update the package.
2. Launch a world using the **World of Darkness 20th Edition (`worldofdarkness`)** system.
3. In **Manage Modules**, enable **St. Louis WoD20 Health Hover**. It uses the same module ID as the older adapter; previously selected display preferences should persist.
4. **Disable Health Estimate** in that world if it is installed and enabled. It is no longer a dependency; leaving it enabled may show duplicate/conflicting hover labels. Do not delete Health Estimate's files if other worlds still need it.
5. In **Configure Settings → Module Settings**, select **WoD20 Injury Hover: Display Style**. Each player/GM controls their own view.
6. Reload Foundry clients after updating modules.

The manifest currently downloads `dist/stl-wod20-health-estimate-0.2.0.zip`. That ZIP has `module.json` at its root, as required for a Foundry manifest install. The module's ID and manifest URL have **not** changed.

## Manual installation via Samba

1. Back up `Z:\Data\modules\stl-wod20-health-estimate` first if it exists. Back up your world as usual before module updates, even though this release does not write world data.
2. Stop the Foundry application on Ubuntu before replacing the module directory through Samba.
3. Extract the ZIP **contents** into `Z:\Data\modules\stl-wod20-health-estimate\`. Do not create an extra nested folder. `module.json` must be at the directory root.
4. Restart Foundry, enable this module in the intended WoD20 world, and disable Health Estimate there to prevent competing displays.
5. Reload your browser and choose your display style if desired.

Do **not** modify the `worldofdarkness` system or Health Estimate's source code. Nothing needs conversion or migration.

## Smoke test in live Foundry

1. Disable Health Estimate. Hover a healthy Mage or Vampire token that is visible to your user. Expect `Uninjured`.
2. Apply **2 Bashing, 1 Lethal, 1 Aggravated** damage on its **native WoD20 Actor sheet**, then hover. Expect `Wounded · battered, bleeding, and grievously hurt` in default mode.
3. Change **Display Style** to Abstract, Health bar, Damage track, then Detailed; the tooltip should update immediately if the token remains hovered, or on the next hover.
4. Test both a linked Actor token and an unlinked NPC token. Test a player account: an **unseen or GM-hidden token should never show an injury tooltip**.
5. Pan/zoom the scene while hovering, then switch scenes; the label should move with the token and disappear on scene teardown.
6. Fully fill the damage track. The condition must show **Incapacitated**, *not automatically Dead* (e.g. a Vampire might be torpid).

If no label appears: confirm world system ID is `worldofdarkness`, module enabled, token is actually visible, and Actor uses the standard `system.health.damage` fields and standard health-level totals. Open the browser console to check for errors. Wraith Corpus and Changeling chimerical tracks intentionally produce no label.

## Behavior and boundaries

- Calculates maximum physical health from the **sum of each wound level's `total` boxes**, rather than a potentially stale stored traits total. Extra boxes are supported.
- Reads `actor.system.health.damage.{bashing,lethal,aggravated}`. The module **does not** create/update Actors, Tokens, combat status, Scenes, flags or other module settings.
- Uses Foundry v14 **`hoverToken` and document hooks**, the official canvas-to-client coordinate API and a lightweight pointer-transparent DOM label. No Health Estimate provider or patched Foundry functions.
- Honors `Token.isVisible` plus GM-hidden token restrictions. It does not grant a player additional Actor document permissions, though available detail ultimately depends on data sent to the client by WoD20/Foundry. As with v0.1.x, a client choosing Detailed can see damage counts for visible tokens whose Actor health data the client has received.
- Always displays on token **hover**; it does **not** inherit Health Estimate's display timing, hide-estimate flags, fonts, colors, or status effects. It doesn't change native Foundry resource bars or token nameplates.
- Standard physical health only. **Wraith Corpus, Changeling chimerical health, Mummy-specific overflow states** and nonstandard Actor shapes are not supported; for these, no tooltip is rendered. This is a change from v0.1.x, which delegated unsupported Actors back to Health Estimate.
- Doesn't translate a full health track into a definitive death state. Combatant defeated status is not automatically mapped to 'Dead'.

## Rollback

Disable this module and reload clients to hide its tooltip. To return to v0.1.1, stop Foundry and restore your **backed-up v0.1.1 module folder** or the v0.1.1 ZIP, then re-enable Health Estimate in the world. v0.1.1 requires Health Estimate and does not render on its own. No data migrations occur in either direction; the existing display-mode client setting is retained.

## Test status

- **Automated/mock tested:** `node --test tests/*.test.mjs` (Node.js 20+), covering WoD20 injury models, all five modes, visibility, positioning/pan/zoom, mutation-free refreshes, and native Foundry hook wiring.
- **Package/syntax validated:** manifest dependency/URLs, JS syntax, CSS/file references and ZIP structure.
- **Live Foundry v14:** **not yet tested** in the user's Ubuntu environment. This package is ready for a live smoke test but has **not been deployed**.

## Sources

- [Foundry v14 `hoverToken` hook](https://foundryvtt.com/api/v14/functions/hookEvents.hoverObject.html)
- [Foundry v14 canvas coordinate API](https://foundryvtt.com/api/v14/classes/foundry.canvas.Canvas.html#clientCoordinatesFromCanvas)
- [Foundry v14 `Token.isVisible`](https://foundryvtt.com/api/v14/classes/foundry.canvas.placeables.Token.html)
- [WoD20 health schema](https://github.com/JohanFalt/Foundry_WoD20/blob/main/module/actor/datamodel/base/actor_health.js)

`00-START-HERE.md` and a dedicated numbered handoff for this component were not present in the current conversation. See `HANDOFF.md` for module-level continuity.