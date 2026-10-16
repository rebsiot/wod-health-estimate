# WoD20 Health Hover v0.2.2 — test report

**Release date:** 2026-10-16  
**Changes:** Status-only wound label placed above the token, scaling with on-screen token height and colored by actual wound level; no previous dark box or bar; Health Estimate still not required.

## Automated/mock validation

Executed on Node.js v22.16.0:

`node --test tests/*.test.mjs`

**24 tests passed; 0 failures**. Coverage:

- Native seven-level WoD20 wound thresholds plus Uninjured, type damage, extended health boxes and non-death incapacitation.
- Prior damage formatter helper regression (unused by new visible UI), new status-only output and localization.
- Eight `data-wound` colors, transparent borderless nameplate typography, and no status text embellishment or bar.
- Native Token.isVisible/GM hidden restrictions, missing Actor data, unsafe text content safety, visibility teardown.
- Position above the token, zoom-aware font size, movement/camera transforms, viewport edge clamping and animation loop cleanup.
- Native startup hook wiring; stale v0.2.0 client displayMode settings cannot affect status-only output.

## Static/package validation

- `node --check` on all JS/MJS scripts and tests: passed.
- `module.json` valid JSON; ID unchanged, v0.2.2; requires only `worldofdarkness`, manifest unchanged, download URL points to v0.2.2 ZIP.
- CSS has eight defined wound-level colors; neutral text styling with no background/border/box shadow.
- ZIP contains full standalone install, with `module.json` directly at archive root; ZIP integrity verified.
- Contents can be unpacked and run through Node's test suite in isolation.

## Live Foundry/browser

**Not tested in this environment.** The user provided screenshots confirming the **prior v0.2.0 and v0.2.1** tooltips display; this does not verify the new v0.2.2 rendering or compatibility with this world's nameplate settings. First live verification: hover the same wounded token after updating and hard-reloading and verify it reads only `Wounded`, in orange directly above the token, changing font size with zoom.

## Limitations

- CSS typography/position may need live fine-tuning for atypical token sizes, zoom or third-party nameplate modules.
- Unsupported splat health tracks remain untouched.
- This release does not write/migrate any world or actor data.