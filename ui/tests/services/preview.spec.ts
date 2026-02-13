import { previewContainer } from '@/services/preview';

describe('preview service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls POST /api/containers/:id/preview', async () => {
    const mockResponse = { currentImage: 'nginx:1.0', newImage: 'nginx:1.1' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await previewContainer('abc-123');

    expect(global.fetch).toHaveBeenCalledWith('/api/containers/abc-123/preview', {
      method: 'POST',
      credentials: 'include',
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(previewContainer('bad-id')).rejects.toThrow('Preview failed: Not Found');
  });
});
