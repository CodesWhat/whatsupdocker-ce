// @ts-nocheck
import joi from 'joi';
import Docker from './Docker.js';
import log from '../../../log/index.js';

const configurationValid = {
    prune: false,
    dryrun: false,
    threshold: 'all',
    mode: 'simple',
    once: true,
    auto: true,
    order: 100,
    autoremovetimeout: 10000,
    simpletitle:
        'New ${container.updateKind.kind} found for container ${container.name}',
    simplebody:
        'Container ${container.name} running with ${container.updateKind.kind} ${container.updateKind.localValue} can be updated to ${container.updateKind.kind} ${container.updateKind.remoteValue}${container.result && container.result.link ? "\\n" + container.result.link : ""}',
    batchtitle: '${containers.length} updates available',
    resolvenotifications: false,
};

const docker = new Docker();
docker.configuration = configurationValid;
docker.log = log;

vi.mock('../../../registry', () => ({
    getState() {
        return {
            watcher: {
                'docker.test': {
                    getId: () => 'docker.test',
                    watch: () => Promise.resolve(),
                    dockerApi: {
                        getContainer: (id) => {
                            if (id === '123456789') {
                                return Promise.resolve({
                                    inspect: () =>
                                        Promise.resolve({
                                            Name: '/container-name',
                                            Id: '123456798',
                                            State: {
                                                Running: true,
                                            },
                                            NetworkSettings: {
                                                Networks: {
                                                    test: {
                                                        Aliases: [
                                                            '9708fc7b44f2',
                                                            'test',
                                                        ],
                                                    },
                                                },
                                            },
                                        }),
                                    stop: () => Promise.resolve(),
                                    remove: () => Promise.resolve(),
                                    start: () => Promise.resolve(),
                                });
                            }
                            return Promise.reject(
                                new Error('Error when getting container'),
                            );
                        },
                        createContainer: (container) => {
                            if (container.name === 'container-name') {
                                return Promise.resolve({
                                    start: () => Promise.resolve(),
                                });
                            }
                            return Promise.reject(
                                new Error('Error when creating container'),
                            );
                        },
                        pull: (image) => {
                            if (
                                image === 'test/test:1.2.3' ||
                                image === 'my-registry/test/test:4.5.6'
                            ) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error('Error when pulling image'),
                            );
                        },
                        getImage: (image) =>
                            Promise.resolve({
                                remove: () => {
                                    if (image === 'test/test:1.2.3') {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error('Error when removing image'),
                                    );
                                },
                            }),
                        modem: {
                            followProgress: (pullStream, res) => res(),
                        },
                    },
                },
            },
            registry: {
                hub: {
                    getAuthPull: async () => undefined,
                    getImageFullName: (image, tagOrDigest) =>
                        `${image.registry.url}/${image.name}:${tagOrDigest}`,
                },
            },
        };
    },
}));

beforeEach(async () => {
    vi.resetAllMocks();
    docker.configuration = configurationValid;
    docker.log = log;
});

test('validateConfiguration should return validated configuration when valid', async () => {
    const validatedConfiguration =
        docker.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', async () => {
    const configuration = {
        url: 'git://xxx.com',
    };
    expect(() => {
        docker.validateConfiguration(configuration);
    }).toThrowError(joi.ValidationError);
});

test('getWatcher should return watcher responsible for a container', async () => {
    expect(
        docker
            .getWatcher({
                watcher: 'test',
            })
            .getId(),
    ).toEqual('docker.test');
});

test('getCurrentContainer should return container from dockerApi', async () => {
    await expect(
        docker.getCurrentContainer(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            {
                id: '123456789',
            },
        ),
    ).resolves.not.toBeUndefined();
});

test('getCurrentContainer should throw error when error occurs', async () => {
    await expect(
        docker.getCurrentContainer(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            {
                id: 'unknown',
            },
        ),
    ).rejects.toThrowError('Error when getting container');
});

test('inspectContainer should return container details from dockerApi', async () => {
    await expect(
        docker.inspectContainer(
            {
                inspect: () => Promise.resolve({}),
            },
            log,
        ),
    ).resolves.toEqual({});
});

test('inspectContainer should throw error when error occurs', async () => {
    await expect(
        docker.inspectContainer(
            {
                inspect: () => Promise.reject(new Error('No container')),
            },
            log,
        ),
    ).rejects.toThrowError('No container');
});

