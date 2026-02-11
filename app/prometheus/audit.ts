// @ts-nocheck
import { Counter, register } from 'prom-client';

let auditCounter;

export function init() {
    if (auditCounter) {
        register.removeSingleMetric(auditCounter.name);
    }
    auditCounter = new Counter({
        name: 'dd_audit_entries_total',
        help: 'Total count of audit log entries',
        labelNames: ['action'],
    });
}

export function getAuditCounter() {
    return auditCounter;
}
