// @ts-nocheck
import express from 'express';
import nocache from 'nocache';
import * as storeContainer from '../store/container.js';
import * as registry from '../registry/index.js';
import { getServerConfiguration } from '../configuration/index.js';
import { mapComponentsToList } from './component.js';
import Trigger from '../triggers/providers/Trigger.js';
import logger from '../log/index.js';
import { getAgent } from '../agent/manager.js';
const log = logger.child({ component: 'container' });

const router = express.Router();

/**
 * Return registered watchers.
 * @returns {{id: string}[]}
 */
function getWatchers() {
    return registry.getState().watcher;
}

/**
 * Return registered triggers.
 * @returns {{id: string}[]}
 */
function getTriggers() {
    return registry.getState().trigger;
}

/**
 * Get containers from store.
 * @param query
 * @returns {*}
 */
export function getContainersFromStore(query) {
    return storeContainer.getContainers(query);
}

function uniqStrings(values = []) {
    return [...new Set(values.filter((value) => typeof value === 'string'))];
}

function normalizeUpdatePolicy(updatePolicy = {}) {
    const normalizedPolicy = {};

    if (Array.isArray(updatePolicy.skipTags)) {
        const skipTags = uniqStrings(updatePolicy.skipTags);
        if (skipTags.length > 0) {
            normalizedPolicy.skipTags = skipTags;
        }
    }

    if (Array.isArray(updatePolicy.skipDigests)) {
        const skipDigests = uniqStrings(updatePolicy.skipDigests);
        if (skipDigests.length > 0) {
            normalizedPolicy.skipDigests = skipDigests;
        }
    }

    if (updatePolicy.snoozeUntil) {
        const snoozeUntil = new Date(updatePolicy.snoozeUntil);
        if (!Number.isNaN(snoozeUntil.getTime())) {
            normalizedPolicy.snoozeUntil = snoozeUntil.toISOString();
        }
    }

    return normalizedPolicy;
}

function getCurrentUpdateValue(container, kind) {
    if (kind === 'tag') {
        return container.updateKind?.remoteValue || container.result?.tag;
    }
    if (kind === 'digest') {
        return container.updateKind?.remoteValue || container.result?.digest;
    }
    return undefined;
}

function getSnoozeUntilFromActionPayload(payload = {}) {
    if (payload.snoozeUntil) {
        const customDate = new Date(payload.snoozeUntil);
        if (Number.isNaN(customDate.getTime())) {
            throw new Error('Invalid snoozeUntil date');
        }
        return customDate.toISOString();
    }
    const days = Number(payload.days ?? 7);
    if (!Number.isFinite(days) || days <= 0 || days > 365) {
        throw new Error('Invalid snooze days value');
    }
    const snoozeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return snoozeUntil.toISOString();
}

/**
 * Get all (filtered) containers.
 * @param req
 * @param res
 */
function getContainers(req, res) {
    const { query } = req;
    res.status(200).json(getContainersFromStore(query));
}

/**
 * Get a container by id.
 * @param req
 * @param res
 */
function getContainer(req, res) {
    const { id } = req.params;
    const container = storeContainer.getContainer(id);
    if (container) {
        res.status(200).json(container);
    } else {
        res.sendStatus(404);
    }
}

/**
 * Delete a container by id.
 * @param req
 * @param res
 */
export async function deleteContainer(req, res) {
    const serverConfiguration = getServerConfiguration();
    if (!serverConfiguration.feature.delete) {
        res.sendStatus(403);
    } else {
        const { id } = req.params;
        const container = storeContainer.getContainer(id);
        if (container) {
            if (container.agent) {
                const agent = getAgent(container.agent);
                if (agent) {
                    try {
                        await agent.deleteContainer(id);
                        storeContainer.deleteContainer(id);
                        res.sendStatus(204);
                    } catch (e) {
                        if (e.response && e.response.status === 404) {
                            storeContainer.deleteContainer(id);
                            res.sendStatus(204);
                        } else {
                            res.status(500).json({
                                error: `Error deleting container on agent (${e.message})`,
                            });
                        }
                    }
                } else {
                    res.status(500).json({
                        error: `Agent ${container.agent} not found`,
                    });
                }
            } else {
                storeContainer.deleteContainer(id);
                res.sendStatus(204);
            }
        } else {
            res.sendStatus(404);
        }
    }
}

