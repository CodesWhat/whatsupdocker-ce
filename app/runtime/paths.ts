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

function normalizeConfiguredPathValue(candidate: string, label: string) {
  if (typeof candidate !== 'string') {
    throw new TypeError(`${label} must be a string`);
  }
  const normalized = candidate.trim();
  if (!normalized) {
    throw new Error(`${label} cannot be empty`);
  }
  if (normalized.includes('\0')) {
    throw new Error(`${label} contains invalid null byte`);
  }
  return normalized;
}

export function resolveConfiguredPath(
  candidate: string,
  options: { label?: string; baseDir?: string; allowAbsolute?: boolean } = {},
) {
  const { label = 'Path', baseDir = process.cwd(), allowAbsolute = true } = options;
  const normalizedCandidate = normalizeConfiguredPathValue(candidate, label);
  if (!allowAbsolute && path.isAbsolute(normalizedCandidate)) {
    throw new Error(`${label} must be a relative path`);
  }
  return path.resolve(baseDir, normalizedCandidate);
}

export function resolveConfiguredPathWithinBase(
  baseDir: string,
  candidate: string,
  options: { label?: string } = {},
) {
  const { label = 'Path' } = options;
  const normalizedBaseDir = path.resolve(baseDir);
  const resolvedCandidate = resolveConfiguredPath(candidate, {
    label,
    baseDir: normalizedBaseDir,
    allowAbsolute: false,
  });
  const basePrefix = normalizedBaseDir.endsWith(path.sep)
    ? normalizedBaseDir
    : `${normalizedBaseDir}${path.sep}`;
  if (resolvedCandidate !== normalizedBaseDir && !resolvedCandidate.startsWith(basePrefix)) {
    throw new Error(`${label} must stay inside ${normalizedBaseDir}`);
  }
  return resolvedCandidate;
}

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
