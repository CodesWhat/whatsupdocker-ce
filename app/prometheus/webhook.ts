// @ts-nocheck
import { Counter, register } from 'prom-client';

let webhookCounter;

export function init() {
  if (webhookCounter) {
    register.removeSingleMetric(webhookCounter.name);
  }
  webhookCounter = new Counter({
    name: 'dd_webhook_total',
    help: 'Total count of webhook operations',
    labelNames: ['action'],
  });
}

export function getWebhookCounter() {
  return webhookCounter;
}
