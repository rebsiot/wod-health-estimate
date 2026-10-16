# St. Louis WoD20 Health Hover

**v0.2.2 — October 16, 2026**  
**Foundry:** v14  
**System:** `worldofdarkness` v7.3.x  
**Module ID:** `stl-wod20-health-estimate` (unchanged)  
**Repository:** https://github.com/rebsiot/wod-health-estimate

Read-only token-hover wound status for Mage M20 and Vampire V20. **Health Estimate is not required.** The module reads the native WoD20 health track and shows one small colored status above the hovered token, scaling with canvas zoom.

## What players see

On hover, a token with four damage boxes filled displays just **Wounded**, above the token. No black background, border, bar, damage numbers, tooltip prose, or modal. The text grows and shrinks with the token on screen (within a legible 12–24px range) and uses a dark shadow for map contrast.

The displayed wound name corresponds to the Actor's native health track:

| Actual WoD wound level | Status color |
|---|---|
| Uninjured | Muted green `#93bda0` |
| Bruised | Yellow-green `#c8d093` |
| Hurt | Gold `#dec582` |
| Injured | Amber `#e4b67d` |
| Wounded | Orange `#e3a173` |
| Mauled | Coral `#de8a79` |
| Crippled | Red `#db7777` |
| Incapacitated | Deep red `#e36d70` |

The color is tied to the **wound level**, not damage type or a separate percentage-based estimation. Level labels may use WoD localization/custom sheet labels; color is always keyed to the native wound-level ID. A full damage track is **Incapacitated**, not automatically Dead.

There are no display-style controls in v0.2.2. Previous clients who chose `bar`, `track`, `detailed`, `abstract`, or `descriptive` will immediately see the new **status-only** format. The old client setting is not deleted (so restoring an earlier release can use it).

## Install or update through Foundry (recommended)

**Manifest URL:**

`https://raw.githubusercontent.com/rebsiot/wod-health-estimate/main/module.json`

1. Before updating, back up `Z:\Data\modules\stl-wod20-health-estimate` and your world as normal.
2. In Foundry **Setup → Add-on Modules**, update or install using the manifest URL. The manifest's ZIP points to `dist/stl-wod20-health-estimate-0.2.2.zip`.
3. Launch your WoD20 world and enable **St. Louis WoD20 Health Hover** in **Manage Modules**. Disable the separate **Health Estimate** module in this world to avoid duplicate hover indicators; do not uninstall it if another world uses it.
4. Refresh each browser client, preferably a hard reload to clear cached CSS/JS.
5. Hover a visible Mage or Vampire token. Expect only the colored WoD wound name above the token. Apply additional damage to test the text/color change.

**Manual ZIP:** Stop Foundry before replacing the module through Samba. Extract the ZIP **contents**, not an extra nesting directory, into `Z:\Data\modules\stl-wod20-health-estimate\` so `module.json` is directly inside it. Restart Foundry, reload clients, and verify the world module is enabled.

## Live smoke test

1. Hover a visible token with **four standard WoD health boxes marked**. Expect `Wounded` in orange, above the token; no bar or dark popup.
2. Remove damage. Expect `Uninjured` in muted green. Add two boxes; expect `Hurt` in gold (assuming a standard seven-box track).
3. Pan/zoom while hovered, move the token, then hover a token near the bottom of the browser viewport. The label stays above the token and follows its position and zoom; near the top of the viewport it is clamped into view.
4. Test a player account with an unseen or GM-hidden token: the label must not leak through vision restrictions. Test both linked and unlinked NPC tokens.
5. Switch scenes or delete the token. The label should disappear; check the browser console for errors.

## Technical boundaries

- Uses native Foundry v14 `hoverToken`, `refreshToken`, `updateActor`, `updateToken`, `deleteToken`, and `canvasTearDown` hooks, plus `Canvas.clientCoordinatesFromCanvas` for positioning.
- Uses a single pointer-transparent DOM label inserted with `textContent`, not HTML. It neither changes token nameplate resources nor writes Actor, Token, Scene, Journal, or other data.
- Calculates status from `actor.system.health.damage.{bashing,lethal,aggravated}` and each wound-level `total`. Extra health boxes are supported, and a potentially stale stored `traits.health.totalhealthlevels.max` is ignored.
- Wraith Corpus, Changeling chimerical tracks, and Mummy-specific overflow states are not supported. Unknown/unsupported shapes show **no** health label rather than a fabricated status.
- Honors `Token.isVisible` and GM-hidden restrictions. Does not bypass Foundry client visibility/ownership permissions.
- Placement is above the token in browser viewport pixels; actual position and font can vary with Foundry token nameplate settings, zoom and other UI modifications.
- Does not require or patch Health Estimate or WoD20 internals. Legacy detail-format functions remain internal but are no longer exposed as display choices.

## Rollback

Disable this module or restore the backed-up v0.2.0 module directory/ZIP, then reload the client. v0.2.0 has the previous dark popup and five display choices. For an older v0.1.x adapter rollback, restore the corresponding ZIP and re-enable Health Estimate in that world. No schema or Actor data migration occurs in v0.2.2.

## Verification

- **Automated:** Node tests validate wound calculations, standard and expanded tracks, status-only text, all eight color selectors, visibility, positioning, pan/zoom, event wiring, and no Actor mutation.
- **Static:** JavaScript syntax, Foundry manifest dependency/ZIP URL, CSS, ZIP structure and installer integrity.
- **Live:** The user's screenshot demonstrates that the earlier v0.2.0 hover renderer displayed in Foundry. The **v0.2.2 layout has not yet been tested live** in the user's Ubuntu Foundry instance.

**Project handoff:** The owning numbered handoff and `00-START-HERE.md` were not available in this conversation; update the module index and handoff when assigned.