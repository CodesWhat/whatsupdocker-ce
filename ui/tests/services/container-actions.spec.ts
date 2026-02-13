import { restartContainer, startContainer, stopContainer } from '@/services/container-actions';

global.fetch = vi.fn();

describe('Container Actions Service', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  describe('startContainer', () => {
    it('posts to start endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Container started' }),
      } as any);

      const result = await startContainer('abc123');

      expect(fetch).toHaveBeenCalledWith('/api/containers/abc123/start', {
        method: 'POST',
        credentials: 'include',
      });
      expect(result).toEqual({ message: 'Container started' });
    });

    it('throws with server error message on failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Feature disabled' }),
      } as any);

      await expect(startContainer('abc123')).rejects.toThrow('Feature disabled');
    });

    it('throws with statusText when response body parsing fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('parse error');
        },
      } as any);

      await expect(startContainer('abc123')).rejects.toThrow(
        'Failed to start container: Internal Server Error',
      );
    });
  });

  describe('stopContainer', () => {
    it('posts to stop endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Container stopped' }),
      } as any);

      const result = await stopContainer('abc123');

      expect(fetch).toHaveBeenCalledWith('/api/containers/abc123/stop', {
        method: 'POST',
        credentials: 'include',
      });
      expect(result).toEqual({ message: 'Container stopped' });
    });

    it('throws with server error message on failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Feature disabled' }),
      } as any);

      await expect(stopContainer('abc123')).rejects.toThrow('Feature disabled');
    });

    it('throws with statusText when response body parsing fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('parse error');
        },
      } as any);

      await expect(stopContainer('abc123')).rejects.toThrow(
        'Failed to stop container: Internal Server Error',
      );
    });
  });

  describe('restartContainer', () => {
    it('posts to restart endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Container restarted' }),
      } as any);

      const result = await restartContainer('abc123');

      expect(fetch).toHaveBeenCalledWith('/api/containers/abc123/restart', {
        method: 'POST',
        credentials: 'include',
      });
      expect(result).toEqual({ message: 'Container restarted' });
    });

    it('throws with server error message on failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Feature disabled' }),
      } as any);

      await expect(restartContainer('abc123')).rejects.toThrow('Feature disabled');
    });

    it('throws with statusText when response body parsing fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('parse error');
        },
      } as any);

      await expect(restartContainer('abc123')).rejects.toThrow(
        'Failed to restart container: Internal Server Error',
      );
    });
  });
});
