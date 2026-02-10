// @ts-nocheck
import log from '../log/index.js';

vi.mock('axios');
vi.mock('../prometheus/registry', () => ({
    getSummaryTags: () => ({
        observe: () => {},
    }),
}));

import Registry from './Registry.js';

const registry = new Registry();
registry.register('registry', 'hub', 'test', {});

test('base64Encode should decode credentials', async () => {
    expect(Registry.base64Encode('username', 'password')).toEqual(
        'dXNlcm5hbWU6cGFzc3dvcmQ=',
    );
});

test('getId should return registry type only', async () => {
    expect(registry.getId()).toStrictEqual('hub.test');
});

test('match should return false when not overridden', async () => {
    expect(registry.match({})).toBeFalsy();
});

test('normalizeImage should return same image when not overridden', async () => {
    expect(registry.normalizeImage({ x: 'x' })).toStrictEqual({ x: 'x' });
});

test('authenticate should return same request options when not overridden', async () => {
    expect(registry.authenticate({}, { x: 'x' })).resolves.toStrictEqual({
        x: 'x',
    });
});

test('getTags should sort tags z -> a', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        headers: {},
        data: { tags: ['v1', 'v2', 'v3'] },
    });
    expect(
        registryMocked.getTags({ name: 'test', registry: { url: 'test' } }),
    ).resolves.toStrictEqual(['v3', 'v2', 'v1']);
});

test('getImageManifestDigest should return digest for application/vnd.docker.distribution.manifest.list.v2+json then application/vnd.docker.distribution.manifest.v2+json', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = (options) => {
        if (
            options.headers.Accept ===
            'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json'
        ) {
            return {
                schemaVersion: 2,
                mediaType:
                    'application/vnd.docker.distribution.manifest.list.v2+json',
                manifests: [
                    {
                        platform: {
                            architecture: 'amd64',
                            os: 'linux',
                        },
                        digest: 'digest_x',
                        mediaType:
                            'application/vnd.docker.distribution.manifest.v2+json',
                    },
                    {
                        platform: {
                            architecture: 'armv7',
                            os: 'linux',
                        },
                        digest: 'digest_y',
                        mediaType: 'fail',
                    },
                ],
            };
        }
        if (
            options.headers.Accept ===
            'application/vnd.docker.distribution.manifest.v2+json'
        ) {
            return {
                headers: {
                    'docker-content-digest': '123456789',
                },
            };
        }
        throw new Error('Boom!');
    };
    expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: {
                value: 'tag',
            },
            registry: {
                url: 'url',
            },
        }),
    ).resolves.toStrictEqual({
        version: 2,
        digest: '123456789',
    });
});

test('getImageManifestDigest should return digest for application/vnd.docker.distribution.manifest.list.v2+json then application/vnd.docker.container.image.v1+json', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = (options) => {
        if (
            options.headers.Accept ===
            'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json'
        ) {
            return {
                schemaVersion: 2,
                mediaType:
                    'application/vnd.docker.distribution.manifest.list.v2+json',
                manifests: [
                    {
                        platform: {
                            architecture: 'amd64',
                            os: 'linux',
                        },
                        digest: 'digest_x',
                        mediaType:
                            'application/vnd.docker.container.image.v1+json',
                    },
                    {
                        platform: {
                            architecture: 'armv7',
                            os: 'linux',
                        },
                        digest: 'digest_y',
                        mediaType: 'fail',
                    },
                ],
            };
        }
        throw new Error('Boom!');
    };
    expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: {
                value: 'tag',
            },
            registry: {
                url: 'url',
            },
        }),
    ).resolves.toStrictEqual({
        version: 1,
        digest: 'digest_x',
    });
});

test('getImageManifestDigest should return digest for application/vnd.docker.distribution.manifest.v2+json', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = vi.fn((options) => {
        if (options.method === 'head') {
            return {
                headers: {
                    'docker-content-digest': '123456789',
                },
            };
        }

        return {
            schemaVersion: 2,
            mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
            config: {
                digest: 'digest_x',
                mediaType: 'application/vnd.docker.container.image.v1+json',
            },
        };
    });

    await expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: {
                value: 'tag',
            },
            registry: {
                url: 'url',
            },
        }),
    ).resolves.toStrictEqual({
        version: 2,
        digest: '123456789',
    });

    expect(registryMocked.callRegistry).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
            method: 'head',
            url: 'url/image/manifests/tag',
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.v2+json',
            },
            resolveWithFullResponse: true,
        }),
    );
});