/**
 * Watch all containers.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function watchContainers(req, res) {
    try {
        await Promise.all(
            Object.values(getWatchers()).map((watcher) => watcher.watch()),
        );
        getContainers(req, res);
    } catch (e) {
        res.status(500).json({
            error: `Error when watching images (${e.message})`,
        });
    }
}

export async function getContainerTriggers(req, res) {
    const { id } = req.params;

    const container = storeContainer.getContainer(id);
    if (container) {
        const allTriggers = mapComponentsToList(getTriggers());
        const includedTriggers = container.triggerInclude
            ? container.triggerInclude
                  .split(/\s*,\s*/)
                  .map((includedTrigger) =>
                      Trigger.parseIncludeOrIncludeTriggerString(
                          includedTrigger,
                      ),
                  )
            : undefined;
        const excludedTriggers = container.triggerExclude
            ? container.triggerExclude
                  .split(/\s*,\s*/)
                  .map((excludedTrigger) =>
                      Trigger.parseIncludeOrIncludeTriggerString(
                          excludedTrigger,
                      ),
                  )
            : undefined;
        const associatedTriggers = [];
        allTriggers.forEach((trigger) => {
            if (trigger.agent && trigger.agent !== container.agent) {
                // Remote triggers can only act on remote containers defined in the same Agent
                return;
            }
            if (
                container.agent &&
                !trigger.agent &&
                ['docker', 'dockercompose'].includes(trigger.type)
            ) {
                // Local action triggers cannot run against remote containers.
                return;
            }
            const triggerToAssociate = { ...trigger };
            // Use 'local' trigger id syntax - which is the syntax that will be used in remote Agents
            // This causes overlap between remote and local agents - a known issue that users must be aware of
            const triggerId = `${trigger.type}.${trigger.name}`;
            let associated = true;
            if (includedTriggers) {
                const includedTrigger = includedTriggers.find(
                    (tr) => Trigger.doesReferenceMatchId(tr.id, triggerId),
                );
                if (includedTrigger) {
                    triggerToAssociate.configuration.threshold =
                        includedTrigger.threshold;
                } else {
                    associated = false;
                }
            }
            if (
                excludedTriggers &&
                excludedTriggers.find((excludedTrigger) =>
                    Trigger.doesReferenceMatchId(
                        excludedTrigger.id,
                        triggerId,
                    ),
                )
            ) {
                associated = false;
            }
            if (associated) {
                associatedTriggers.push(triggerToAssociate);
            }
        });
        res.status(200).json(associatedTriggers);
    } else {
        res.sendStatus(404);
    }
}

/**
 * Run trigger.
 * @param {*} req
 * @param {*} res
 */
async function runTrigger(req, res) {
    const { id, triggerAgent, triggerType, triggerName } = req.params;

    const containerToTrigger = storeContainer.getContainer(id);
    const triggerId = triggerAgent
        ? `${triggerAgent}.${triggerType}.${triggerName}`
        : `${triggerType}.${triggerName}`;
    if (containerToTrigger) {
        if (
            containerToTrigger.agent &&
            !triggerAgent &&
            ['docker', 'dockercompose'].includes(triggerType)
        ) {
            res.status(400).json({
                error: `Cannot execute local ${triggerType} trigger on remote container ${containerToTrigger.agent}.${containerToTrigger.id}`,
            });
            return;
        }
        const triggerToRun = getTriggers()[triggerId];
        if (triggerToRun) {
            try {
                await triggerToRun.trigger(containerToTrigger);
                log.info(
                    `Trigger executed with success (type=${triggerType}, name=${triggerName}, container=${JSON.stringify(containerToTrigger)})`,
                );
                res.status(200).json({});
            } catch (e) {
                log.warn(
                    `Error when running trigger (type=${triggerType}, name=${triggerName}) (${e.message})`,
                );
                res.status(500).json({
                    error: `Error when running trigger (type=${triggerType}, name=${triggerName}) (${e.message})`,
                });
            }
        } else {
            res.status(404).json({
                error: 'Trigger not found',
            });
        }
    } else {
        res.status(404).json({
            error: 'Container not found',
        });
    }
}