test('stopContainer should stop container from dockerApi', async () => {
    await expect(
        docker.stopContainer(
            {
                stop: () => Promise.resolve(),
            },
            'name',
            'id',
            log,
        ),
    ).resolves.toBeUndefined();
});

test('stopContainer should throw error when error occurs', async () => {
    await expect(
        docker.stopContainer(
            {
                stop: () => Promise.reject(new Error('No container')),
            },
            'name',
            'id',
            log,
        ),
    ).rejects.toThrowError('No container');
});

test('removeContainer should stop container from dockerApi', async () => {
    await expect(
        docker.removeContainer(
            {
                remove: () => Promise.resolve(),
            },
            'name',
            'id',
            log,
        ),
    ).resolves.toBeUndefined();
});

test('removeContainer should throw error when error occurs', async () => {
    await expect(
        docker.removeContainer(
            {
                remove: () => Promise.reject(new Error('No container')),
            },
            'name',
            'id',
            log,
        ),
    ).rejects.toThrowError('No container');
});

test('waitContainerRemoved should wait for the container to be removed from dockerApi', async () => {
    await expect(
        docker.waitContainerRemoved(
            {
                wait: () => Promise.resolve(),
            },
            'name',
            'id',
            log,
        ),
    ).resolves.toBeUndefined();
});

test('waitContainerRemoved should throw error when error occurs', async () => {
    await expect(
        docker.waitContainerRemoved(
            {
                wait: () => Promise.reject(new Error('No container')),
            },
            'name',
            'id',
            log,
        ),
    ).rejects.toThrowError('No container');
});

test('startContainer should stop container from dockerApi', async () => {
    await expect(
        docker.startContainer(
            {
                start: () => Promise.resolve(),
            },
            'name',
            log,
        ),
    ).resolves.toBeUndefined();
});

test('startContainer should throw error when error occurs', async () => {
    await expect(
        docker.startContainer(
            {
                start: () => Promise.reject(new Error('No container')),
            },
            'name',
            log,
        ),
    ).rejects.toThrowError('No container');
});

test('createContainer should stop container from dockerApi', async () => {
    await expect(
        docker.createContainer(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            {
                name: 'container-name',
            },
            'name',
            log,
        ),
    ).resolves.not.toBeUndefined();
});

test('createContainer should throw error when error occurs', async () => {
    await expect(
        docker.createContainer(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            {
                name: 'ko',
            },
            'name',
            log,
        ),
    ).rejects.toThrowError('Error when creating container');
});

test('createContainer should connect additional networks after create', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const getNetwork = vi.fn().mockReturnValue({ connect });
    const createContainer = vi.fn().mockResolvedValue({
        start: () => Promise.resolve(),
    });
    const logContainer = {
        info: vi.fn(),
        warn: vi.fn(),
    };

    const containerToCreate = {
        name: 'container-name',
        HostConfig: {
            NetworkMode: 'cloud_default',
        },
        NetworkingConfig: {
            EndpointsConfig: {
                cloud_default: { Aliases: ['container-name'] },
                postgres_default: { Aliases: ['container-name'] },
                valkey_default: { Aliases: ['container-name'] },
            },
        },
    };

    await docker.createContainer(
        {
            createContainer,
            getNetwork,
        },
        containerToCreate,
        'container-name',
        logContainer,
    );

    expect(createContainer).toHaveBeenCalledWith({
        name: 'container-name',
        HostConfig: {
            NetworkMode: 'cloud_default',
        },
        NetworkingConfig: {
            EndpointsConfig: {
                cloud_default: { Aliases: ['container-name'] },
            },
        },
    });
    expect(getNetwork).toHaveBeenCalledTimes(2);
    expect(getNetwork).toHaveBeenCalledWith('postgres_default');
    expect(getNetwork).toHaveBeenCalledWith('valkey_default');
    expect(connect).toHaveBeenCalledTimes(2);
    expect(connect).toHaveBeenCalledWith({
        Container: 'container-name',
        EndpointConfig: { Aliases: ['container-name'] },
    });
});

