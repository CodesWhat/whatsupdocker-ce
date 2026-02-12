// @ts-nocheck
import express from 'express';
import nocache from 'nocache';
import { getServerConfiguration } from '../configuration/index.js';
import logger from '../log/index.js';
import { getAuditCounter } from '../prometheus/audit.js';
import { getContainerActionsCounter } from '../prometheus/container-actions.js';
import * as registry from '../registry/index.js';
import * as auditStore from '../store/audit.js';
import * as storeContainer from '../store/container.js';

const log = logger.child({ component: 'container-actions' });

const router = express.Router();

/**
 * Return registered triggers.
 */
function getTriggers() {
  return registry.getState().trigger;
}

/**
 * Find a docker trigger that can handle this container.
 */
function findDockerTrigger(container) {
  const triggers = getTriggers();
  for (const [id, trigger] of Object.entries(triggers)) {
    if (trigger.type !== 'docker') {
      continue;
    }
    if (trigger.agent && trigger.agent !== container.agent) {
      continue;
    }
    if (container.agent && !trigger.agent) {
      continue;
    }
    return trigger;
  }
  return undefined;
}

/**
 * Execute a container action (start, stop, restart).
 */
const ACTION_MESSAGES = {
  start: 'Container started successfully',
  stop: 'Container stopped successfully',
  restart: 'Container restarted successfully',
};

async function executeAction(req, res, action, method) {
  const serverConfiguration = getServerConfiguration();
  if (!serverConfiguration.feature.containeractions) {
    res.sendStatus(403);
    return;
  }

  const { id } = req.params;

  const container = storeContainer.getContainer(id);
  if (!container) {
    res.sendStatus(404);
    return;
  }

  const trigger = findDockerTrigger(container);
  if (!trigger) {
    res.status(404).json({ error: 'No docker trigger found for this container' });
    return;
  }

  try {
    const watcher = trigger.getWatcher(container);
    const { dockerApi } = watcher;
    const dockerContainer = dockerApi.getContainer(container.id);
    await dockerContainer[method]();

    // Update container status in the store so the UI reflects the change
    const inspectResult = await dockerContainer.inspect();
    const newStatus = inspectResult?.State?.Status;
    let updatedContainer = container;
    if (newStatus) {
      updatedContainer = storeContainer.updateContainer({ ...container, status: newStatus });
    }

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action,
      containerName: container.name,
      containerImage: container.image?.name,
      status: 'success',
    });
    getAuditCounter()?.inc({ action });
    getContainerActionsCounter()?.inc({ action });

    res.status(200).json({ message: ACTION_MESSAGES[method], container: updatedContainer });
  } catch (e) {
    log.warn(`Error performing ${method} on container ${id} (${e.message})`);

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action,
      containerName: container.name,
      containerImage: container.image?.name,
      status: 'error',
      details: e.message,
    });
    getAuditCounter()?.inc({ action });
    getContainerActionsCounter()?.inc({ action });

    res.status(500).json({
      error: `Error performing ${method} on container (${e.message})`,
    });
  }
}

/**
 * Start a stopped container.
 */
async function startContainer(req, res) {
  await executeAction(req, res, 'container-start', 'start');
}

/**
 * Stop a running container.
 */
async function stopContainer(req, res) {
  await executeAction(req, res, 'container-stop', 'stop');
}

/**
 * Restart a container.
 */
async function restartContainer(req, res) {
  await executeAction(req, res, 'container-restart', 'restart');
}

/**
 * Init Router.
 * @returns {*}
 */
export function init() {
  router.use(nocache());
  router.post('/:id/start', startContainer);
  router.post('/:id/stop', stopContainer);
  router.post('/:id/restart', restartContainer);
  return router;
}
