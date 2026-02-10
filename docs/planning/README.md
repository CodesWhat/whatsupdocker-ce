# Roadmap

Last updated: 2026-02-09

## Current State

`main` is stable. ESM migration complete, all tests on Vitest, recent fixes shipped.

## Planned / Open

No open items — all tracked issues resolved.

## Completed

| Item | Notes |
| --- | --- |
| #891 Auth for remote Docker/Podman host API (Phase 2) | OIDC device-flow (RFC 8628) with auto-detection, polling, backoff, and refresh token rotation |
| #794 Per-image config presets (imgset) | Feature complete — added `watchDigest` and `inspectTagPath` imgset properties |
| #909 Custom `dd.display.icon` | Already complete — URL-based icons, Homarr Labs, Selfh.st, Simple Icons, and MDI support |
| #906 Hybrid Triggers | Trigger group defaults and name-only include/exclude for multi-provider trigger management |
| #851 Status text overflows container box | Already complete — compact `v-chip` badges with absolute positioning |
| #843 Advise tag-change if include-filter doesn't match | Added non-semver to semver tag advice when `includeTags` filter is set |
| #870 Lower semver detected as update | Numeric segment matching prevents cross-version-depth comparisons |
| #866 Old semver tag considered for update | Same fix as #870; prefix + segment filtering prevents year-based tags |
| #862 Digest-only changes not triggering update | Fixed Docker trigger prune logic for digest-only updates |
| #911 `dd.tag.include` regex inconsistency | Already fixed in 2026.1.0 via Swarm service label lookup; added debug logging |
| #789 eval() code injection in triggers | Replaced unsafe `eval()` with safe template interpolation |
| #910 Distributed Monitoring (Agent Mode) | Merged to `main` (`f3cee9b`, `00968f3`) |
| #868 docker-compose `post_start` not run | `dockercompose` trigger now executes post-start hooks (`7debff9`) |
| #878 Metrics endpoint auth toggle | Added `DD_SERVER_METRICS_AUTH` (`66f36f4`) |
| #882 NTFY threshold env handling | Provider-level threshold support (`50ee000`) |
| #884 Docker watcher JSON chunk crash | Event stream buffering/parsing hardened (`dea5b05`) |
| #885 Multi-network container recreate failure | Recreate now connects extra networks after create (`40adf42`) |
| #887 Remote watcher delayed first scan | `watchatstart` now checks watcher-local store (`7ff0f24`) |
| #891 Auth for remote Docker/Podman host API (Phase 1) | Added remote watcher HTTPS auth (`Basic` + `Bearer`) for `DD_WATCHER_{name}_HOST`, with TLS/mTLS compatibility |
| #875 Support `dhi.io` registry | Added DHI provider, matcher, auth flow, and docs |
| #770 Container name stuck on temporary name | Docker event processing now refreshes container name and auto display name on rename/state updates |
| #768 Skip/snooze a specific update version | Added per-container update policy (`skip-current`, `snooze`, `clear`) stored in DB and exposed via API/UI |
| #777 Real-time Docker pull progress logging | Rate-limited pull progress logging added (`828bc86`) |
| #896 OIDC `checks.state` intermittent errors | Session race hardening (`e365a3e`) |
| #881 `semverDiff` undefined in templates | Normalized for non-tag updates (`d75a4ee`) |
| Tooling: CommonJS to ESM migration | App runtime on NodeNext ESM; both app and UI tests on Vitest; Jest fully removed |
| CI config cleanup | Removed Code Climate stub, renamed to `ci.config.yml` (`540afe1`, `2e4e9a6`) |
