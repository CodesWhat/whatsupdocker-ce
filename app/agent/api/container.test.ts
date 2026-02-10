// @ts-nocheck
import { describe, test, expect, beforeEach } from 'vitest';
import * as containerApi from './container.js';
import * as storeContainer from '../../store/container.js';
import * as configuration from '../../configuration/index.js';

vi.mock('../../log/index.js', () => ({ default: { child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }) } }));

vi.mock('../../store/container.js', () => ({
    getContainers: vi.fn(),
    getContainer: vi.fn(),
    deleteContainer: vi.fn(),
}));

vi.mock('../../configuration/index.js', () => ({
    getServerConfiguration: vi.fn(),
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
