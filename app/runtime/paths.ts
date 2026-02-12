import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RUNTIME_MARKER_PATHS = [
  ['watchers', 'providers'],
  ['triggers', 'providers'],
  ['registries', 'providers'],
  ['authentications', 'providers'],
];

let cachedRuntimeRoot: string | undefined;

function getModuleDirectoryFromImportMeta() {
  try {
    const moduleUrl = new Function('return import.meta.url')();
    return path.dirname(fileURLToPath(moduleUrl));
  } catch {
    return undefined;
  }
}

const MODULE_DIRECTORY = getModuleDirectoryFromImportMeta();

function isDirectory(candidate: string) {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}

function hasRuntimeMarkers(candidate: string) {
  return RUNTIME_MARKER_PATHS.every((segments) => isDirectory(path.join(candidate, ...segments)));
}

function getRuntimeRootCandidates() {
  const candidates: string[] = [];
  if (MODULE_DIRECTORY) {
    const moduleRuntimeRoot = path.resolve(MODULE_DIRECTORY, '..');
    candidates.push(moduleRuntimeRoot);
  }

  if (process.argv[1]) {
    candidates.push(path.dirname(path.resolve(process.argv[1])));
  }

  candidates.push(
    process.cwd(),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'app'),
    path.resolve(process.cwd(), 'app', 'dist'),
  );

  return Array.from(new Set(candidates));
}

export function resolveRuntimeRoot() {
  if (cachedRuntimeRoot) {
    return cachedRuntimeRoot;
  }

  const runtimeRootCandidate = getRuntimeRootCandidates().find((candidate) =>
    hasRuntimeMarkers(candidate),
  );

  cachedRuntimeRoot = runtimeRootCandidate || process.cwd();
  return cachedRuntimeRoot;
}

export function resolveFromRuntimeRoot(...segments: string[]) {
  return path.resolve(resolveRuntimeRoot(), ...segments);
}

export function resolveUiDirectory() {
  const runtimeRoot = resolveRuntimeRoot();
  const uiCandidates = [path.resolve(runtimeRoot, 'ui'), path.resolve(runtimeRoot, '..', 'ui')];

  return uiCandidates.find((candidate) => isDirectory(candidate)) || uiCandidates[0];
}
