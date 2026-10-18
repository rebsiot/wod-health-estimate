# WoD20 Health Monitor (Health Hover)

Hover a visible Mage M20 or Vampire V20 token to see its **native WoD20 wound status** above the token, colored by severity and scaled with zoom. The module is read-only: it **does not change health** and **does not require Health Estimate**.

## Requirements

- Foundry VTT v14.
- **World of Darkness 20th Edition** game system (`worldofdarkness`; developed against the approximately v7.3.x series). Not a system-independent module.
- No additional module dependency.

## Install or update

In Foundry **Setup > Add-on Modules > Install Module**, paste this manifest URL:

`https://raw.githubusercontent.com/rebsiot/wod-health-estimate/main/module.json`

1. Before upgrading an existing installation, back up the folder `Data/modules/stl-wod20-health-estimate`.
2. Install or update the module using the manifest. Launch your WoD20 world.
3. In **Game Settings > Manage Modules**, look for **WoD20 Health Monitor (Health Hover)** and ensure its checkbox is enabled. The checkbox shows whether it is active in **this world**; an installed module is not necessarily enabled.
4. Save the module selection if prompted and refresh the Foundry client.
5. Hover a visible Mage or Vampire token. Its colored wound name (for example, **Wounded**) should appear above the token. Zoom in or out to confirm the label follows its size.

If the separate **Health Estimate** module is also enabled in that world, disable it to avoid duplicate hover labels. Other worlds can retain it.

For manual installation, stop Foundry before replacing files, then place this package's `module.json`, `scripts/`, and `styles/` directly in `Data/modules/stl-wod20-health-estimate/`. Restart Foundry and refresh clients.

## What it does

- Shows the Actor's native wound level, from Uninjured through Incapacitated, as compact colored text above the token.
- Follows token movement, canvas pan, and zoom; no black health panel or damage bar.
- Reads existing WoD20 health values without modifying Actors, Tokens, or Scenes.
- Keeps the original Foundry module ID `stl-wod20-health-estimate` so existing installations update in place.

## Limitations

- Hidden or nonvisible tokens do not display a player-visible health label, using Foundry's token visibility rules. Verify unusual vision setups in a player session.
- Placement and perceived font size may not exactly match every custom nameplate/theme or extreme zoom setting; the displayed font is bounded for legibility.
- Wraith Corpus, Changeling chimerical health, and Mummy-specific overflow conditions are not modeled.
- This module renames its **own Module Manager entry**. It is not a dashboard for whether other modules are enabled.

## Support and updates

- [Report a problem](https://github.com/rebsiot/wod-health-estimate/issues) (include Foundry, WoD20 and module versions).
- [Change history](CHANGELOG.md).
- The stable installation manifest is above. Historical ZIPs remain in the repository's `dist/` directory; do not assume a GitHub Releases page exists.

**License:** The repository currently has no published software license. Public visibility does not grant redistribution rights. The module contains no bundled Mage/Vampire book artwork or player data.