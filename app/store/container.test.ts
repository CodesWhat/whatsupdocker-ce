// @ts-nocheck
import * as container from './container.js';
import * as event from '../event/index.js';

vi.mock('./migrate');
vi.mock('../event');

beforeEach(async () => {
    vi.resetAllMocks();
});

test('createCollections should create collection containers when not exist', async () => {
    const db = {
        getCollection: () => null,
        addCollection: () => ({
            findOne: () => {},
            insert: () => {},
        }),
    };
    const spy = vi.spyOn(db, 'addCollection');
    container.createCollections(db);
    expect(spy).toHaveBeenCalledWith('containers');
});

test('createCollections should not create collection containers when already exist', async () => {
    const db = {
        getCollection: () => ({
            findOne: () => {},
            insert: () => {},
        }),
        addCollection: () => null,
    };
    const spy = vi.spyOn(db, 'addCollection');
    container.createCollections(db);
    expect(spy).not.toHaveBeenCalled();
});

test('insertContainer should insert doc and emit an event', async () => {
    const collection = {
        findOne: () => {},
        insert: () => {},
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    const containerToSave = {
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'registry',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: undefined,
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    };
    const spyInsert = vi.spyOn(collection, 'insert');
    const spyEvent = vi.spyOn(event, 'emitContainerAdded');
    container.createCollections(db);
    container.insertContainer(containerToSave);
    expect(spyInsert).toHaveBeenCalled();
    expect(spyEvent).toHaveBeenCalled();
});

test('updateContainer should update doc and emit an event', async () => {
    const collection = {
        insert: () => {},
        chain: () => ({
            find: () => ({
                remove: () => ({}),
            }),
        }),
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    const containerToSave = {
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'registry',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: undefined,
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    };
    const spyInsert = vi.spyOn(collection, 'insert');
    const spyEvent = vi.spyOn(event, 'emitContainerUpdated');
    container.createCollections(db);
    container.updateContainer(containerToSave);
    expect(spyInsert).toHaveBeenCalled();
    expect(spyEvent).toHaveBeenCalled();
});

test('updateContainer should preserve updatePolicy when omitted from payload', async () => {
    const existingContainer = {
        data: {
            id: 'container-123456789',
            name: 'test',
            watcher: 'test',
            updatePolicy: {
                skipTags: ['2.0.0'],
            },
            image: {
                id: 'image-123456789',
                registry: {
                    name: 'registry',
                    url: 'https://hub',
                },
                name: 'organization/image',
                tag: {
                    value: 'version',
                    semver: false,
                },
                digest: {
                    watch: false,
                    repo: undefined,
                },
                architecture: 'arch',
                os: 'os',
                created: '2021-06-12T05:33:38.440Z',
            },
            result: {
                tag: 'version',
            },
        },
    };
    const collection = {
        findOne: () => existingContainer,
        insert: () => {},
        chain: () => ({
            find: () => ({
                remove: () => ({}),
            }),
        }),
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    const containerToSave = {
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'registry',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: undefined,
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    };

    container.createCollections(db);
    const updated = container.updateContainer(containerToSave);
    expect(updated.updatePolicy).toEqual({
        skipTags: ['2.0.0'],
    });
});

test('updateContainer should clear updatePolicy when explicitly set to undefined', async () => {
    const existingContainer = {
        data: {
            id: 'container-123456789',
            name: 'test',
            watcher: 'test',
            updatePolicy: {
                skipTags: ['2.0.0'],
            },
            image: {
                id: 'image-123456789',
                registry: {
                    name: 'registry',
                    url: 'https://hub',
                },
                name: 'organization/image',
                tag: {
                    value: 'version',
                    semver: false,
                },
                digest: {
                    watch: false,
                    repo: undefined,
                },
                architecture: 'arch',
                os: 'os',
                created: '2021-06-12T05:33:38.440Z',
            },
            result: {
                tag: 'version',
            },
        },
    };
    const collection = {
        findOne: () => existingContainer,
        insert: () => {},
        chain: () => ({
            find: () => ({
                remove: () => ({}),
            }),
        }),
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    const containerToSave = {
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        updatePolicy: undefined,
        image: {
            id: 'image-123456789',
            registry: {
                name: 'registry',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: undefined,
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    };

    container.createCollections(db);
    const updated = container.updateContainer(containerToSave);
    expect(updated.updatePolicy).toBeUndefined();
});

test('getContainers should return all containers sorted by name', async () => {
    const containerExample = {
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'registry',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: undefined,
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    };
    const containers = [
        {
            data: {
                ...containerExample,
                name: 'container3',
            },
        },
        {
            data: {
                ...containerExample,
                name: 'container2',
            },
        },
        {
            data: {
                ...containerExample,
                name: 'container1',
            },
        },
    ];
    const collection = {
        find: () => containers,
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => ({
            findOne: () => {},
            insert: () => {},
        }),
    };
    container.createCollections(db);
    const results = container.getContainers();
    expect(results[0].name).toEqual('container1');
    expect(results[1].name).toEqual('container2');
    expect(results[2].name).toEqual('container3');
});

test('getContainer should return 1 container by id', async () => {
    const containerExample = {
        data: {
            id: 'container-123456789',
            name: 'test',
            watcher: 'test',
            image: {
                id: 'image-123456789',
                registry: {
                    name: 'registry',
                    url: 'https://hub',
                },
                name: 'organization/image',
                tag: {
                    value: 'version',
                    semver: false,
                },
                digest: {
                    watch: false,
                    repo: undefined,
                },
                architecture: 'arch',
                os: 'os',
                created: '2021-06-12T05:33:38.440Z',
            },
            result: {
                tag: 'version',
            },
        },
    };
    const collection = {
        findOne: () => containerExample,
    };
    const db = {
        getCollection: () => collection,
    };
    container.createCollections(db);
    const result = container.getContainer('132456789');
    expect(result.name).toEqual(containerExample.data.name);
});

test('getContainer should return undefined when not found', async () => {
    const collection = {
        findOne: () => null,
    };
    const db = {
        getCollection: () => collection,
    };
    container.createCollections(db);
    const result = container.getContainer('123456789');
    expect(result).toEqual(undefined);
});

test('getContainers should return empty array when collection is not initialized', async () => {
    // Reset the containers collection by using a db that returns null
    const db = {
        getCollection: () => null,
        addCollection: () => null,
    };
    // This won't actually set containers to null due to the check,
    // but we can test the fallback by never calling createCollections
    // Create a fresh import to test the uninitialized state
    vi.resetModules();
    const freshContainer = await import('./container.js');
    const result = freshContainer.getContainers();
    expect(result).toEqual([]);
});

test('getContainers should filter by query parameters', async () => {
    const containerExample = {
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: { name: 'registry', url: 'https://hub' },
            name: 'organization/image',
            tag: { value: 'version', semver: false },
            digest: { watch: false, repo: undefined },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: { tag: 'version' },
    };
    const collection = {
        find: vi.fn(() => [{ data: containerExample }]),
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    container.createCollections(db);
    container.getContainers({ watcher: 'test' });
    expect(collection.find).toHaveBeenCalledWith({ 'data.watcher': 'test' });
});

test('deleteContainer should do nothing when container is not found', async () => {
    const collection = {
        findOne: () => null,
        chain: () => ({
            find: () => ({
                remove: () => ({}),
            }),
        }),
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    const spyEvent = vi.spyOn(event, 'emitContainerRemoved');
    container.createCollections(db);
    container.deleteContainer('nonexistent-id');
    expect(spyEvent).not.toHaveBeenCalled();
});

test('deleteContainer should delete doc and emit an event', async () => {
    const containerExample = {
        data: {
            id: 'container-123456789',
            name: 'test',
            watcher: 'test',
            image: {
                id: 'image-123456789',
                registry: {
                    name: 'registry',
                    url: 'https://hub',
                },
                name: 'organization/image',
                tag: {
                    value: 'version',
                    semver: false,
                },
                digest: {
                    watch: false,
                    repo: undefined,
                },
                architecture: 'arch',
                os: 'os',
                created: '2021-06-12T05:33:38.440Z',
            },
            result: {
                tag: 'version',
            },
        },
    };
    const collection = {
        findOne: () => containerExample,
        chain: () => ({
            find: () => ({
                remove: () => ({}),
            }),
        }),
    };
    const db = {
        getCollection: () => collection,
        addCollection: () => null,
    };
    const spyEvent = vi.spyOn(event, 'emitContainerRemoved');
    container.createCollections(db);
    container.deleteContainer(containerExample);
    expect(spyEvent).toHaveBeenCalled();
});
