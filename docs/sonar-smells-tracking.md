# Sonar Smell Cleanup Tracking

Status: completed

Notes:
- Line numbers from the report had drifted in several files; equivalent live code paths were updated.
- `ui/src/components/AppFooter.ts` does not exist in the current workspace; treated as already obsolete.
- Items already compliant in current code were verified and checked off.

## app/configuration/index.ts
- [x] L15 `String#replaceAll()` over `replace()`
- [x] L22 `String#replaceAll()` over `replace()`

## app/model/container.ts
- [x] L394 `String#replaceAll()` over `replace()`

## app/registries/Registry.ts
- [x] L115 remove unnecessary assertion
- [x] L286 remove unnecessary assertion
- [x] L311 remove unnecessary assertion
- [x] L422 avoid unexpected negated condition
- [x] L422 use `.includes()` over `.indexOf()`

## app/registries/providers/custom/Custom.ts
- [x] L47 use `.includes()` over `.indexOf()`

## app/registries/providers/gitlab/Gitlab.ts
- [x] L35 use `.includes()` over `.indexOf()`

## app/registry/index.ts
- [x] L95 handle exception or remove catch
- [x] L720 remove unnecessary assertion

## app/runtime/paths.ts
- [x] L51 avoid multiple `Array#push()` calls
- [x] L52 avoid multiple `Array#push()` calls
- [x] L53 avoid multiple `Array#push()` calls

## app/tag/index.ts
- [x] L16 avoid unexpected negated condition

## app/triggers/providers/Trigger.ts
- [x] L151 `String#replaceAll()` over `replace()`
- [x] L152 `String#replaceAll()` over `replace()`
- [x] L153 `String#replaceAll()` over `replace()`
- [x] L154 `String#replaceAll()` over `replace()`
- [x] L159 remove `any` override in union
- [x] L192 use `??` over ternary
- [x] L192 avoid unexpected negated condition
- [x] L297 `String#replaceAll()` over `replace()`
- [x] L299 avoid unexpected negated condition
- [x] L478 prefer `.at(...)`
- [x] L484 prefer `.at(...)`
- [x] L517 avoid unexpected negated condition
- [x] L878 remove unnecessary assertion
- [x] L887 remove unnecessary assertion
- [x] L896 remove unnecessary assertion

## app/triggers/providers/docker/Docker.ts
- [x] L283 prefer `.at(...)`
- [x] L578 avoid unexpected negated condition

## app/triggers/providers/dockercompose/Dockercompose.ts
- [x] L72 avoid object default stringification from `value ?? ''`

## app/triggers/providers/mqtt/Hass.ts
- [x] L25 `String#replaceAll()` over `replace()`
- [x] L397 `String#replaceAll()` over `replace()`

## app/triggers/providers/mqtt/Mqtt.ts
- [x] L22 `String#replaceAll()` over `replace()`

## app/triggers/providers/telegram/Telegram.ts
- [x] L11 `String#replaceAll()` over `replace()`
- [x] L11 use `String.raw` for escaped `\`
- [x] L21 `String#replaceAll()` over `replace()`
- [x] L22 `String#replaceAll()` over `replace()`
- [x] L23 `String#replaceAll()` over `replace()`
- [x] L24 `String#replaceAll()` over `replace()`
- [x] L25 `String#replaceAll()` over `replace()`

## app/watchers/providers/docker/Docker.ts
- [x] L228 use `RegExp.exec()`
- [x] L357 avoid unexpected negated condition
- [x] L395 handle exception or remove catch
- [x] L582 handle exception or remove catch
- [x] L909 handle exception or remove catch
- [x] L1154 remove useless empty object spread
- [x] L1233 avoid unexpected negated condition
- [x] L1358 avoid unexpected negated condition
- [x] L1584 avoid unexpected negated condition
- [x] L1949 use `??` over ternary
- [x] L2231 remove useless empty object spread
- [x] L2290 prefer `structuredClone(...)`
- [x] L2327 avoid unexpected negated condition
- [x] L2563 avoid unexpected negated condition

## ui/src/App.ts
- [x] L85 remove unnecessary conditional default assignment

## ui/src/components/AppBar.ts
- [x] L25 prefer `globalThis` over `window`

## ui/src/components/AppFooter.ts
- [x] L16 remove unnecessary assertion

## ui/src/components/ContainerDetail.ts
- [x] L17 remove unnecessary assertion

## ui/src/components/ContainerFilter.ts
- [x] L95 remove unnecessary assertion
- [x] L98 remove unnecessary assertion

## ui/src/components/ContainerImage.ts
- [x] L36 remove unnecessary assertion

## ui/src/components/ContainerItem.ts
- [x] L100 remove unnecessary assertion
- [x] L106 remove unnecessary assertion
- [x] L204 remove unnecessary assertion
- [x] L206 remove unnecessary assertion
- [x] L247 remove unnecessary assertion
- [x] L253 remove unnecessary assertion
- [x] L256 remove unnecessary assertion
- [x] L271 remove unnecessary assertion
- [x] L296 remove unnecessary assertion
- [x] L302 remove unnecessary assertion
- [x] L314 remove unnecessary assertion
- [x] L319 prefer `globalThis` over `window`
- [x] L324 remove unnecessary assertion
- [x] L324 remove unnecessary assertion (duplicate report)
- [x] L325 remove unnecessary assertion
- [x] L335 remove unnecessary assertion

## ui/src/components/ContainerTrigger.ts
- [x] L36 remove unnecessary assertion
- [x] L38 remove unnecessary assertion

## ui/src/components/ContainerUpdate.ts
- [x] L33 remove unnecessary assertion

## ui/src/components/LoginBasic.ts
- [x] L35 handle exception or remove catch
- [x] L36 remove unnecessary assertion

## ui/src/components/LoginBasic.vue
- [x] L4 set correct `autocomplete` attribute(s)

## ui/src/components/LoginOidc.ts
- [x] L22 prefer `globalThis` over `window`

## ui/src/components/SnackBar.ts
- [x] L38 remove unnecessary assertion

## ui/src/components/TriggerDetail.ts
- [x] L51 remove unnecessary assertion
- [x] L75 remove unnecessary assertion
- [x] L77 remove unnecessary assertion

## ui/src/router/index.ts
- [x] L104 avoid unexpected negated condition

## ui/src/services/auth.ts
- [x] L34 handle exception or remove catch

## ui/src/services/container.ts
- [x] L101 handle exception or remove catch

## ui/src/views/ContainersView.ts
- [x] L67 replace arrow with `Boolean`
- [x] L201 remove unnecessary assertion

## ui/src/views/LoginView.ts
- [x] L64 use `.some(...)` over `.find(...)`
- [x] L74 prefer `globalThis` over `window`
