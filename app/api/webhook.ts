// @ts-nocheck
import { timingSafeEqual } from 'node:crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import nocache from 'nocache';
import { getWebhookConfiguration } from '../configuration/index.js';
import logger from '../log/index.js';
import { getAuditCounter } from '../prometheus/audit.js';
import { getWebhookCounter } from '../prometheus/webhook.js';
import * as registry from '../registry/index.js';
import * as auditStore from '../store/audit.js';
import * as storeContainer from '../store/container.js';

const log = logger.child({ component: 'webhook' });

const router = express.Router();

/**
 * Authenticate webhook requests via Bearer token.
 */
function authenticateToken(req, res, next) {
  const webhookConfig = getWebhookConfiguration();
  if (!webhookConfig.enabled) {
    res.status(403).json({ error: 'Webhooks are disabled' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const configuredToken = webhookConfig.token;

  // Reject empty or missing configured token (misconfiguration guard)
  if (!configuredToken) {
    log.error('Webhook token is not configured; rejecting request');
    res.status(500).json({ error: 'Webhook authentication is misconfigured' });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  const tokenBuf = Buffer.from(token, 'utf8');
  const expectedBuf = Buffer.from(configuredToken, 'utf8');
  if (tokenBuf.length !== expectedBuf.length || !timingSafeEqual(tokenBuf, expectedBuf)) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  next();
}

/**
 * Find a container by name from the store.
 */
function findContainerByName(containerName) {
  const containers = storeContainer.getContainers();
  return containers.find((c) => c.name === containerName);
}

/**
 * Find a docker trigger that can handle this container.
 */
function findDockerTrigger(container) {
  const triggers = registry.getState().trigger;
  for (const trigger of Object.values(triggers)) {
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
 * POST /watch — trigger full watch cycle on ALL watchers.
 */
async function watchAll(req, res) {
  const watchers = registry.getState().watcher;
  const watcherEntries = Object.entries(watchers);

  try {
    await Promise.all(watcherEntries.map(([, watcher]) => watcher.watch()));

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action: 'webhook-watch',
      containerName: '*',
      status: 'success',
      details: `Triggered ${watcherEntries.length} watcher(s)`,
    });
    getAuditCounter()?.inc({ action: 'webhook-watch' });
    getWebhookCounter()?.inc({ action: 'watch-all' });

    res.status(200).json({
      message: 'Watch cycle triggered',
      watchers: watcherEntries.length,
    });
  } catch (e) {
    log.warn(`Error triggering watch cycle (${e.message})`);

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action: 'webhook-watch',
      containerName: '*',
      status: 'error',
      details: e.message,
    });
    getAuditCounter()?.inc({ action: 'webhook-watch' });
    getWebhookCounter()?.inc({ action: 'watch-all' });

    res.status(500).json({ error: 'Error triggering watch cycle' });
  }
}

/**
 * POST /watch/:containerName — watch a specific container by name.
 */
async function watchContainer(req, res) {
  const { containerName } = req.params;
  const container = findContainerByName(containerName);

  if (!container) {
    res.status(404).json({ error: `Container ${containerName} not found` });
    return;
  }

  const watchers = registry.getState().watcher;

  try {
    await Promise.all(Object.values(watchers).map((watcher) => watcher.watchContainer(container)));

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action: 'webhook-watch-container',
      containerName: container.name,
      containerImage: container.image?.name,
      status: 'success',
    });
    getAuditCounter()?.inc({ action: 'webhook-watch-container' });
    getWebhookCounter()?.inc({ action: 'watch-container' });

    res.status(200).json({
      message: `Watch triggered for container ${containerName}`,
      container: containerName,
    });
  } catch (e) {
    log.warn(`Error watching container ${containerName} (${e.message})`);

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action: 'webhook-watch-container',
      containerName: container.name,
      containerImage: container.image?.name,
      status: 'error',
      details: e.message,
    });
    getAuditCounter()?.inc({ action: 'webhook-watch-container' });
    getWebhookCounter()?.inc({ action: 'watch-container' });

    res.status(500).json({ error: `Error watching container ${containerName}` });
  }
}

/**
 * POST /update/:containerName — trigger update on a specific container by name.
 */
async function updateContainer(req, res) {
  const { containerName } = req.params;
  const container = findContainerByName(containerName);

  if (!container) {
    res.status(404).json({ error: `Container ${containerName} not found` });
    return;
  }

  const trigger = findDockerTrigger(container);
  if (!trigger) {
    res.status(404).json({ error: 'No docker trigger found for this container' });
    return;
  }

  try {
    await trigger.trigger(container);

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action: 'webhook-update',
      containerName: container.name,
      containerImage: container.image?.name,
      status: 'success',
    });
    getAuditCounter()?.inc({ action: 'webhook-update' });
    getWebhookCounter()?.inc({ action: 'update-container' });

    res.status(200).json({
      message: `Update triggered for container ${containerName}`,
      container: containerName,
    });
  } catch (e) {
    log.warn(`Error updating container ${containerName} (${e.message})`);

    auditStore.insertAudit({
      id: '',
      timestamp: new Date().toISOString(),
      action: 'webhook-update',
      containerName: container.name,
      containerImage: container.image?.name,
      status: 'error',
      details: e.message,
    });
    getAuditCounter()?.inc({ action: 'webhook-update' });
    getWebhookCounter()?.inc({ action: 'update-container' });

    res.status(500).json({ error: `Error updating container ${containerName}` });
  }
}

/**
 * Init Router.
 * @returns {*}
 */
export function init() {
  const webhookLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });
  router.use(webhookLimiter);
  router.use(nocache());
  router.use(authenticateToken);
  router.post('/watch', watchAll);
  router.post('/watch/:containerName', watchContainer);
  router.post('/update/:containerName', updateContainer);
  return router;
}
