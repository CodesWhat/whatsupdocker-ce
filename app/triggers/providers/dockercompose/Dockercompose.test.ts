// @ts-nocheck
import { EventEmitter } from 'events';
import Docker from '../docker/Docker.js';
import Dockercompose from './Dockercompose.js';
import { getState } from '../../../registry/index.js';

jest.mock('../../../registry', () => ({
    getState: jest.fn(),
}));

describe('Dockercompose Trigger', () => {
    let trigger;
    let mockLog;
    let mockDockerApi;

    beforeEach(() => {
        jest.clearAllMocks();

        mockLog = {
            info: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            child: jest.fn().mockReturnThis(),
        };

        trigger = new Dockercompose();
        trigger.log = mockLog;
        trigger.configuration = {
            dryrun: true,
            backup: false,
            composeFileLabel: 'wud.compose.file',
        };

        mockDockerApi = {
            modem: {
                socketPath: '/var/run/docker.sock',
            },
            getContainer: jest.fn(),
        };

        getState.mockReturnValue({
            registry: {
                hub: {
                    getImageFullName: (image, tag) => `${image.name}:${tag}`,
                },
            },
            watcher: {
                'docker.local': {
                    dockerApi: mockDockerApi,
                },
            },
        });
    });

    test('mapCurrentVersionToUpdateVersion should ignore services without image', () => {
        const compose = {
            services: {
                wud: {
                    environment: ['WUD_TRIGGER_DOCKERCOMPOSE_BASE_AUTO=false'],
                },
                portainer: {
                    image: 'portainer/portainer-ce:2.27.4',
                },
            },
        };
        const container = {
            name: 'portainer',
            image: {
                name: 'portainer/portainer-ce',
                registry: { name: 'hub' },
                tag: { value: '2.27.4' },
            },
            updateKind: {
                kind: 'tag',
                remoteValue: '2.27.5',
            },
        };

        const result = trigger.mapCurrentVersionToUpdateVersion(
            compose,
            container,
        );

        expect(result).toEqual({
            service: 'portainer',
            current: 'portainer/portainer-ce:2.27.4',
            update: 'portainer/portainer-ce:2.27.5',
            currentNormalized: 'portainer/portainer-ce:2.27.4',
            updateNormalized: 'portainer/portainer-ce:2.27.5',
        });
    });

    test('mapCurrentVersionToUpdateVersion should prefer compose service label', () => {
        const compose = {
            services: {
                alpha: {
                    image: 'nginx:1.0.0',
                },
                beta: {
                    image: 'nginx:1.0.0',
                },
            },
        };
        const container = {
            name: 'nginx',
            labels: {
                'com.docker.compose.service': 'beta',
            },
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: {
                kind: 'tag',
                remoteValue: '1.1.0',
            },
        };

        const result = trigger.mapCurrentVersionToUpdateVersion(
            compose,
            container,
        );

        expect(result?.service).toBe('beta');
    });

    test('processComposeFile should not fail when compose has partial services', async () => {
        const container = {
            name: 'portainer',
            image: {
                name: 'portainer/portainer-ce',
                registry: { name: 'hub' },
                tag: { value: '2.27.4' },
            },
            updateKind: {
                kind: 'tag',
                remoteValue: '2.27.5',
            },
        };

        jest.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                wud: {
                    environment: ['WUD_TRIGGER_DOCKERCOMPOSE_BASE_AUTO=false'],
                },
                portainer: {
                    image: 'portainer/portainer-ce:2.27.4',
                },
            },
        });

        const dockerTriggerSpy = jest
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/tmp/portainer.yml', [container]);

        expect(dockerTriggerSpy).toHaveBeenCalledWith(container);
    });

    test('processComposeFile should only trigger containers with actual image changes', async () => {
        const tagContainer = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: {
                kind: 'tag',
                remoteValue: '1.1.0',
            },
        };
        const digestContainer = {
            name: 'redis',
            image: {
                name: 'redis',
                registry: { name: 'hub' },
                tag: { value: '7.0.0' },
            },
            updateKind: {
                kind: 'digest',
                remoteValue: 'sha256:deadbeef',
            },
        };

        jest.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
                redis: { image: 'redis:7.0.0' },
            },
        });

        const dockerTriggerSpy = jest
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/tmp/stack.yml', [
            tagContainer,
            digestContainer,
        ]);

        expect(dockerTriggerSpy).toHaveBeenCalledTimes(1);
        expect(dockerTriggerSpy).toHaveBeenCalledWith(tagContainer);
    });

    test('processComposeFile should skip writes and triggers when no service image changes are needed', async () => {
        trigger.configuration.dryrun = false;
        const container = {
            name: 'redis',
            image: {
                name: 'redis',
                registry: { name: 'hub' },
                tag: { value: '7.0.0' },
            },
            updateKind: {
                kind: 'digest',
                remoteValue: 'sha256:deadbeef',
            },
        };

        jest.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                redis: { image: 'redis:7.0.0' },
            },
        });

        const getComposeFileSpy = jest.spyOn(trigger, 'getComposeFile');
        const writeComposeFileSpy = jest.spyOn(trigger, 'writeComposeFile');
        const dockerTriggerSpy = jest
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/tmp/stack.yml', [container]);

        expect(getComposeFileSpy).not.toHaveBeenCalled();
        expect(writeComposeFileSpy).not.toHaveBeenCalled();
        expect(dockerTriggerSpy).not.toHaveBeenCalled();
        expect(mockLog.info).toHaveBeenCalledWith(
            expect.stringContaining('already up to date'),
        );
    });

    test('processComposeFile should treat implicit latest as up to date', async () => {
        trigger.configuration.dryrun = false;
        const container = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: 'latest' },
            },
            updateKind: {
                kind: 'digest',
                remoteValue: 'sha256:deadbeef',
            },
        };

        jest.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx' },
            },
        });

        const getComposeFileSpy = jest.spyOn(trigger, 'getComposeFile');
        const writeComposeFileSpy = jest.spyOn(trigger, 'writeComposeFile');
        const dockerTriggerSpy = jest
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/tmp/stack.yml', [container]);

        expect(getComposeFileSpy).not.toHaveBeenCalled();
        expect(writeComposeFileSpy).not.toHaveBeenCalled();
        expect(dockerTriggerSpy).not.toHaveBeenCalled();
        expect(mockLog.info).toHaveBeenCalledWith(
            expect.stringContaining('already up to date'),
        );
    });

    test('runServicePostStartHooks should execute configured hooks on recreated container', async () => {
        trigger.configuration.dryrun = false;
        const container = {
            name: 'netbox',
            watcher: 'local',
        };
        const startStream = new EventEmitter();
        startStream.resume = jest.fn();
        const mockExec = {
            start: jest.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: jest.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: jest.fn().mockResolvedValue({
                State: {
                    Running: true,
                },
            }),
            exec: jest.fn().mockResolvedValue(mockExec),
        };

        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: [
                {
                    command: 'echo hello',
                    user: 'root',
                    working_dir: '/tmp',
                    privileged: true,
                    environment: { TEST: '1' },
                },
            ],
        });

        expect(recreatedContainer.exec).toHaveBeenCalledWith(
            expect.objectContaining({
                Cmd: ['sh', '-c', 'echo hello'],
                User: 'root',
                WorkingDir: '/tmp',
                Privileged: true,
                Env: ['TEST=1'],
            }),
        );
        expect(mockExec.inspect).toHaveBeenCalledTimes(1);
    });

    test('runServicePostStartHooks should support string hook syntax', async () => {
        trigger.configuration.dryrun = false;
        const container = {
            name: 'netbox',
            watcher: 'local',
        };
        const startStream = new EventEmitter();
        startStream.resume = jest.fn();
        const mockExec = {
            start: jest.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: jest.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: jest.fn().mockResolvedValue({
                State: {
                    Running: true,
                },
            }),
            exec: jest.fn().mockResolvedValue(mockExec),
        };

        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: ['echo hello'],
        });

        expect(recreatedContainer.exec).toHaveBeenCalledWith(
            expect.objectContaining({
                Cmd: ['sh', '-c', 'echo hello'],
            }),
        );
    });
});
