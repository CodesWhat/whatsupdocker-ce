// @ts-nocheck
import logger from '../log/index.js';
const log = logger.child({ component: 'store' });
import * as container from './container.js';
const { getContainers, deleteContainer } = container;

/**
 * Delete all containers from state.
 */
function deleteAllContainersFromState() {
    log.info('Incompatible state found; reset');
    getContainers({}).forEach((container) => deleteContainer(container.id));
}

/**
 * Data migration function.
 * @param from version
 * @param to version
 */
export function migrate(from, to) {
    log.info(`Migrate data from version ${from} to version ${to}`);
    if (from && !from.startsWith('8') && to && to.startsWith('8')) {
        deleteAllContainersFromState();
    }
}
