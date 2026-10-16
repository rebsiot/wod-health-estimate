# Test report — WoD20 Health Hover v0.2.0

**Date:** 2026-10-16  
**Verification class:** Automated/mock-tested; **not confirmed live**.

## Automated tests

**Result: 21 passed / 0 failed.** Run `node --test tests/*.test.mjs` (Node.js 20+). Unit tests simulate Actor damage data, Foundry hook callbacks, canvas coordinate conversion and a minimal DOM. They do **not** launch Foundry or Pixi.

Coverage:

- Healthy, bruised through incapacitated, mixed Bashing/Lethal/Aggravated; extended boxes and stale total-health trait; overflow clamping.
- Five display modes, custom wound labels, alternate splat exclusion, invalid input, 16-box track abbreviation.
- `Token.isVisible` / hidden NPC / GM exception / preview & destroyed tokens / scene boundary safety.
- Token-hover show/out, positioning with panning/zooming, offscreen suppression, viewport clamping and bottom flip.
- Actor changes, linked/unlinked token hooks, startup settings compatibility and canvas teardown.
- No Health Estimate provider calls, no Actor document mutation.

## Static/package checks

- JS syntax via Node `--check`.
- JSON manifest validated and required dependencies inspected.
- Manifest points to stable `main/module.json`; ZIP download has version-specific path.
- Archive has root `module.json` plus modules/styles/tests; no nested module folder; CRC check by `unzip -t`.

## Live test — outstanding

Use Foundry v14 with real WoD20 v7.3.x on Ubuntu. Disable Health Estimate, enable this module, hover a visible Mage or Vampire token, wound it via the native sheet, check all modes, player vision/hidden tokens, pan/zoom, unlinked NPC, scene switch, and clear wounds. Browser styling, update hooks and client permissions have **not yet** been verified in the real world.

No deployment, production update or Foundry console verification is claimed by this release.