test('pull should pull image from dockerApi', async () => {
    await expect(
        docker.pullImage(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            undefined,
            'test/test:1.2.3',
            log,
        ),
    ).resolves.toBeUndefined();
});

test('pull should throw error when error occurs', async () => {
    await expect(
        docker.pullImage(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            undefined,
            'test/test:unknown',
            log,
        ),
    ).rejects.toThrowError('Error when pulling image');
});

test('pull should emit progress logs from followProgress events', async () => {
    const dockerApi = {
        pull: vi.fn().mockResolvedValue({}),
        modem: {
            followProgress: vi.fn((pullStream, done, onProgress) => {
                onProgress({
                    id: 'layer-1',
                    status: 'Downloading',
                    progressDetail: {
                        current: 50,
                        total: 100,
                    },
                });
                done(null, [
                    {
                        id: 'layer-1',
                        status: 'Download complete',
                    },
                ]);
            }),
        },
    };
    const logContainer = {
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    };

    await docker.pullImage(
        dockerApi,
        undefined,
        'test/test:1.2.3',
        logContainer,
    );

    expect(logContainer.debug).toHaveBeenCalledWith(
        expect.stringContaining('Pull progress for test/test:1.2.3'),
    );
    expect(logContainer.info).toHaveBeenCalledWith(
        'Image test/test:1.2.3 pulled with success',
    );
});

test('pull should throw error when followProgress reports an error', async () => {
    const dockerApi = {
        pull: vi.fn().mockResolvedValue({}),
        modem: {
            followProgress: vi.fn((pullStream, done) => {
                done(new Error('Pull progress failed'));
            }),
        },
    };
    const logContainer = {
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    };

    await expect(
        docker.pullImage(
            dockerApi,
            undefined,
            'test/test:1.2.3',
            logContainer,
        ),
    ).rejects.toThrowError('Pull progress failed');
});

test('removeImage should pull image from dockerApi', async () => {
    await expect(
        docker.removeImage(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            'test/test:1.2.3',
            log,
        ),
    ).resolves.toBeUndefined();
});

test('removeImage should throw error when error occurs', async () => {
    await expect(
        docker.removeImage(
            docker.getWatcher({ watcher: 'test' }).dockerApi,
            'test/test:unknown',
            log,
        ),
    ).rejects.toThrowError('Error when removing image');
});

test('clone should clone an existing container spec', async () => {
    const clone = docker.cloneContainer(
        {
            Name: '/test',
            Id: '123456789',
            HostConfig: {
                a: 'a',
                b: 'b',
            },
            Config: {
                configA: 'a',
                configB: 'b',
            },
            NetworkSettings: {
                Networks: {
                    test: {
                        Aliases: ['9708fc7b44f2', 'test'],
                    },
                },
            },
        },
        'test/test:2.0.0',
    );
    expect(clone).toEqual({
        HostConfig: {
            a: 'a',
            b: 'b',
        },
        Image: 'test/test:2.0.0',
        configA: 'a',
        configB: 'b',
        name: 'test',
        NetworkingConfig: {
            EndpointsConfig: {
                test: {
                    Aliases: ['9708fc7b44f2', 'test'],
                },
            },
        },
    });
});

test('clone should remove dynamic network endpoint fields and stale aliases', async () => {
    const clone = docker.cloneContainer(
        {
            Name: '/test',
            Id: '123456789abcdef',
            HostConfig: {
                NetworkMode: 'cloud_default',
            },
            Config: {
                configA: 'a',
            },
            NetworkSettings: {
                Networks: {
                    cloud_default: {
                        Aliases: ['123456789abc', 'nextcloud'],
                        NetworkID: 'network-id',
                        EndpointID: 'endpoint-id',
                        Gateway: '172.18.0.1',
                        IPAddress: '172.18.0.2',
                        DriverOpts: {
                            test: 'value',
                        },
                    },
                },
            },
        },
        'test/test:2.0.0',
    );

    expect(clone.NetworkingConfig.EndpointsConfig).toEqual({
        cloud_default: {
            Aliases: ['nextcloud'],
            DriverOpts: {
                test: 'value',
            },
        },
    });
});

test('trigger should not throw when all is ok', async () => {
    await expect(
        docker.trigger({
            watcher: 'test',
            id: '123456789',
            Name: '/container-name',
            image: {
                name: 'test/test',
                registry: {
                    name: 'hub',
                    url: 'my-registry',
                },
            },
            updateKind: {
                remoteValue: '4.5.6',
            },
        }),
    ).resolves.toBeUndefined();
});

