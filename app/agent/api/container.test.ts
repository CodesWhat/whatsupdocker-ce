// @ts-nocheck
import { describe, test, expect, beforeEach } from 'vitest';
import * as containerApi from './container.js';
import * as storeContainer from '../../store/container.js';
import * as configuration from '../../configuration/index.js';
import * as registry from '../../registry/index.js';

vi.mock('../../log/index.js', () => ({ default: { child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }) } }));

vi.mock('../../store/container.js', () => ({
    getContainers: vi.fn(),
    getContainer: vi.fn(),
    deleteContainer: vi.fn(),
}));

vi.mock('../../configuration/index.js', () => ({
    getServerConfiguration: vi.fn(),
}));

vi.mock('../../registry/index.js', () => ({
    getState: vi.fn(() => ({ watcher: {}, trigger: {} })),
}));

describe('agent API container', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { params: {} };
        res = {
            json: vi.fn(),
            sendStatus: vi.fn(),
        };
    });

    describe('getContainers', () => {
        test('should return all containers', () => {
            const containers = [{ id: 'c1' }, { id: 'c2' }];
            storeContainer.getContainers.mockReturnValue(containers);
            containerApi.getContainers(req, res);
            expect(storeContainer.getContainers).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(containers);
        });
    });

    describe('getContainerLogs', () => {
        /** Build a Docker multiplexed stream buffer (8-byte header + payload). */
        function dockerStreamBuffer(text, stream = 1) {
            const payload = Buffer.from(text, 'utf-8');
            const header = Buffer.alloc(8);
            header[0] = stream;
            header.writeUInt32BE(payload.length, 4);
            return Buffer.concat([header, payload]);
        }

        test('should return 404 when container not found', async () => {
            storeContainer.getContainer.mockReturnValue(undefined);
            req.params.id = 'c1';
            req.query = {};
            res.status = vi.fn().mockReturnThis();
            await containerApi.getContainerLogs(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(404);
        });

        test('should return 500 when watcher not found', async () => {
            storeContainer.getContainer.mockReturnValue({ id: 'c1', name: 'my-container', watcher: 'local' });
            registry.getState.mockReturnValue({ watcher: {}, trigger: {} });
            req.params.id = 'c1';
            req.query = {};
            res.status = vi.fn().mockReturnThis();
            await containerApi.getContainerLogs(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('No watcher found'),
            }));
        });

        test('should return logs successfully', async () => {
            const mockLogs = dockerStreamBuffer('log output');
            const mockDockerContainer = { logs: vi.fn().mockResolvedValue(mockLogs) };
            const mockWatcher = { dockerApi: { getContainer: vi.fn().mockReturnValue(mockDockerContainer) } };
            storeContainer.getContainer.mockReturnValue({ id: 'c1', name: 'my-container', watcher: 'local' });
            registry.getState.mockReturnValue({ watcher: { 'docker.local': mockWatcher }, trigger: {} });
            req.params.id = 'c1';
            req.query = {};
            res.status = vi.fn().mockReturnThis();
            await containerApi.getContainerLogs(req, res);
            expect(mockWatcher.dockerApi.getContainer).toHaveBeenCalledWith('my-container');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ logs: 'log output' });
        });

        test('should return 500 when docker API fails', async () => {
            const mockDockerContainer = { logs: vi.fn().mockRejectedValue(new Error('docker error')) };
            const mockWatcher = { dockerApi: { getContainer: vi.fn().mockReturnValue(mockDockerContainer) } };
            storeContainer.getContainer.mockReturnValue({ id: 'c1', name: 'my-container', watcher: 'local' });
            registry.getState.mockReturnValue({ watcher: { 'docker.local': mockWatcher }, trigger: {} });
            req.params.id = 'c1';
            req.query = {};
            res.status = vi.fn().mockReturnThis();
            await containerApi.getContainerLogs(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('Error fetching container logs'),
            }));
        });
    });

    describe('deleteContainer', () => {
        test('should return 403 when delete feature is disabled', () => {
            configuration.getServerConfiguration.mockReturnValue({
                feature: { delete: false },
            });
            req.params.id = 'c1';
            containerApi.deleteContainer(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(403);
        });

        test('should return 404 when container is not found', () => {
            configuration.getServerConfiguration.mockReturnValue({
                feature: { delete: true },
            });
            req.params.id = 'c1';
            storeContainer.getContainer.mockReturnValue(undefined);
            containerApi.deleteContainer(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(404);
        });

        test('should delete container and return 204', () => {
            configuration.getServerConfiguration.mockReturnValue({
                feature: { delete: true },
            });
            req.params.id = 'c1';
            storeContainer.getContainer.mockReturnValue({ id: 'c1' });
            containerApi.deleteContainer(req, res);
            expect(storeContainer.deleteContainer).toHaveBeenCalledWith('c1');
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });
    });
});
