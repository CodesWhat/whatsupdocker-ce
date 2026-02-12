function getTriggerIcon() {
  return 'fas fa-bolt';
}

function getTriggerProviderIcon(type) {
  switch (type) {
    case 'http':
      return 'fas fa-globe';
    case 'smtp':
      return 'fas fa-envelope';
    case 'slack':
      return 'fab fa-slack';
    case 'discord':
      return 'fab fa-discord';
    case 'telegram':
      return 'fab fa-telegram';
    case 'mqtt':
      return 'fas fa-tower-broadcast';
    case 'kafka':
      return 'fas fa-bars-staggered';
    case 'pushover':
      return 'fas fa-bell';
    case 'gotify':
      return 'fas fa-bell';
    case 'ntfy':
      return 'fas fa-bell';
    case 'ifttt':
      return 'fas fa-wand-magic-sparkles';
    case 'apprise':
      return 'fas fa-paper-plane';
    case 'command':
      return 'fas fa-terminal';
    case 'dockercompose':
      return 'fab fa-docker';
    case 'rocketchat':
      return 'fas fa-comment';
    case 'docker':
      return 'fab fa-docker';
    default:
      return 'fas fa-bolt';
  }
}

async function getAllTriggers() {
  const response = await fetch('/api/triggers', { credentials: 'include' });
  return response.json();
}

async function runTrigger({ triggerType, triggerName, container }) {
  const response = await fetch(`/api/triggers/${triggerType}/${triggerName}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(container),
  });
  const json = await response.json();
  if (response.status !== 200) {
    throw new Error(json.error ? json.error : 'Unknown error');
  }
  return json;
}

export { getTriggerIcon, getTriggerProviderIcon, getAllTriggers, runTrigger };