test('pruneImages should exclude the current tag when updateKind is digest', async () => {
    const removeSpy = vi.fn().mockResolvedValue(undefined);
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            {
                Id: 'image-current',
                RepoTags: ['ecr.example.com/repo:nginx-prod'],
            },
            {
                Id: 'image-other',
                RepoTags: ['ecr.example.com/repo:other-tag'],
            },
        ]),
        getImage: vi.fn().mockReturnValue({
            name: 'image-to-remove',
            remove: removeSpy,
        }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'ecr' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    const containerDigestUpdate = {
        image: {
            registry: { name: 'ecr' },
            name: 'repo',
            tag: { value: 'nginx-prod' },
        },
        updateKind: {
            kind: 'digest',
            localValue: 'sha256:olddigest',
            remoteValue: 'sha256:newdigest',
        },
    };

    await docker.pruneImages(
        mockDockerApi,
        mockRegistry,
        containerDigestUpdate,
        log,
    );

    // Only the 'other-tag' image should be pruned, not the current 'nginx-prod'
    expect(mockDockerApi.getImage).toHaveBeenCalledTimes(1);
    expect(mockDockerApi.getImage).toHaveBeenCalledWith('image-other');
});

test('pruneImages should not exclude current tag when updateKind is tag', async () => {
    const removeSpy = vi.fn().mockResolvedValue(undefined);
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            {
                Id: 'image-current',
                RepoTags: ['ecr.example.com/repo:1.0.0'],
            },
            {
                Id: 'image-other',
                RepoTags: ['ecr.example.com/repo:0.9.0'],
            },
        ]),
        getImage: vi.fn().mockReturnValue({
            name: 'image-to-remove',
            remove: removeSpy,
        }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'ecr' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    const containerTagUpdate = {
        image: {
            registry: { name: 'ecr' },
            name: 'repo',
            tag: { value: '1.0.0' },
        },
        updateKind: {
            kind: 'tag',
            localValue: '1.0.0',
            remoteValue: '2.0.0',
        },
    };

    await docker.pruneImages(
        mockDockerApi,
        mockRegistry,
        containerTagUpdate,
        log,
    );

    // '1.0.0' matches localValue so it IS excluded
    // '0.9.0' does not match either localValue or remoteValue, so it IS pruned
    expect(mockDockerApi.getImage).toHaveBeenCalledTimes(1);
    expect(mockDockerApi.getImage).toHaveBeenCalledWith('image-other');
});

