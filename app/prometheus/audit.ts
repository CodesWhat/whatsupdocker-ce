import { Counter, register } from 'prom-client';

const METRIC_NAME = 'dd_audit_entries_total';

let auditCounter: Counter<string> | undefined;

export function init(): void {
  if (auditCounter) {
    register.removeSingleMetric(METRIC_NAME);
  }
  auditCounter = new Counter({
    name: METRIC_NAME,
    help: 'Total count of audit log entries',
    labelNames: ['action'],
  });
}

export function getAuditCounter(): Counter<string> | undefined {
  return auditCounter;
}
