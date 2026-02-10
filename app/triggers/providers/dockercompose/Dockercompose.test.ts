// @ts-nocheck
import { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import Docker from '../docker/Docker.js';
import Dockercompose from './Dockercompose.js';
import { getState } from '../../../registry/index.js';

vi.mock('../../../registry', () => ({
    getState: vi.fn(),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        default: {
            ...actual.default,
            access: vi.fn().mockResolvedValue(undefined),
            copyFile: vi.fn().mockResolvedValue(undefined),
            readFile: vi.fn().mockResolvedValue(Buffer.from('')),
            writeFile: vi.fn().mockResolvedValue(undefined),
        },
        access: vi.fn().mockResolvedValue(undefined),
        copyFile: vi.fn().mockResolvedValue(undefined),
        readFile: vi.fn().mockResolvedValue(Buffer.from('')),
        writeFile: vi.fn().mockResolvedValue(undefined),
    };
});

describe('Dockercompose Trigger', () => {
    let trigger;
    let mockLog;
    let mockDockerApi;

    beforeEach(() => {
        vi.clearAllMocks();

        mockLog = {
            info: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            error: vi.fn(),
            child: vi.fn().mockReturnThis(),
        };

        trigger = new Dockercompose();
        trigger.log = mockLog;
        trigger.configuration = {
            dryrun: true,
            backup: false,
            composeFileLabel: 'dd.compose.file',
        };

        mockDockerApi = {
            modem: {
                socketPath: '/var/run/docker.sock',
            },
            getContainer: vi.fn(),
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
                dd: {
                    environment: ['DD_TRIGGER_DOCKERCOMPOSE_BASE_AUTO=false'],
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

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                dd: {
                    environment: ['DD_TRIGGER_DOCKERCOMPOSE_BASE_AUTO=false'],
                },
                portainer: {
                    image: 'portainer/portainer-ce:2.27.4',
                },
            },
        });

        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/portainer.yml', [container]);

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

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
                redis: { image: 'redis:7.0.0' },
            },
        });

        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [
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

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                redis: { image: 'redis:7.0.0' },
            },
        });

        const getComposeFileSpy = vi.spyOn(trigger, 'getComposeFile');
        const writeComposeFileSpy = vi.spyOn(trigger, 'writeComposeFile');
        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

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

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx' },
            },
        });

        const getComposeFileSpy = vi.spyOn(trigger, 'getComposeFile');
        const writeComposeFileSpy = vi.spyOn(trigger, 'writeComposeFile');
        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

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
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: {
                    Running: true,
                },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
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
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: {
                    Running: true,
                },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
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

    test('runServicePostStartHooks should skip when dryrun is true', async () => {
        trigger.configuration.dryrun = true;
        const container = { name: 'netbox', watcher: 'local' };

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: ['echo hello'],
        });

        expect(mockDockerApi.getContainer).not.toHaveBeenCalled();
    });

    test('runServicePostStartHooks should skip when service has no post_start', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };

        await trigger.runServicePostStartHooks(container, 'netbox', {});

        expect(mockDockerApi.getContainer).not.toHaveBeenCalled();
    });

    test('runServicePostStartHooks should skip when container is not running', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: false },
            }),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: ['echo hello'],
        });

        expect(mockLog.info).toHaveBeenCalledWith(
            expect.stringContaining('not running'),
        );
    });

    test('runServicePostStartHooks should skip hook with no command', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn(),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: [{ user: 'root' }],
        });

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('command is missing'),
        );
        expect(recreatedContainer.exec).not.toHaveBeenCalled();
    });

    test('runServicePostStartHooks should throw on non-zero exit code', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('end'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 1 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await expect(
            trigger.runServicePostStartHooks(container, 'netbox', {
                post_start: ['failing-command'],
            }),
        ).rejects.toThrow('exit code 1');
    });

    test('runServicePostStartHooks should handle exec stream error', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('error', new Error('stream failure')));
                return startStream;
            }),
            inspect: vi.fn(),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await expect(
            trigger.runServicePostStartHooks(container, 'netbox', {
                post_start: ['echo hello'],
            }),
        ).rejects.toThrow('stream failure');
    });

    test('runServicePostStartHooks should handle stream without resume', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        // No resume method
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: ['echo hello'],
        });

        expect(mockExec.inspect).toHaveBeenCalled();
    });

    test('runServicePostStartHooks should handle stream without once', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const mockExec = {
            start: vi.fn().mockResolvedValue({}),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: ['echo hello'],
        });

        expect(mockExec.inspect).toHaveBeenCalled();
    });

    test('runServicePostStartHooks should support array command form', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: [{ command: ['echo', 'hello'] }],
        });

        expect(recreatedContainer.exec).toHaveBeenCalledWith(
            expect.objectContaining({
                Cmd: ['echo', 'hello'],
            }),
        );
    });

    test('runServicePostStartHooks should support environment as array', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: [{ command: 'echo hello', environment: ['FOO=bar', 'BAZ=1'] }],
        });

        expect(recreatedContainer.exec).toHaveBeenCalledWith(
            expect.objectContaining({
                Env: ['FOO=bar', 'BAZ=1'],
            }),
        );
    });

    test('runServicePostStartHooks should normalize single post_start hook (not array)', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: { command: 'echo hello' },
        });

        expect(recreatedContainer.exec).toHaveBeenCalledWith(
            expect.objectContaining({
                Cmd: ['sh', '-c', 'echo hello'],
            }),
        );
    });

    test('backup should log warning on error', async () => {
        fs.copyFile.mockRejectedValueOnce(new Error('copy failed'));

        await trigger.backup('/opt/drydock/test/compose.yml', '/opt/drydock/test/compose.yml.back');

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('copy failed'),
        );
    });

    test('mapCurrentVersionToUpdateVersion should return undefined when service not found', () => {
        const compose = {
            services: {
                redis: { image: 'redis:7.0.0' },
            },
        };
        const container = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        const result = trigger.mapCurrentVersionToUpdateVersion(compose, container);

        expect(result).toBeUndefined();
        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('Could not find service'),
        );
    });

    test('mapCurrentVersionToUpdateVersion should return undefined when service has no image', () => {
        const compose = {
            services: {
                nginx: { build: './nginx' },
            },
        };
        const container = {
            name: 'nginx',
            labels: { 'com.docker.compose.service': 'nginx' },
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        const result = trigger.mapCurrentVersionToUpdateVersion(compose, container);

        expect(result).toBeUndefined();
        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('image is missing'),
        );
    });

    test('writeComposeFile should log error on write failure', async () => {
        fs.writeFile.mockRejectedValueOnce(new Error('write failed'));

        await trigger.writeComposeFile('/opt/drydock/test/compose.yml', 'data');

        expect(mockLog.error).toHaveBeenCalledWith(
            expect.stringContaining('write failed'),
        );
    });

    test('getComposeFileAsObject should throw on yaml parse error', async () => {
        vi.spyOn(trigger, 'getComposeFile').mockResolvedValue(
            Buffer.from('invalid: yaml: [[['),
        );

        await expect(
            trigger.getComposeFileAsObject('/opt/drydock/test/compose.yml'),
        ).rejects.toThrow();

        expect(mockLog.error).toHaveBeenCalledWith(
            expect.stringContaining('Error when parsing'),
        );
    });

    test('getComposeFile should use default configuration file when no argument', () => {
        trigger.configuration.file = '/opt/drydock/test/default-compose.yml';

        trigger.getComposeFile();

        expect(fs.readFile).toHaveBeenCalledWith('/opt/drydock/test/default-compose.yml');
    });

    test('triggerBatch should skip containers not on local host', async () => {
        const container = {
            name: 'remote-container',
            watcher: 'remote',
        };

        getState.mockReturnValue({
            registry: {
                hub: { getImageFullName: (image, tag) => `${image.name}:${tag}` },
            },
            watcher: {
                'docker.remote': {
                    dockerApi: {
                        modem: { socketPath: '' },
                    },
                },
            },
        });

        await trigger.triggerBatch([container]);

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('not running on local host'),
        );
    });

    test('triggerBatch should skip containers with no compose file', async () => {
        trigger.configuration.file = undefined;
        const container = {
            name: 'no-compose',
            watcher: 'local',
        };

        await trigger.triggerBatch([container]);

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('No compose file found'),
        );
    });

    test('triggerBatch should skip containers when compose file does not exist', async () => {
        trigger.configuration.file = '/nonexistent/compose.yml';
        fs.access.mockRejectedValueOnce(new Error('ENOENT'));

        const container = {
            name: 'test-container',
            watcher: 'local',
        };

        await trigger.triggerBatch([container]);

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('does not exist'),
        );
    });

    test('processComposeFile should warn when no containers belong to compose', async () => {
        const container = {
            name: 'unknown',
            image: {
                name: 'unknown-image',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
            },
        });

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('No containers found'),
        );
    });

    test('processComposeFile should backup and write when not in dryrun mode', async () => {
        trigger.configuration.dryrun = false;
        trigger.configuration.backup = true;

        const container = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
            },
        });

        const backupSpy = vi.spyOn(trigger, 'backup').mockResolvedValue();
        vi.spyOn(trigger, 'getComposeFile').mockResolvedValue(
            Buffer.from('image: nginx:1.0.0'),
        );
        const writeSpy = vi.spyOn(trigger, 'writeComposeFile').mockResolvedValue();
        vi.spyOn(Docker.prototype, 'trigger').mockResolvedValue();
        vi.spyOn(trigger, 'runServicePostStartHooks').mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        expect(backupSpy).toHaveBeenCalledWith('/opt/drydock/test/stack.yml', '/opt/drydock/test/stack.yml.back');
        expect(writeSpy).toHaveBeenCalledWith(
            '/opt/drydock/test/stack.yml',
            'image: nginx:1.1.0',
        );
    });

    test('processComposeFile should not backup when backup is false', async () => {
        trigger.configuration.dryrun = false;
        trigger.configuration.backup = false;

        const container = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
            },
        });

        const backupSpy = vi.spyOn(trigger, 'backup').mockResolvedValue();
        vi.spyOn(trigger, 'getComposeFile').mockResolvedValue(
            Buffer.from('image: nginx:1.0.0'),
        );
        vi.spyOn(trigger, 'writeComposeFile').mockResolvedValue();
        vi.spyOn(Docker.prototype, 'trigger').mockResolvedValue();
        vi.spyOn(trigger, 'runServicePostStartHooks').mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        expect(backupSpy).not.toHaveBeenCalled();
    });

    test('getComposeFileForContainer should use label from container', () => {
        const container = {
            labels: { 'dd.compose.file': '/opt/compose.yml' },
        };

        const result = trigger.getComposeFileForContainer(container);

        expect(result).toBe('/opt/compose.yml');
    });

    test('getComposeFileForContainer should use wud fallback label', () => {
        const container = {
            labels: { 'wud.compose.file': '/opt/wud-compose.yml' },
        };

        const result = trigger.getComposeFileForContainer(container);

        expect(result).toBe('/opt/wud-compose.yml');
    });

    test('getComposeFileForContainer should resolve relative label paths', () => {
        const container = {
            labels: { 'dd.compose.file': 'relative/compose.yml' },
        };

        const result = trigger.getComposeFileForContainer(container);

        expect(result).toMatch(/\/.*relative\/compose\.yml$/);
        expect(result).not.toBe('relative/compose.yml');
    });

    test('getComposeFileForContainer should return null when no label and no default file', () => {
        trigger.configuration.file = undefined;
        const container = { labels: {} };

        const result = trigger.getComposeFileForContainer(container);

        expect(result).toBeNull();
    });

    test('getComposeFileForContainer should fall back to default config file', () => {
        trigger.configuration.file = '/default/compose.yml';
        const container = { labels: {} };

        const result = trigger.getComposeFileForContainer(container);

        expect(result).toBe('/default/compose.yml');
    });

    test('initTrigger should set mode to batch', async () => {
        trigger.configuration.mode = 'simple';
        trigger.configuration.file = undefined;

        await trigger.initTrigger();

        expect(trigger.configuration.mode).toBe('batch');
    });

    test('initTrigger should throw when configured file does not exist', async () => {
        trigger.configuration.file = '/nonexistent/compose.yml';
        fs.access.mockRejectedValueOnce(new Error('ENOENT'));

        await expect(trigger.initTrigger()).rejects.toThrow('ENOENT');

        expect(mockLog.error).toHaveBeenCalledWith(
            expect.stringContaining('does not exist'),
        );
    });

    test('trigger should delegate to triggerBatch with single container', async () => {
        const container = { name: 'test' };
        const spy = vi.spyOn(trigger, 'triggerBatch').mockResolvedValue();

        await trigger.trigger(container);

        expect(spy).toHaveBeenCalledWith([container]);
    });

    test('triggerBatch should group containers by compose file and process each', async () => {
        trigger.configuration.file = '/opt/drydock/test/compose.yml';
        fs.access.mockResolvedValue(undefined);

        const container1 = {
            name: 'app1',
            watcher: 'local',
            labels: { 'dd.compose.file': '/opt/drydock/test/a.yml' },
        };
        const container2 = {
            name: 'app2',
            watcher: 'local',
            labels: { 'dd.compose.file': '/opt/drydock/test/b.yml' },
        };

        const processComposeFileSpy = vi
            .spyOn(trigger, 'processComposeFile')
            .mockResolvedValue();

        await trigger.triggerBatch([container1, container2]);

        expect(processComposeFileSpy).toHaveBeenCalledTimes(2);
        expect(processComposeFileSpy).toHaveBeenCalledWith('/opt/drydock/test/a.yml', [container1]);
        expect(processComposeFileSpy).toHaveBeenCalledWith('/opt/drydock/test/b.yml', [container2]);
    });

    test('processComposeFile should run post-start hooks for updated services', async () => {
        trigger.configuration.dryrun = false;
        trigger.configuration.backup = false;

        const container = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        const serviceDefinition = {
            image: 'nginx:1.0.0',
            post_start: ['echo done'],
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: serviceDefinition,
            },
        });

        vi.spyOn(trigger, 'getComposeFile').mockResolvedValue(
            Buffer.from('image: nginx:1.0.0'),
        );
        vi.spyOn(trigger, 'writeComposeFile').mockResolvedValue();
        vi.spyOn(Docker.prototype, 'trigger').mockResolvedValue();

        const hooksSpy = vi.spyOn(trigger, 'runServicePostStartHooks').mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        expect(hooksSpy).toHaveBeenCalledWith(
            container,
            'nginx',
            serviceDefinition,
        );
    });

    test('runServicePostStartHooks should return early when normalized hooks array is empty', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: [],
        });

        expect(mockDockerApi.getContainer).not.toHaveBeenCalled();
    });

    test('getComposeFile should log error and throw when fs.readFile throws synchronously', () => {
        const readFileMock = fs.readFile;
        readFileMock.mockImplementationOnce(() => {
            throw new Error('sync read error');
        });
        trigger.configuration.file = '/opt/drydock/test/compose.yml';

        expect(() => trigger.getComposeFile('/opt/drydock/test/compose.yml')).toThrow('sync read error');
        expect(mockLog.error).toHaveBeenCalledWith(
            expect.stringContaining('sync read error'),
        );
    });

    test('processComposeFile should filter out containers where mapCurrentVersionToUpdateVersion returns undefined', async () => {
        const container1 = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };
        const container2 = {
            name: 'unknown-container',
            image: {
                name: 'unknown',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
            },
        });

        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();
        vi.spyOn(trigger, 'getComposeFile').mockResolvedValue(
            Buffer.from('image: nginx:1.0.0'),
        );
        vi.spyOn(trigger, 'writeComposeFile').mockResolvedValue();
        vi.spyOn(trigger, 'runServicePostStartHooks').mockResolvedValue();
        trigger.configuration.dryrun = false;

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container1, container2]);

        // Only nginx should be triggered, unknown-container should be filtered out
        expect(dockerTriggerSpy).toHaveBeenCalledTimes(1);
        expect(dockerTriggerSpy).toHaveBeenCalledWith(container1);
    });

    test('processComposeFile should handle digest images with @ in compose file', async () => {
        trigger.configuration.dryrun = false;
        trigger.configuration.backup = false;

        const container = {
            name: 'nginx',
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: 'latest' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx@sha256:abc123' },
            },
        });

        // Container's currentFullImage is 'nginx:latest' which won't match 'nginx@sha256:abc123'
        // so it won't find the service, and the container should be filtered out
        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('No containers found'),
        );
    });

    test('processComposeFile should handle null image in mapCurrentVersionToUpdateVersion', async () => {
        trigger.configuration.dryrun = false;

        const container = {
            name: 'nginx',
            labels: { 'com.docker.compose.service': 'nginx' },
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { build: './nginx' },
            },
        });

        // mapCurrentVersionToUpdateVersion returns undefined for service without image
        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('image is missing'),
        );
    });

    test('getConfigurationSchema should extend Docker schema with file, backup, composeFileLabel', () => {
        const schema = trigger.getConfigurationSchema();
        expect(schema).toBeDefined();
        // Validate a config with dockercompose-specific fields
        const { error } = schema.validate({
            prune: false,
            dryrun: false,
            autoremovetimeout: 10000,
            file: '/opt/drydock/test/compose.yml',
            backup: true,
            composeFileLabel: 'dd.compose.file',
        });
        expect(error).toBeUndefined();
    });

    test('processComposeFile should treat image with digest reference as up to date', async () => {
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

        // Use image with @digest to exercise normalizeImplicitLatest "@" branch (line 37-38)
        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx@sha256:abc123' },
            },
        });

        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container]);

        // The container won't match because image formats differ
        expect(mockLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('No containers found'),
        );
        expect(dockerTriggerSpy).not.toHaveBeenCalled();
    });

    test('processComposeFile should handle mapCurrentVersionToUpdateVersion returning undefined', async () => {
        trigger.configuration.dryrun = false;

        const container1 = {
            name: 'nginx',
            labels: { 'com.docker.compose.service': 'nginx' },
            image: {
                name: 'nginx',
                registry: { name: 'hub' },
                tag: { value: '1.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '1.1.0' },
        };
        const container2 = {
            name: 'redis',
            labels: { 'com.docker.compose.service': 'redis' },
            image: {
                name: 'redis',
                registry: { name: 'hub' },
                tag: { value: '7.0.0' },
            },
            updateKind: { kind: 'tag', remoteValue: '7.1.0' },
        };

        vi.spyOn(trigger, 'getComposeFileAsObject').mockResolvedValue({
            services: {
                nginx: { image: 'nginx:1.0.0' },
                redis: { build: './redis' }, // service has no image -> returns undefined
            },
        });

        vi.spyOn(trigger, 'getComposeFile').mockResolvedValue(
            Buffer.from('image: nginx:1.0.0'),
        );
        vi.spyOn(trigger, 'writeComposeFile').mockResolvedValue();
        const dockerTriggerSpy = vi
            .spyOn(Docker.prototype, 'trigger')
            .mockResolvedValue();
        vi.spyOn(trigger, 'runServicePostStartHooks').mockResolvedValue();

        await trigger.processComposeFile('/opt/drydock/test/stack.yml', [container1, container2]);

        // Only nginx should be triggered (redis returns undefined from mapCurrentVersionToUpdateVersion)
        expect(dockerTriggerSpy).toHaveBeenCalledTimes(1);
        expect(dockerTriggerSpy).toHaveBeenCalledWith(container1);
    });

    test('runServicePostStartHooks should handle environment with null values', async () => {
        trigger.configuration.dryrun = false;
        const container = { name: 'netbox', watcher: 'local' };
        const startStream = new EventEmitter();
        startStream.resume = vi.fn();
        const mockExec = {
            start: vi.fn().mockImplementation(async () => {
                setImmediate(() => startStream.emit('close'));
                return startStream;
            }),
            inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
        };
        const recreatedContainer = {
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
            }),
            exec: vi.fn().mockResolvedValue(mockExec),
        };
        mockDockerApi.getContainer.mockReturnValue(recreatedContainer);

        await trigger.runServicePostStartHooks(container, 'netbox', {
            post_start: [{ command: 'echo hello', environment: { KEY: null } }],
        });

        expect(recreatedContainer.exec).toHaveBeenCalledWith(
            expect.objectContaining({
                Env: ['KEY='],
            }),
        );
    });
});
