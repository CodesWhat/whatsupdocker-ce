import { Counter, register } from 'prom-client';

const METRIC_NAME = 'dd_webhook_total';

let webhookCounter: Counter<string> | undefined;

export function init(): void {
  if (webhookCounter) {
    register.removeSingleMetric(METRIC_NAME);
  }
  webhookCounter = new Counter({
    name: METRIC_NAME,
    help: 'Total count of webhook operations',
    labelNames: ['action'],
  });
}

export function getWebhookCounter(): Counter<string> | undefined {
  return webhookCounter;
}
