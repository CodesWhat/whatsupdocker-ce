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
| #768 Skip/snooze a specific update version | Done | Added per-container update policy (`skip-current`, `snooze`, `clear`) stored in DB and exposed via API/UI |
| CI config cleanup | Done | Removed Code Climate stub, renamed to `ci.config.yml` (`540afe1`, `2e4e9a6`) |

## Planned / Open

| Item | Priority | Notes |
| --- | --- | --- |
| #891 Auth for remote Docker/Podman host API (Phase 2) | Medium | OIDC/device-flow style token acquisition and refresh for remote watcher auth |
| #794 Per-image config presets (imgset) | Medium | Allow shared include/tag/icon/link config by image ref, overrideable by labels; env-based presets initially |
| #777 Real-time Docker pull progress logging | Low | Add `followProgress` progress callback; consider rate-limited logging |
| #896 OIDC `checks.state` intermittent errors | Medium | Needs deeper repro and session/state handling validation |
| #881 `semverDiff` undefined in templates | Medium | Confirm path/rendering behavior for minor/patch and add tests |
| Tooling modernization: App `CommonJS` -> `ESM` migration | Medium | CJS still works, but ESM-only deps are increasing (`openid-client`, `snake-case` ecosystem); migrate in phases to reduce compatibility shims |

## Next Focus

1. Triage OIDC state issue (#896) with reproducible test case and logs.
2. Implement per-image config presets (`imgset`) (#794).
3. Scope #891 phase 2 token lifecycle support (OIDC/device flow).
4. Complete manual OIDC redirect/callback validation on `codex/esm-cutover-app`, then decide merge vs follow-up hardening tasks.

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

## Roadmap Detail: CommonJS to ESM Migration

Execution tracker: `/Users/sbenson/code/whatsupdocker-ce/docs/planning/esm-migration.md`

### Phase 0 (planning)

- Inventory CJS-specific patterns and runtime assumptions (`require`, `module.exports`, path handling, Jest config assumptions).
- Identify ESM blockers in test/tooling stack and lock a minimum compatible matrix.
- Define migration gates:
  - `app` build passes
  - full `app` and `ui` tests pass
  - no behavior regressions on auth/watcher flows

### Phase 1 (compatibility hardening)

- Reduce direct CJS coupling behind small adapters where needed.
- Remove ad-hoc ESM interop workarounds once equivalent native ESM paths are available.
- Keep behavior and API surface unchanged.

### Phase 2 (module switch)

- Move `app` TypeScript output to ESM (`module` / `moduleResolution` updates).
- Update import paths/extensions and runtime entrypoints.
- Align Jest/ts-jest/babel config with ESM execution.

### Phase 3 (cleanup)

- Remove temporary dual-mode shims and obsolete compatibility code.
- Document ESM conventions for contributors and future dependency upgrades.

## Compatibility Workarounds To Revert

- `Custom OIDC strategy shim` in `/Users/sbenson/code/whatsupdocker-ce/app/authentications/providers/oidc/OidcStrategy.ts`:
  Avoids direct inheritance from `openid-client` strategy to keep CJS/Jest compatibility.
  Revert target: use official `openid-client/passport` strategy path once ESM migration is complete.
- `OIDC test-level client mocks` in `/Users/sbenson/code/whatsupdocker-ce/app/authentications/providers/oidc/Oidc.test.ts` and `/Users/sbenson/code/whatsupdocker-ce/app/authentications/providers/oidc/OidcStrategy.test.ts`:
  Added to avoid importing ESM-only `openid-client` in current CJS test runtime.
  Revert target: use normal imports/integration-style tests after ESM + Jest alignment.
- `Local snake_case transform helper` in `/Users/sbenson/code/whatsupdocker-ce/app/model/container.ts`:
  Replaced direct `snake-case` usage due ESM-only package/runtime mismatch.
  Revert target: re-evaluate replacing helper with package-based implementation when module system is unified.
- `Jest major held at 29.x` in `/Users/sbenson/code/whatsupdocker-ce/app/package.json` and `/Users/sbenson/code/whatsupdocker-ce/ui/package.json`:
  `@vue/vue3-jest` currently requires `jest`/`babel-jest` `29.x`.
  Revert target: move to Jest 30+ when Vue test transformer/toolchain supports it.