test('pruneImages should exclude images from different registries', async () => {
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            { Id: 'image-diff-registry', RepoTags: ['other-registry.com/repo:1.0.0'] },
        ]),
        getImage: vi.fn().mockReturnValue({ name: 'img', remove: vi.fn() }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'other-reg' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    await docker.pruneImages(mockDockerApi, mockRegistry, {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    }, log);
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('pruneImages should exclude images with different names', async () => {
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            { Id: 'image-diff-name', RepoTags: ['ecr.example.com/other-repo:0.9.0'] },
        ]),
        getImage: vi.fn().mockReturnValue({ name: 'img', remove: vi.fn() }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'ecr' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    await docker.pruneImages(mockDockerApi, mockRegistry, {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    }, log);
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('pruneImages should exclude images matching remoteValue', async () => {
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            { Id: 'image-remote', RepoTags: ['ecr.example.com/repo:2.0.0'] },
        ]),
        getImage: vi.fn().mockReturnValue({ name: 'img', remove: vi.fn() }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'ecr' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    await docker.pruneImages(mockDockerApi, mockRegistry, {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    }, log);
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('pruneImages should warn when error occurs during pruning', async () => {
    const mockDockerApi = {
        listImages: vi.fn().mockRejectedValue(new Error('list failed')),
    };
    const spyLog = vi.spyOn(log, 'warn');
    await docker.pruneImages(mockDockerApi, {}, {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    }, log);
    expect(spyLog).toHaveBeenCalledWith(
        expect.stringContaining('Some errors occurred when trying to prune'),
    );
});

test('pruneImages should exclude images without RepoTags', async () => {
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            { Id: 'image-no-tags', RepoTags: null },
            { Id: 'image-empty-tags', RepoTags: [] },
        ]),
        getImage: vi.fn().mockReturnValue({ name: 'img', remove: vi.fn() }),
    };
    await docker.pruneImages(mockDockerApi, { normalizeImage: vi.fn() }, {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    }, log);
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('getNewImageFullName should use tag value for digest updates', () => {
    const mockRegistry = {
        getImageFullName: (image, tagOrDigest) =>
            `${image.registry.url}/${image.name}:${tagOrDigest}`,
    };
    const containerDigest = {
        image: {
            name: 'test/test',
            tag: { value: 'nginx-prod' },
            registry: { url: 'my-registry' },
        },
        updateKind: {
            kind: 'digest',
            remoteValue: 'sha256:newdigest',
        },
    };
    const result = docker.getNewImageFullName(mockRegistry, containerDigest);
    expect(result).toBe('my-registry/test/test:nginx-prod');
});

test('trigger should not throw in dryrun mode', async () => {
    docker.configuration = { ...configurationValid, dryrun: true };
    docker.log = log;
    await expect(
        docker.trigger({
            watcher: 'test',
            id: '123456789',
            name: 'test-container',
            image: {
                name: 'test/test',
                registry: { name: 'hub', url: 'my-registry' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '4.5.6' },
        }),
    ).resolves.toBeUndefined();
});

test('trigger should use waitContainerRemoved when AutoRemove is true', async () => {
    docker.configuration = { ...configurationValid, dryrun: false, prune: false };
    docker.log = log;
    const waitSpy = vi.fn().mockResolvedValue();
    vi.spyOn(docker, 'getCurrentContainer').mockResolvedValue({
        inspect: () =>
            Promise.resolve({
                Name: '/container-name',
                Id: '123',
                State: { Running: true },
                Config: {},
                HostConfig: { AutoRemove: true },
                NetworkSettings: { Networks: {} },
            }),
        stop: () => Promise.resolve(),
        wait: waitSpy,
    });
    vi.spyOn(docker, 'inspectContainer').mockResolvedValue({
        Name: '/container-name',
        Id: '123',
        State: { Running: true },
        Config: {},
        HostConfig: { AutoRemove: true },
        NetworkSettings: { Networks: {} },
    });
    vi.spyOn(docker, 'pullImage').mockResolvedValue();
    vi.spyOn(docker, 'cloneContainer').mockReturnValue({ name: 'container-name' });
    vi.spyOn(docker, 'stopContainer').mockResolvedValue();
    vi.spyOn(docker, 'createContainer').mockResolvedValue({ start: vi.fn() });
    vi.spyOn(docker, 'startContainer').mockResolvedValue();

    await docker.trigger({
        watcher: 'test',
        id: '123456789',
        name: 'container-name',
        image: {
            name: 'test/test',
            registry: { name: 'hub', url: 'my-registry' },
            tag: { value: '1.0.0' },
        },
        updateKind: { kind: 'tag', remoteValue: '4.5.6' },
    });

    expect(waitSpy).toHaveBeenCalled();
});

test('trigger should prune old image by tag after non-dryrun update', async () => {
    docker.configuration = { ...configurationValid, dryrun: false, prune: true };
    docker.log = log;
    vi.spyOn(docker, 'getCurrentContainer').mockResolvedValue({
        inspect: () => Promise.resolve(),
        remove: vi.fn(),
    });
    vi.spyOn(docker, 'inspectContainer').mockResolvedValue({
        Name: '/container-name',
        Id: '123',
        State: { Running: false },
        Config: {},
        HostConfig: {},
        NetworkSettings: { Networks: {} },
    });
    vi.spyOn(docker, 'pruneImages').mockResolvedValue();
    vi.spyOn(docker, 'pullImage').mockResolvedValue();
    vi.spyOn(docker, 'cloneContainer').mockReturnValue({ name: 'container-name' });
    vi.spyOn(docker, 'removeContainer').mockResolvedValue();
    vi.spyOn(docker, 'createContainer').mockResolvedValue({ start: vi.fn() });
    const removeImageSpy = vi.spyOn(docker, 'removeImage').mockResolvedValue();

    await docker.trigger({
        watcher: 'test',
        id: '123456789',
        name: 'container-name',
        image: {
            name: 'test/test',
            registry: { name: 'hub', url: 'my-registry' },
            tag: { value: '1.0.0' },
        },
        updateKind: { kind: 'tag', remoteValue: '4.5.6' },
    });

    expect(removeImageSpy).toHaveBeenCalled();
});

test('trigger should prune old image by digest repo after non-dryrun update', async () => {
    docker.configuration = { ...configurationValid, dryrun: false, prune: true };
    docker.log = log;
    vi.spyOn(docker, 'getCurrentContainer').mockResolvedValue({
        inspect: () => Promise.resolve(),
        remove: vi.fn(),
    });
    vi.spyOn(docker, 'inspectContainer').mockResolvedValue({
        Name: '/container-name',
        Id: '123',
        State: { Running: false },
        Config: {},
        HostConfig: {},
        NetworkSettings: { Networks: {} },
    });
    vi.spyOn(docker, 'pruneImages').mockResolvedValue();
    vi.spyOn(docker, 'pullImage').mockResolvedValue();
    vi.spyOn(docker, 'cloneContainer').mockReturnValue({ name: 'container-name' });
    vi.spyOn(docker, 'removeContainer').mockResolvedValue();
    vi.spyOn(docker, 'createContainer').mockResolvedValue({ start: vi.fn() });
    const removeImageSpy = vi.spyOn(docker, 'removeImage').mockResolvedValue();

    await docker.trigger({
        watcher: 'test',
        id: '123456789',
        name: 'container-name',
        image: {
            name: 'test/test',
            registry: { name: 'hub', url: 'my-registry' },
            tag: { value: 'latest' },
            digest: { repo: 'sha256:olddigest' },
        },
        updateKind: { kind: 'digest', remoteValue: 'sha256:newdigest' },
    });

    expect(removeImageSpy).toHaveBeenCalled();
});

test('trigger should catch error when removing digest image fails', async () => {
    docker.configuration = { ...configurationValid, dryrun: false, prune: true };
    docker.log = log;
    vi.spyOn(docker, 'getCurrentContainer').mockResolvedValue({
        inspect: () => Promise.resolve(),
        remove: vi.fn(),
    });
    vi.spyOn(docker, 'inspectContainer').mockResolvedValue({
        Name: '/container-name',
        Id: '123',
        State: { Running: false },
        Config: {},
        HostConfig: {},
        NetworkSettings: { Networks: {} },
    });
    vi.spyOn(docker, 'pruneImages').mockResolvedValue();
    vi.spyOn(docker, 'pullImage').mockResolvedValue();
    vi.spyOn(docker, 'cloneContainer').mockReturnValue({ name: 'container-name' });
    vi.spyOn(docker, 'removeContainer').mockResolvedValue();
    vi.spyOn(docker, 'createContainer').mockResolvedValue({ start: vi.fn() });
    vi.spyOn(docker, 'removeImage').mockRejectedValue(new Error('remove failed'));

    // Should not throw
    await docker.trigger({
        watcher: 'test',
        id: '123456789',
        name: 'container-name',
        image: {
            name: 'test/test',
            registry: { name: 'hub', url: 'my-registry' },
            tag: { value: 'latest' },
            digest: { repo: 'sha256:olddigest' },
        },
        updateKind: { kind: 'digest', remoteValue: 'sha256:newdigest' },
    });
});

test('trigger should not throw when container does not exist', async () => {
    docker.configuration = { ...configurationValid, dryrun: false };
    docker.log = log;
    vi.spyOn(docker, 'getCurrentContainer').mockResolvedValue(null);

    await expect(docker.trigger({
        watcher: 'test',
        id: '123456789',
        name: 'test-container',
        image: {
            name: 'test/test',
            registry: { name: 'hub', url: 'my-registry' },
            tag: { value: '1.0.0' },
        },
        updateKind: { kind: 'tag', remoteValue: '2.0.0' },
    })).resolves.toBeUndefined();
});

test('triggerBatch should call trigger for each container', async () => {
    const triggerSpy = vi.spyOn(docker, 'trigger').mockResolvedValue();
    const containers = [{ name: 'c1' }, { name: 'c2' }];
    await docker.triggerBatch(containers);
    expect(triggerSpy).toHaveBeenCalledTimes(2);
    expect(triggerSpy).toHaveBeenCalledWith({ name: 'c1' });
    expect(triggerSpy).toHaveBeenCalledWith({ name: 'c2' });
});

test('cloneContainer should remove Hostname and ExposedPorts when NetworkMode starts with container:', () => {
    const clone = docker.cloneContainer(
        {
            Name: '/sidecar',
            Id: 'abc123',
            HostConfig: {
                NetworkMode: 'container:mainapp',
            },
            Config: {
                Hostname: 'sidecar-host',
                ExposedPorts: { '80/tcp': {} },
                configA: 'a',
            },
            NetworkSettings: {
                Networks: {},
            },
        },
        'test/test:2.0.0',
    );
    expect(clone.Hostname).toBeUndefined();
    expect(clone.ExposedPorts).toBeUndefined();
    expect(clone.HostConfig.NetworkMode).toBe('container:mainapp');
});

test('createPullProgressLogger should throttle duplicate snapshots within interval', () => {
    const logContainer = { debug: vi.fn() };
    const logger = docker.createPullProgressLogger(logContainer, 'test:1.0');

    // First call should log
    logger.onProgress({ status: 'Downloading', id: 'layer-1', progressDetail: { current: 50, total: 100 } });
    expect(logContainer.debug).toHaveBeenCalledTimes(1);

    // Immediate repeat with same data should be throttled
    logger.onProgress({ status: 'Downloading', id: 'layer-1', progressDetail: { current: 50, total: 100 } });
    expect(logContainer.debug).toHaveBeenCalledTimes(1);

    // Different data but within interval should still be throttled (line 239)
    logger.onProgress({ status: 'Downloading', id: 'layer-1', progressDetail: { current: 75, total: 100 } });
    expect(logContainer.debug).toHaveBeenCalledTimes(1);
});

test('createPullProgressLogger should handle null/undefined progressEvent', () => {
    const logContainer = { debug: vi.fn() };
    const logger = docker.createPullProgressLogger(logContainer, 'test:1.0');
    logger.onProgress(null);
    logger.onProgress(undefined);
    expect(logContainer.debug).not.toHaveBeenCalled();
});

test('createPullProgressLogger onDone should force log regardless of interval', () => {
    const logContainer = { debug: vi.fn() };
    const logger = docker.createPullProgressLogger(logContainer, 'test:1.0');
    logger.onProgress({ status: 'Downloading', id: 'l1', progressDetail: { current: 50, total: 100 } });
    // onDone should force log even though within interval
    logger.onDone({ status: 'Download complete', id: 'l1' });
    expect(logContainer.debug).toHaveBeenCalledTimes(2);
});

test('formatPullProgress should return string progress when progressDetail is missing', () => {
    expect(docker.formatPullProgress({ progress: '[==> ] 50%' })).toBe('[==> ] 50%');
});

test('formatPullProgress should return undefined when no progress data', () => {
    expect(docker.formatPullProgress({ status: 'Waiting' })).toBeUndefined();
    expect(docker.formatPullProgress({})).toBeUndefined();
});

test('formatPullProgress should return formatted percentage', () => {
    expect(docker.formatPullProgress({ progressDetail: { current: 50, total: 200 } })).toBe('50/200 (25%)');
});

test('sanitizeEndpointConfig should return empty object for undefined config', () => {
    expect(docker.sanitizeEndpointConfig(undefined, 'abc')).toEqual({});
});

test('sanitizeEndpointConfig should copy IPAMConfig, Links, DriverOpts, MacAddress', () => {
    const config = {
        IPAMConfig: { IPv4Address: '10.0.0.5' },
        Links: ['link1'],
        DriverOpts: { opt: 'val' },
        MacAddress: '02:42:ac:11:00:02',
    };
    const result = docker.sanitizeEndpointConfig(config, 'abc');
    expect(result).toEqual(config);
});

test('getPrimaryNetworkName should return NetworkMode when it exists in network names', () => {
    const container = { HostConfig: { NetworkMode: 'custom_net' } };
    expect(docker.getPrimaryNetworkName(container, ['bridge', 'custom_net'])).toBe('custom_net');
});

test('getPrimaryNetworkName should return first network when NetworkMode not in list', () => {
    const container = { HostConfig: { NetworkMode: 'host' } };
    expect(docker.getPrimaryNetworkName(container, ['bridge', 'custom'])).toBe('bridge');
});

test('pruneImages should exclude images with different names', async () => {
    const removeSpy = vi.fn().mockResolvedValue(undefined);
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            {
                Id: 'image-different-name',
                RepoTags: ['ecr.example.com/different-repo:1.0.0'],
            },
        ]),
        getImage: vi.fn().mockReturnValue({
            name: 'should-not-be-called',
            remove: removeSpy,
        }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'ecr' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    const containerTagUpdate = {
        image: {
            registry: { name: 'ecr' },
            name: 'repo',
            tag: { value: '1.0.0' },
        },
        updateKind: {
            kind: 'tag',
            localValue: '1.0.0',
            remoteValue: '2.0.0',
        },
    };

    await docker.pruneImages(mockDockerApi, mockRegistry, containerTagUpdate, log);

    // Image has different name ('different-repo' vs 'repo'), should NOT be pruned
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('pruneImages should exclude candidate image (remoteValue)', async () => {
    const removeSpy = vi.fn().mockResolvedValue(undefined);
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            {
                Id: 'image-candidate',
                RepoTags: ['ecr.example.com/repo:2.0.0'],
            },
        ]),
        getImage: vi.fn().mockReturnValue({
            name: 'should-not-be-called',
            remove: removeSpy,
        }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'ecr' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    const containerTagUpdate = {
        image: {
            registry: { name: 'ecr' },
            name: 'repo',
            tag: { value: '1.0.0' },
        },
        updateKind: {
            kind: 'tag',
            localValue: '1.0.0',
            remoteValue: '2.0.0',
        },
    };

    await docker.pruneImages(mockDockerApi, mockRegistry, containerTagUpdate, log);

    // Image tag matches remoteValue (2.0.0) so it should NOT be pruned
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('pruneImages should exclude images without RepoTags', async () => {
    const removeSpy = vi.fn().mockResolvedValue(undefined);
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            {
                Id: 'image-no-tags',
                RepoTags: [],
            },
            {
                Id: 'image-null-tags',
            },
        ]),
        getImage: vi.fn().mockReturnValue({
            name: 'should-not-be-called',
            remove: removeSpy,
        }),
    };
    const mockRegistry = {
        normalizeImage: vi.fn(),
    };
    const container = {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    };

    await docker.pruneImages(mockDockerApi, mockRegistry, container, log);

    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
    expect(mockRegistry.normalizeImage).not.toHaveBeenCalled();
});

test('pruneImages should exclude images with different registry', async () => {
    const removeSpy = vi.fn().mockResolvedValue(undefined);
    const mockDockerApi = {
        listImages: vi.fn().mockResolvedValue([
            {
                Id: 'image-diff-registry',
                RepoTags: ['other-registry.io/repo:0.8.0'],
            },
        ]),
        getImage: vi.fn().mockReturnValue({
            name: 'should-not-be-called',
            remove: removeSpy,
        }),
    };
    const mockRegistry = {
        normalizeImage: (img) => ({
            registry: { name: 'other-registry' },
            name: img.name,
            tag: { value: img.tag.value },
        }),
    };
    const container = {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    };

    await docker.pruneImages(mockDockerApi, mockRegistry, container, log);

    // Registry is different ('other-registry' vs 'ecr') so image should NOT be pruned
    expect(mockDockerApi.getImage).not.toHaveBeenCalled();
});

test('pruneImages should warn when error occurs during pruning', async () => {
    const mockDockerApi = {
        listImages: vi.fn().mockRejectedValue(new Error('list failed')),
    };
    const mockRegistry = {};
    const container = {
        image: { registry: { name: 'ecr' }, name: 'repo', tag: { value: '1.0.0' } },
        updateKind: { kind: 'tag', localValue: '1.0.0', remoteValue: '2.0.0' },
    };

    const logContainer = { info: vi.fn(), warn: vi.fn() };
    await docker.pruneImages(mockDockerApi, mockRegistry, container, logContainer);

    expect(logContainer.warn).toHaveBeenCalledWith(
        expect.stringContaining('list failed'),
    );
});
