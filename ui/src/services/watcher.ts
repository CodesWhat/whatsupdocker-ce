function getWatcherIcon() {
  return 'fas fa-eye';
}

function getWatcherProviderIcon(type) {
  switch (type) {
    case 'docker':
      return 'fab fa-docker';
    default:
      return 'fas fa-eye';
  }
}

async function getAllWatchers() {
  const response = await fetch('/api/watchers', { credentials: 'include' });
  return response.json();
}

export { getWatcherIcon, getWatcherProviderIcon, getAllWatchers };