test('getImageManifestDigest should return digest for application/vnd.docker.container.image.v1+json', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = (options) => {
        if (
            options.headers.Accept ===
            'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json'
        ) {
            return {
                schemaVersion: 1,
                history: [
                    {
                        v1Compatibility: JSON.stringify({
                            config: {
                                Image: 'xxxxxxxxxx',
                            },
                        }),
                    },
                ],
            };
        }
        throw new Error('Boom!');
    };
    expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: {
                value: 'tag',
            },
            registry: {
                url: 'url',
            },
        }),
    ).resolves.toStrictEqual({
        version: 1,
        digest: 'xxxxxxxxxx',
        created: undefined,
    });
});

test('getImageManifestDigest should throw when no digest found', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({});
    expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: {
                value: 'tag',
            },
            registry: {
                url: 'url',
            },
        }),
    ).rejects.toEqual(new Error('Unexpected error; no manifest found'));
});

test('callRegistry should call authenticate', async () => {
    const { default: axios } = await import('axios');
    axios.mockResolvedValue({ data: {} });
    const registryMocked = new Registry();
    registryMocked.log = log;
    const spyAuthenticate = vi.spyOn(registryMocked, 'authenticate');
    await registryMocked.callRegistry({
        image: {},
        url: 'url',
        method: 'get',
    });
    expect(spyAuthenticate).toHaveBeenCalledTimes(1);
});

test('callRegistry should observe metrics and rethrow on error', async () => {
    const { default: axios } = await import('axios');
    axios.mockRejectedValue(new Error('network error'));
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.type = 'hub';
    registryMocked.name = 'test';
    await expect(
        registryMocked.callRegistry({
            image: {},
            url: 'url',
            method: 'get',
        }),
    ).rejects.toThrow('network error');
});

test('callRegistry should return full response when resolveWithFullResponse is true', async () => {
    const { default: axios } = await import('axios');
    const mockResponse = { data: { tags: ['v1'] }, headers: {} };
    axios.mockResolvedValue(mockResponse);
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.type = 'hub';
    registryMocked.name = 'test';
    const result = await registryMocked.callRegistry({
        image: {},
        url: 'url',
        method: 'get',
        resolveWithFullResponse: true,
    });
    expect(result).toBe(mockResponse);
});

test('getAuthPull should return undefined by default', async () => {
    expect(await registry.getAuthPull()).toBeUndefined();
});

test('getImageManifestDigest should use digest parameter when provided', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = vi.fn((options) => {
        if (options.method === 'head') {
            return {
                headers: {
                    'docker-content-digest': 'digest-result',
                },
            };
        }
        return {
            schemaVersion: 2,
            mediaType: 'application/vnd.oci.image.manifest.v1+json',
        };
    });
    const result = await registryMocked.getImageManifestDigest(
        {
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: { value: 'tag' },
            registry: { url: 'url' },
        },
        'sha256:abc123',
    );
    expect(result).toStrictEqual({ version: 2, digest: 'digest-result' });
    expect(registryMocked.callRegistry).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
            url: 'url/image/manifests/sha256:abc123',
        }),
    );
});

test('getImageManifestDigest should select manifest by variant when multiple match', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = vi.fn((options) => {
        if (options.method === 'head') {
            return {
                headers: {
                    'docker-content-digest': 'variant-digest',
                },
            };
        }
        return {
            schemaVersion: 2,
            mediaType: 'application/vnd.oci.image.index.v1+json',
            manifests: [
                {
                    platform: { architecture: 'arm', os: 'linux' },
                    digest: 'digest_no_variant',
                    mediaType: 'application/vnd.oci.image.manifest.v1+json',
                },
                {
                    platform: { architecture: 'arm', os: 'linux', variant: 'v7' },
                    digest: 'digest_v7',
                    mediaType: 'application/vnd.oci.image.manifest.v1+json',
                },
            ],
        };
    });
    const result = await registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'arm',
        os: 'linux',
        variant: 'v7',
        tag: { value: 'tag' },
        registry: { url: 'url' },
    });
    expect(result).toStrictEqual({ version: 2, digest: 'variant-digest' });
});

test('getImageManifestDigest should handle oci.image.config.v1+json media type', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        schemaVersion: 2,
        mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json',
        manifests: [
            {
                platform: { architecture: 'amd64', os: 'linux' },
                digest: 'digest_oci_config',
                mediaType: 'application/vnd.oci.image.config.v1+json',
            },
        ],
    });
    const result = await registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'amd64',
        os: 'linux',
        tag: { value: 'tag' },
        registry: { url: 'url' },
    });
    expect(result).toStrictEqual({ version: 1, digest: 'digest_oci_config' });
});

