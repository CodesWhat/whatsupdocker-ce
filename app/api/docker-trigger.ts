export const NO_DOCKER_TRIGGER_FOUND_ERROR = 'No docker trigger found for this container';

/**
 * Find a docker trigger compatible with a container's agent context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findDockerTriggerForContainer(triggers: Record<string, any>, container: any): any {
  for (const trigger of Object.values(triggers || {})) {
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
