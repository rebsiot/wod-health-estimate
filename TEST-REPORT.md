# v0.2.3 verification - WoD20 Health Monitor (Health Hover)

- **Source baseline:** User-confirmed v0.2.2 ZIP (`stl-wod20-health-estimate-0.2.2.zip`) and inspected GitHub main commit `7ce179e7ee35c911e663bc5ce5e11fa0209ebecf`.
- **Scope:** Foundry-facing `module.json.title` rename, patch version, package URL and user instructions. No runtime JavaScript or CSS changes, no data migration, no module ID change.
- **Automated/mock:** Run the repository's 24 Node tests with `node --test tests/*.test.mjs`; validate new manifest and ZIP. Record the actual outcome before claiming success.
- **Confirmed live (prior release only):** User confirmed that v0.2.2 health-hover placement/zoom worked perfectly in their Foundry environment. Their report did not separately establish hidden-token/player visibility.
- **Live v0.2.3:** Not yet run. Next test: update in Foundry, check **Game Settings > Manage Modules**, verify the new display name and checked enabled state, then hover the same token.
- **Rollback:** Restore the backed-up v0.2.2 module folder or install its versioned ZIP; no Actor/Scene/Journal changes to revert.
- **Release publication:** Distinguish published source/ZIP/manifest from a GitHub release tag and from an actual installed world update.