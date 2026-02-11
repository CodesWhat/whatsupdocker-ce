export interface AuditEntry {
    id: string;
    timestamp: string;
    action:
        | 'update-available'
        | 'update-applied'
        | 'update-failed'
        | 'container-added'
        | 'container-removed'
        | 'rollback'
        | 'preview';
    containerName: string;
    containerImage?: string;
    fromVersion?: string;
    toVersion?: string;
    triggerName?: string;
    status: 'success' | 'error' | 'info';
    details?: string;
}