test('getImageFullName should handle digest references', () => {
    const registryMocked = new Registry();
    const result = registryMocked.getImageFullName(
        { name: 'myimage', registry: { url: 'https://registry.example.com/v2' } },
        'sha256:abcdef',
    );
    expect(result).toBe('registry.example.com/myimage@sha256:abcdef');
});

test('getImageFullName should handle tag references', () => {
    const registryMocked = new Registry();
    const result = registryMocked.getImageFullName(
        { name: 'myimage', registry: { url: 'https://registry.example.com/v2' } },
        'latest',
    );
    expect(result).toBe('registry.example.com/myimage:latest');
});

test('getImageManifestDigest should handle no matching platform in manifest list', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        schemaVersion: 2,
        mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json',
        manifests: [
            {
                platform: { architecture: 'arm64', os: 'linux' },
                digest: 'digest_arm64',
                mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
            },
        ],
    });
    // No amd64 manifest exists, so no match => throws 'no manifest found'
    await expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: { value: 'tag' },
            registry: { url: 'url' },
        }),
    ).rejects.toThrow('Unexpected error; no manifest found');
});

test('getImageManifestDigest should pick first match when variant does not match any', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = vi.fn((options) => {
        if (options.method === 'head') {
            return {
                headers: {
                    'docker-content-digest': 'first-match-digest',
                },
            };
        }
        return {
            schemaVersion: 2,
            mediaType: 'application/vnd.oci.image.index.v1+json',
            manifests: [
                {
                    platform: { architecture: 'arm', os: 'linux' },
                    digest: 'digest_no_variant1',
                    mediaType: 'application/vnd.oci.image.manifest.v1+json',
                },
                {
                    platform: { architecture: 'arm', os: 'linux', variant: 'v6' },
                    digest: 'digest_v6',
                    mediaType: 'application/vnd.oci.image.manifest.v1+json',
                },
            ],
        };
    });
    // variant is v7 but only v6 exists - should pick first match (no_variant1)
    const result = await registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'arm',
        os: 'linux',
        variant: 'v7',
        tag: { value: 'tag' },
        registry: { url: 'url' },
    });
    expect(result).toStrictEqual({ version: 2, digest: 'first-match-digest' });
});

test('getTags should handle empty tags list', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        headers: {},
        data: { tags: [] },
    });
    const result = await registryMocked.getTags({ name: 'test', registry: { url: 'test' } });
    expect(result).toStrictEqual([]);
});

test('getTags should handle null tags in page response', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        headers: {},
        data: {},
    });
    const result = await registryMocked.getTags({ name: 'test', registry: { url: 'test' } });
    expect(result).toStrictEqual([]);
});

test('getTags should handle undefined data and tags in page', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        headers: {},
        data: undefined,
    });
    const result = await registryMocked.getTags({ name: 'test', registry: { url: 'test' } });
    expect(result).toStrictEqual([]);
});

test('getImageManifestDigest should handle undefined responseManifests', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => undefined;
    await expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: { value: 'tag' },
            registry: { url: 'url' },
        }),
    ).rejects.toThrow('Unexpected error; no manifest found');
});

test('getImageManifestDigest should handle manifest list with unknown media type', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    registryMocked.callRegistry = () => ({
        schemaVersion: 2,
        mediaType: 'application/vnd.unknown.type',
    });
    await expect(
        registryMocked.getImageManifestDigest({
            name: 'image',
            architecture: 'amd64',
            os: 'linux',
            tag: { value: 'tag' },
            registry: { url: 'url' },
        }),
    ).rejects.toThrow('Unexpected error; no manifest found');
});

test('getTags should paginate when link header is present', async () => {
    const registryMocked = new Registry();
    registryMocked.log = log;
    let callCount = 0;
    registryMocked.callRegistry = () => {
        callCount++;
        if (callCount === 1) {
            return {
                headers: { link: 'next' },
                data: { tags: ['v1', 'v2'] },
            };
        }
        return {
            headers: {},
            data: { tags: ['v3'] },
        };
    };
    const result = await registryMocked.getTags({ name: 'test', registry: { url: 'test' } });
    expect(result).toStrictEqual(['v3', 'v2', 'v1']);
});
