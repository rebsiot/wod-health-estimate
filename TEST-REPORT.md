# Test report — v0.1.1 — 2026-10-16

**Local automated result:** 16 tests passed, 0 failed (`node --test tests/*.test.mjs`).

## Test classes

1. **Data-model unit tests:** actual track box totals (including extended tracks), WoD wound thresholds, zero/excess damage, narrative clues, health bars, type tracks, exact counts, localization fallback and unsupported alternate tracks.
2. **Health Estimate integration mocks:** provider fraction, patched text while preserving colors, disabled auto-death at zero, explicit defeated/dead flags, hidden estimate and fallback for other schemas. These are **mock tests**, not a Foundry execution environment.
3. **Static checks:** JavaScript syntax, JSON manifests, ZIP contents/integrity.

## Limitations

- No live Foundry v14 browser/canvas rendered.
- No live WoD20 actor updates, permissions, unlinked/linked tokens, NPC sheets, alternate splats, or multi-client checks.
- Health Estimate may alter its extension surface in later releases; version 35.x was inspected, not exercised in a real world.

## Required acceptance test

Hover a Mage and Vampire in the user's Foundry 14 + WoD20 world after applying several real wound combinations, switch each mode, check bars and labels, hide an NPC estimate, mark a Vampire incapacitated without explicit death, and mark a token defeated. Verify browser logs are clean. Record the exact module versions and outcome as **Confirmed live** only after it is observed.

## v0.1.1 manifest/publication checks

- Node health model/mock integration tests rerun with no runtime code changes.
- Valid JSON manifest and URL metadata with a stable `manifest` URL and versioned `download` ZIP URL.
- `module.json` placed at ZIP root; archive contents checked against source and ZIP CRC.
- **GitHub reachability:** requires separate post-commit verification. **Live Foundry install:** not performed.