// @ts-nocheck
import { type HookResult, runHook } from './HookRunner.js';

vi.mock('../../log/index.js', () => ({
  default: {
    child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
  },
}));

describe('HookRunner', () => {
  test('should execute a command successfully', async () => {
    const result = await runHook('echo hello', { label: 'test' });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('hello');
    expect(result.stderr).toBe('');
    expect(result.timedOut).toBe(false);
  });

  test('should capture non-zero exit code', async () => {
    const result = await runHook('exit 42', { label: 'test' });
    expect(result.exitCode).toBe(42);
    expect(result.timedOut).toBe(false);
  });

  test('should capture stderr output', async () => {
    const result = await runHook('echo oops >&2; exit 1', { label: 'test' });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.trim()).toBe('oops');
    expect(result.timedOut).toBe(false);
  });

  test('should handle timeout', async () => {
    const result = await runHook('sleep 10', { label: 'test', timeout: 200 });
    expect(result.timedOut).toBe(true);
    expect(result.exitCode).toBe(1);
  }, 10_000);

  test('should pass environment variables', async () => {
    const result = await runHook('echo $MY_VAR', {
      label: 'test',
      env: { MY_VAR: 'hello-hook' },
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('hello-hook');
  });

  test('should truncate stdout to 10KB', async () => {
    // Generate output larger than 10KB
    const result = await runHook('python3 -c "print(\'x\' * 20000)" 2>/dev/null || printf "%0.sx" $(seq 1 20000)', {
      label: 'test',
    });
    expect(result.stdout.length).toBeLessThanOrEqual(10 * 1024);
  });

  test('should use default timeout of 60000ms', async () => {
    // Just confirm it runs without specifying timeout
    const result = await runHook('echo ok', { label: 'test' });
    expect(result.exitCode).toBe(0);
  });
});