/**
 * Watch an image.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function watchContainer(req, res) {
    const { id } = req.params;

    const container = storeContainer.getContainer(id);
    if (container) {
        let watcherId = `docker.${container.watcher}`;
        if (container.agent) {
            watcherId = `${container.agent}.${watcherId}`;
        }
        const watcher = getWatchers()[watcherId];
        if (!watcher) {
            res.status(500).json({
                error: `No provider found for container ${id} and provider ${watcherId}`,
            });
        } else {
            try {
                if (typeof watcher.getContainers === 'function') {
                    // Ensure container is still in store
                    // (for cases where it has been removed before running an new watchAll)
                    const containers = await watcher.getContainers();
                    const containerFound = containers.find(
                        (containerInList) => containerInList.id === container.id,
                    );

                    if (!containerFound) {
                        res.status(404).send();
                    } else {
                        // Run watchContainer from the Provider
                        const containerReport =
                            await watcher.watchContainer(container);
                        res.status(200).json(containerReport.container);
                    }
                } else {
                    // Run watchContainer from the Provider
                    const containerReport =
                        await watcher.watchContainer(container);
                    res.status(200).json(containerReport.container);
                }
            } catch (e) {
                res.status(500).json({
                    error: `Error when watching container ${id} (${e.message})`,
                });
            }
        }
    } else {
        res.sendStatus(404);
    }
}

/**
 * Update container update policy (skip/snooze controls).
 * @param req
 * @param res
 */
function patchContainerUpdatePolicy(req, res) {
    const { id } = req.params;
    const { action } = req.body || {};
    const container = storeContainer.getContainer(id);

    if (!container) {
        res.sendStatus(404);
        return;
    }

    if (!action) {
        res.status(400).json({
            error: 'Action is required',
        });
        return;
    }

    try {
        let updatePolicy = normalizeUpdatePolicy(container.updatePolicy || {});

        switch (action) {
            case 'skip-current': {
                const updateKind = container.updateKind?.kind;
                if (!['tag', 'digest'].includes(updateKind)) {
                    res.status(400).json({
                        error: 'No current update available to skip',
                    });
                    return;
                }
                const updateValue = getCurrentUpdateValue(container, updateKind);
                if (!updateValue) {
                    res.status(400).json({
                        error: 'No update value available to skip',
                    });
                    return;
                }
                if (updateKind === 'tag') {
                    updatePolicy.skipTags = uniqStrings([
                        ...(updatePolicy.skipTags || []),
                        updateValue,
                    ]);
                } else {
                    updatePolicy.skipDigests = uniqStrings([
                        ...(updatePolicy.skipDigests || []),
                        updateValue,
                    ]);
                }
                break;
            }
            case 'clear-skips': {
                delete updatePolicy.skipTags;
                delete updatePolicy.skipDigests;
                break;
            }
            case 'snooze': {
                updatePolicy.snoozeUntil = getSnoozeUntilFromActionPayload(
                    req.body || {},
                );
                break;
            }
            case 'unsnooze': {
                delete updatePolicy.snoozeUntil;
                break;
            }
            case 'clear': {
                updatePolicy = {};
                break;
            }
            default: {
                res.status(400).json({
                    error: `Unknown action ${action}`,
                });
                return;
            }
        }

        updatePolicy = normalizeUpdatePolicy(updatePolicy);
        container.updatePolicy =
            Object.keys(updatePolicy).length > 0 ? updatePolicy : undefined;
        const containerUpdated = storeContainer.updateContainer(container);
        res.status(200).json(containerUpdated);
    } catch (e) {
        res.status(400).json({
            error: e.message,
        });
    }
}

/**
 * Init Router.
 * @returns {*}
 */
export function init() {
    router.use(nocache());
    router.get('/', getContainers);
    router.post('/watch', watchContainers);
    router.get('/:id', getContainer);
    router.delete('/:id', deleteContainer);
    router.get('/:id/triggers', getContainerTriggers);
    router.post('/:id/triggers/:triggerType/:triggerName', runTrigger);
    router.post(
        '/:id/triggers/:triggerAgent/:triggerType/:triggerName',
        runTrigger,
    );
    router.patch('/:id/update-policy', patchContainerUpdatePolicy);
    router.post('/:id/watch', watchContainer);
    return router;
}
