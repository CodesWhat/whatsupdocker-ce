import type { AuditEntry } from '../model/audit.js';
import { getAuditCounter } from '../prometheus/audit.js';
import * as auditStore from '../store/audit.js';

/**
 * Insert an audit entry and increment the shared audit counter.
 */
export function recordAuditEvent({
  action,
  status,
  container,
  containerName = container?.name,
  containerImage = container?.image?.name,
  details,
  fromVersion,
  toVersion,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  container?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  containerName?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  containerImage?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromVersion?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toVersion?: any;
}) {
  const entry: Partial<AuditEntry> = {
    id: '',
    timestamp: new Date().toISOString(),
    action,
    containerName,
    containerImage,
    status,
  };

  if (details !== undefined) {
    entry.details = details;
  }
  if (fromVersion !== undefined) {
    entry.fromVersion = fromVersion;
  }
  if (toVersion !== undefined) {
    entry.toVersion = toVersion;
  }

  auditStore.insertAudit(entry as AuditEntry);
  getAuditCounter()?.inc({ action });
}
