export interface LogEntry {
    timestamp: number;
    level: string;
    component: string;
    msg: string;
}

const LEVEL_ORDER: Record<string, number> = {
    debug: 10,
    trace: 10,
    info: 20,
    warn: 30,
    error: 40,
    fatal: 50,
};

const MAX_SIZE = 1000;
const buffer: LogEntry[] = new Array(MAX_SIZE);
let head = 0;
let count = 0;

export function addEntry(entry: LogEntry): void {
    buffer[head] = entry;
    head = (head + 1) % MAX_SIZE;
    if (count < MAX_SIZE) {
        count++;
    }
}

export function getEntries(
    options?: {
        level?: string;
        component?: string;
        tail?: number;
        since?: number;
    },
): LogEntry[] {
    if (count === 0) {
        return [];
    }

    const start = (head - count + MAX_SIZE) % MAX_SIZE;
    let entries: LogEntry[] = [];
    for (let i = 0; i < count; i++) {
        entries.push(buffer[(start + i) % MAX_SIZE]);
    }

    const minLevel = options?.level ? (LEVEL_ORDER[options.level] ?? 0) : 0;
    if (minLevel > 0) {
        entries = entries.filter(
            (e) => (LEVEL_ORDER[e.level] ?? 0) >= minLevel,
        );
    }

    if (options?.component) {
        const comp = options.component;
        entries = entries.filter((e) => e.component.includes(comp));
    }

    if (options?.since !== undefined) {
        const since = options.since;
        entries = entries.filter((e) => e.timestamp >= since);
    }

    const tail = options?.tail ?? 100;
    if (entries.length > tail) {
        entries = entries.slice(entries.length - tail);
    }

    return entries;
}
