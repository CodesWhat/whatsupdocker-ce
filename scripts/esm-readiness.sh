#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STRICT_MODE=0

if [[ "${1:-}" == "--strict" ]]; then
    STRICT_MODE=1
fi

print_header() {
    printf "\n== %s ==\n" "$1"
}

print_or_none() {
    local value="$1"
    if [[ -n "$value" ]]; then
        printf "%s\n" "$value"
    else
        echo "none"
    fi
}

print_header "Runtime CJS Patterns In app/ (non-test)"
runtime_hits="$(
    rg -n --no-heading --color never \
        '\brequire\(|module\.exports|__dirname|__filename' \
        "$ROOT_DIR/app" \
        -g '!**/node_modules/**' \
        -g '!**/dist/**' \
        -g '!**/coverage/**' \
        -g '!**/jest.config.cjs' \
        -g '!**/*.test.ts' \
        -g '!**/*.spec.ts' || true
)"
print_or_none "$runtime_hits"

runtime_files=""
if [[ -n "$runtime_hits" ]]; then
    runtime_files="$(
        printf "%s\n" "$runtime_hits" \
            | cut -d: -f1 \
            | sed "s|$ROOT_DIR/||" \
            | sort -u
    )"
fi

unknown_runtime_files=""
if [[ -n "$runtime_files" ]]; then
    unknown_runtime_files="$runtime_files"
fi

if [[ -n "$unknown_runtime_files" ]]; then
    print_header "Unexpected Runtime CJS File(s)"
    printf "%s\n" "$unknown_runtime_files"
    if [[ "$STRICT_MODE" -eq 1 ]]; then
        echo "strict mode: failing due to unexpected runtime CJS usage"
        exit 1
    fi
fi

print_header "Known ESM Interop Workaround(s)"
interop_hits="$(
    rg -n --no-heading --color never \
        'new Function\(.+import\("openid-client"\)' \
        "$ROOT_DIR/app/authentications/providers/oidc" \
        -g '!**/*.test.ts' || true
)"
print_or_none "$interop_hits"

print_header "CJS Tooling Config Files"
tooling_hits="$(
    find "$ROOT_DIR" -maxdepth 2 -type f \
        \( -name '*.cjs' -o -name 'babel.config.js' -o -name 'vue.config.js' -o -name 'jest.config.js' \) \
        | sed "s|$ROOT_DIR/||" \
        | sort
)"
print_or_none "$tooling_hits"

print_header "Jest / Transformer Version Constraints"
version_hits="$(
    rg -n --no-heading --color never \
        '"jest"|"babel-jest"|"jest-environment-jsdom"|"@vue/vue3-jest"' \
        "$ROOT_DIR/app/package.json" \
        "$ROOT_DIR/ui/package.json" || true
)"
print_or_none "$version_hits"

print_header "TypeScript ESM Smoke Check (app)"
if (
    cd "$ROOT_DIR/app" &&
        npx tsc \
            --noEmit \
            --project tsconfig.json \
            --module NodeNext \
            --moduleResolution NodeNext >/dev/null 2>&1
); then
    echo "pass"
else
    echo "fail"
    if [[ "$STRICT_MODE" -eq 1 ]]; then
        echo "strict mode: failing due to TypeScript ESM smoke check error"
        exit 1
    fi
fi

print_header "Done"
echo "esm readiness audit complete"
