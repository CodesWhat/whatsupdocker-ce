import { execFile } from 'node:child_process';
import log from '../../log/index.js';

const MAX_OUTPUT_BYTES = 10 * 1024; // 10 KB
const DEFAULT_TIMEOUT_MS = 60_000; // 1 minute

export interface HookRunnerOptions {
  timeout?: number;
  env?: Record<string, string>;
  label: string;
}

export interface HookResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

/**
 * Run a shell command as a lifecycle hook.
 *
 * Uses `execFile` with `/bin/sh -c` to avoid shell injection through
 * unescaped arguments while still supporting shell syntax in the command.
 */
export async function runHook(command: string, options: HookRunnerOptions): Promise<HookResult> {
  const hookLog = log.child({ hook: options.label });
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;

  hookLog.info(`Running ${options.label} hook: ${command}`);

  return new Promise<HookResult>((resolve) => {
    const child = execFile(
      '/bin/sh',
      ['-c', command],
      {
        timeout,
        maxBuffer: MAX_OUTPUT_BYTES,
        env: { ...process.env, ...options.env },
      },
      (error, stdout, stderr) => {
        const timedOut = error !== null && 'killed' in error && error.killed === true;
        const exitCode = timedOut ? 1 : (error as any)?.code ?? child.exitCode ?? 0;

        const result: HookResult = {
          exitCode: typeof exitCode === 'number' ? exitCode : 1,
          stdout: typeof stdout === 'string' ? stdout.slice(0, MAX_OUTPUT_BYTES) : '',
          stderr: typeof stderr === 'string' ? stderr.slice(0, MAX_OUTPUT_BYTES) : '',
          timedOut,
        };

        if (timedOut) {
          hookLog.warn(`Hook ${options.label} timed out after ${timeout}ms`);
        } else if (result.exitCode !== 0) {
          hookLog.warn(
            `Hook ${options.label} failed with exit code ${result.exitCode}: ${result.stderr}`,
          );
        } else {
          hookLog.info(`Hook ${options.label} completed successfully`);
        }

        resolve(result);
      },
    );
  });
}
