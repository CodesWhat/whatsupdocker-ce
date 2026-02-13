import log from '../log/index.js';
import { getState } from '../registry/index.js';
import { AgentClient, type AgentClientConfig } from './AgentClient.js';
import { addAgent } from './manager.js';

export * from './manager.js';

export async function init(): Promise<void> {
  const registryState = getState();
  const agents = registryState.agent;

  Object.keys(agents).forEach((agentId) => {
    const agentComponent = agents[agentId];
    const name = agentComponent.name;
    const config = agentComponent.configuration as AgentClientConfig;

    if (!config.host || !config.secret) {
      log.warn(`Skipping agent ${name}: Missing host or secret`);
      return;
    }

    const client = new AgentClient(name, config);
    addAgent(client);
    // Start without awaiting to not block main init
    client.init();
  });
}
