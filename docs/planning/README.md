# Roadmap

Last updated: 2026-02-09

## Current State

`main` is stable and includes recent fixes for watcher/trigger reliability, agent mode, and docs/CI cleanup.

## Recently Completed

| Item | Status | Notes |
| --- | --- | --- |
| #910 Distributed Monitoring (Agent Mode) | Done | Merged to `main` (`f3cee9b`, `00968f3`) |
| #868 docker-compose `post_start` not run | Done | `dockercompose` trigger now executes post-start hooks (`7debff9`) |
| #878 Metrics endpoint auth toggle | Done | Added `WUD_SERVER_METRICS_AUTH` (`66f36f4`) |
| #882 NTFY threshold env handling | Done | Provider-level threshold support (`50ee000`) |
| #884 Docker watcher JSON chunk crash | Done | Event stream buffering/parsing hardened (`dea5b05`) |
| #885 Multi-network container recreate failure | Done | Recreate now connects extra networks after create (`40adf42`) |
| #887 Remote watcher delayed first scan | Done | `watchatstart` now checks watcher-local store (`7ff0f24`) |
| #891 Auth for remote Docker/Podman host API (Phase 1) | Done | Added remote watcher HTTPS auth (`Basic` + `Bearer`) for `WUD_WATCHER_{name}_HOST`, with TLS/mTLS compatibility |
| #875 Support `dhi.io` registry | Done | Added DHI provider, matcher, auth flow, and docs |
| #770 Container name stuck on temporary name | Done | Docker event processing now refreshes container name and auto display name on rename/state updates |
| CI config cleanup | Done | Removed Code Climate stub, renamed to `ci.config.yml` (`540afe1`, `2e4e9a6`) |

## Planned / Open

| Item | Priority | Notes |
| --- | --- | --- |
| #891 Auth for remote Docker/Podman host API (Phase 2) | Medium | OIDC/device-flow style token acquisition and refresh for remote watcher auth |
| #768 Skip/snooze a specific update version | Medium | Add per-container skip list and optional TTL-based snooze (stored in DB, not labels) |
| #794 Per-image config presets (imgset) | Medium | Allow shared include/tag/icon/link config by image ref, overrideable by labels; env-based presets initially |
| #777 Real-time Docker pull progress logging | Low | Add `followProgress` progress callback; consider rate-limited logging |
| #896 OIDC `checks.state` intermittent errors | Medium | Needs deeper repro and session/state handling validation |
| #881 `semverDiff` undefined in templates | Medium | Confirm path/rendering behavior for minor/patch and add tests |

## Next Focus

1. Triage OIDC state issue (#896) with reproducible test case and logs.
2. Implement skip/snooze per-container update controls (#768).
3. Scope #891 phase 2 token lifecycle support (OIDC/device flow).

## Roadmap Detail: #891

### Phase 1 (done)

- Add remote watcher HTTP authentication for upstream `WUD_WATCHER_{name}_HOST` endpoints:
  - `Basic` auth
  - `Bearer` token auth
- Scope this to HTTPS remote endpoints.
- Keep existing mTLS options unchanged:
  - `WUD_WATCHER_{name}_CAFILE`
  - `WUD_WATCHER_{name}_CERTFILE`
  - `WUD_WATCHER_{name}_KEYFILE`

### Phase 2 (later)

- Evaluate/implement full OIDC client flow for remote watcher upstream auth:
  - token acquisition
  - token refresh
