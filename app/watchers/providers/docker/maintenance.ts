import cron from 'node-cron';

/**
 * Check if the current time falls within a maintenance window defined by a cron expression.
 * The cron expression defines WHEN updates are ALLOWED (the maintenance window).
 * Returns true if the current minute matches the cron schedule.
 *
 * @param cronExpr - A standard 5-field cron expression (minute hour day month weekday)
 * @param tz - IANA timezone string (defaults to 'UTC')
 * @returns true if now is inside the maintenance window
 */
export function isInMaintenanceWindow(
    cronExpr: string,
    tz: string = 'UTC',
): boolean {
    if (!cronExpr || !cron.validate(cronExpr)) {
        return false;
    }

    const task = cron.createTask(cronExpr, () => {}, { timezone: tz }) as any;

    // node-cron's timeMatcher.match() checks seconds too; for 5-field cron
    // the seconds expression defaults to [0], so we normalize to second 0
    // to get a pure minute-level match.
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    return task.timeMatcher.match(now);
}
