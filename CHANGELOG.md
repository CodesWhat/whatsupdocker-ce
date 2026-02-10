# Changelog — drydock

This changelog covers all changes in **drydock** since forking from [getwud/wud](https://github.com/getwud/wud) upstream.

**Fork point:** upstream post-8.1.1 (2025-11-27)
**Upstream baseline:** WUD 8.1.1 + 65 merged PRs on `main` (Vue 3 migration, Alpine base image, Rocket.Chat trigger, threshold system, semver improvements, request→axios migration, and more)

---

## 2026.2.2

### Security / CI

- **Cosign keyless signing** — Container image releases are now signed with Sigstore cosign keyless signing for supply chain integrity.
- **Least-privilege workflow permissions** — Replaced overly broad `read-all` with minimum specific permissions across all CI/CD workflows.
- **CodeQL and Scorecard fixes** — Resolved all high-severity CodeQL and OpenSSF Scorecard security alerts.
- **Pinned CI actions** — All CI action references pinned to commit hashes with Dockerfile base image digest.

### Testing

- **97% test coverage** — Boosted from 76% to 97% with 449 new tests (1,254 total across 95 test files).
- **Fuzz testing** — Added property-based fuzz tests with fast-check for Docker image name parsing.

### Code Quality

- **Static analysis fixes** — Optional chaining, `String#replaceAll()`, `readonly` modifiers, `Number.NaN`, concise regex syntax, removed unused imports, moved functions to outer scope.
- **Reduced code duplication** — Refactored duplicated code in registries, triggers, and store test files flagged by SonarCloud.

### Dependencies

- **Pino logging** — Replaced bunyan with pino to eliminate vulnerable transitive dependencies. Added pino-pretty for human-readable log output.

### Maintenance

- **Renamed wud to drydock** — Project references updated from upstream naming across Dockerfile, entrypoint, package files, scripts, and test fixtures.
- **CONTRIBUTING.md** — Added contributor guidelines.
- **OpenSSF Best Practices badge** — Added to README.
- **SonarCloud integration** — Added project configuration.

### Features

- **Auto-dismiss notifications after container update** — New `resolvenotifications` option for triggers (default: `false`). When enabled, notification triggers automatically delete the sent message after the Docker trigger successfully updates the container. Implemented for Gotify via its `deleteMessage` API. Other providers (Slack, Discord, ntfy) can add support by overriding the new `dismiss()` method on the base Trigger class. New `containerUpdateApplied` event emitted by the Docker trigger on successful update.

### Bug Fixes

- **Agent mode Prometheus crash** — Guard `getWatchContainerGauge().set()` against undefined in Agent mode where Prometheus is not initialized, fixing "Cannot read properties of undefined (reading 'set')" crash (#23)
- **Sanitize version logging** — Sanitize version strings from env vars before logging to resolve CodeQL clear-text-logging alerts in `index.ts` and `store/migrate.ts`
- **Broken event test assertion** — Fix `expect()` without matcher in event test

### Infrastructure

- **Multi-arch container images** — Docker images now built for both `linux/amd64` and `linux/arm64` architectures, published to GHCR
- **Lefthook pre-push hooks** — Added lefthook config with pre-push checks (lint + build + test) and `npm run check` convenience script
- **CodeQL query exclusion** — Exclude `js/clear-text-logging` query (false positives on DD_VERSION env var)

---

## 2026.1.0 (398 files changed)

### Architecture / Tooling

- **TypeScript migration (app)** — Entire backend converted from JavaScript to TypeScript with ES Modules (`NodeNext`). 232 `.ts` files added/renamed, all `.js` source files removed.
- **TypeScript migration (UI)** — Vue 3 frontend migrated from JS to TS. 29 `.vue` files updated, component props/emits typed.
- **Jest → Vitest (app)** — All 64 app test files (664 tests) migrated from Jest to Vitest. Test runner unified across app and UI.
- **Jest → Vitest (UI)** — UI unit tests migrated from Jest to Vitest with improved coverage.
- **Vitest 4 + modern deps** — Upgraded vitest 3→4, uuid 11→13, flat 5→6, snake-case 3→4. Fixed vitest 4 mock constructor breaking change.
- **ESM baseline** — Cut over to `NodeNext` module resolution. Removed Babel, added `tsconfig.json`.
- **Biome linter** — Replaced ESLint with Biome for formatting and linting.
- **CI cleanup** — Removed Code Climate config, renamed Travis config to `ci.config.yml`.

### Features

- **Agent mode** — Distributed monitoring with remote agent architecture. Agent components, SSE-based communication, dedicated API routes.
- **OIDC token lifecycle** — Remote watcher HTTPS auth with `Basic` + `Bearer` token support. TLS/mTLS compatibility for `DD_WATCHER_{name}_HOST`.
- **OIDC device-flow (Phase 2)** — RFC 8628 Device Authorization Grant for headless remote watcher auth. Auto-detection, polling with backoff, and refresh token rotation.
- **Per-image config presets** — `imgset` defaults for per-image configuration. Added `watchDigest` and `inspectTagPath` imgset properties.
- **Hybrid triggers** — Trigger group defaults (`DD_TRIGGER_{name}_THRESHOLD`) shared across providers. Name-only include/exclude for multi-provider trigger management.
- **Container update policy** — Skip/snooze specific update versions. Per-container policy stored in DB, exposed via API and UI.
- **Metrics auth toggle** — `DD_SERVER_METRICS_AUTH` env var to disable auth on `/metrics` endpoint.
- **Trigger thresholds** — Digest and no-digest thresholds for triggers.
- **NTFY provider-level threshold** — Provider-level threshold support for ntfy trigger.
- **Docker pull progress logging** — Rate-limited pull progress output during docker-compose updates.
- **Registry lookup image override** — `lookupImage` field on registry config to override the image used for tag lookups.
- **Docker inspect tag path** — Support custom tag path in Docker inspect output.
- **Anonymous LSCR and TrueForge registries** — Allow anonymous access to LSCR (LinuxServer) and Quay-backed TrueForge.
- **DHI registry** — New `dhi.io` registry provider with matcher, auth flow, and docs.
- **Custom URL icons** — Support URL-based icons via `dd.display.icon` label.
- **Version skip** — Skip specific versions in the UI.
- **Log viewer** — In-app log viewer.
- **Semver tag recovery** — Recover include-filter mismatched semver tags from watchers. Extended to advise best semver tag when current tag is non-semver (e.g., `latest`).
- **Dashboard update chips** — Replaced verbose update status text with compact colored chips: green "up to date" or warning "N update(s)" (clickable).

### Bug Fixes

- **eval() code injection** — Replaced `eval()` in trigger template rendering with safe expression evaluator supporting property paths, method allowlist, ternaries, and string concatenation.
- **Digest-only update prune crash** — Docker trigger prune logic now correctly excludes current image during digest-only updates and handles post-prune errors gracefully.
- **Swarm deploy-label debug logging** — Added warn-level logging when Swarm service inspect fails, and debug logging showing which label sources contain `dd.*` labels.
- **OIDC session state races** — Serialized redirect session checks, multiple pending callback states per session.
- **semverDiff undefined** — Normalized `semverDiff` for non-tag (digest-only/created-date-only) updates.
- **Docker event stream crash** — Buffered and parsed split Docker event stream payloads.
- **Multi-network container recreate** — Reconnects additional networks after container recreation.
- **Remote watcher delayed first scan** — `watchatstart` now checks watcher-local store for new remote watchers.
- **docker-compose post_start hooks** — Hooks now execute after updates.
- **docker-compose image-only triggers** — Only trigger on compose services with actual image changes.
- **docker-compose imageless services** — Skip compose services without an `image` field.
- **docker-compose implicit latest tag** — Normalize `image: nginx` to `image: nginx:latest` so compose triggers don't treat implicit latest as a version mismatch.
- **Express 5 wildcard routes** — Named wildcard route params for express 5 compatibility.
- **Semver filtering** — Fixed semver part filtering and prefix handling.
- **SMTP TLS_VERIFY inverted** — `rejectUnauthorized` was inverted; `TLS_VERIFY=false` now correctly allows self-signed certificates.
- **HA MQTT deprecated object_id** — Replaced `object_id` with `default_entity_id` for Home Assistant 2025.10+ compatibility.
- **Open redirect on authenticated pages** — Validate `next` query parameter to only allow internal routes.
- **Trigger test updateKind crash** — Test-button triggers no longer crash with "Cannot read properties of undefined (reading 'updateKind')" on unvalidated containers.
- **Docker rename event not captured** — Added `rename` to Docker event listener so container name updates are captured after compose recreates.
- **UI duplicate drawer logo** — Removed duplicate logo in navigation drawer.

### Dependencies

| Package | Upstream (8.1.1) | drydock |
| --- | --- | --- |
| vitest | 3.x (Jest) | 4.x |
| uuid | 9.x | 13.x |
| flat | 5.x | 6.x |
| snake-case | 3.x | 4.x |
| express | 4.x | 5.x |
| typescript | — | 5.9 |
| biome | — | 2.3 |

### Stats

| Metric | Value |
| --- | --- |
| Files changed | 392 |
| Insertions | +25,725 |
| Deletions | -25,995 |
| App tests | 709 (vitest) |
| UI tests | 163 (vitest) |
| Total tests | 872 |

---

## Upstream Backports

The following changes from `upstream/main` (post-fork) have been ported to drydock:

| Description | Status |
| --- | --- |
| Add Codeberg to default registries | Ported (new TS provider) |
| Increase `maxAliasCount` in YAML parsing | Ported |
| Fix authentication for private ECR registry (async `getAuthPull`) | Ported across all registries |
| Prometheus: add `DD_PROMETHEUS_ENABLED` config | Ported |
| Fix Authelia OIDC docs (field names) | Ported |
| Buffer Docker event stream before JSON parse | Already fixed independently |
| SMTP trigger: allow display name in from address ([#908](https://github.com/getwud/wud/pull/908)) | Ported |

Remaining upstream-only changes (not ported — not applicable to drydock):

| Description | Reason |
| --- | --- |
| Fix e2e tests (x2) | JS-based, drydock tests are TS |
| Fix prettier | drydock uses Biome |
| Fix codeberg tests | Covered by drydock's own tests |
| Update changelog | Upstream-specific |
