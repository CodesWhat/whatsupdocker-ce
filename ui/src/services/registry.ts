/**
 * Get registry component icon.
 * @returns {string}
 */
function getRegistryIcon() {
  return 'fas fa-database';
}

/**
 * Get registry provider icon (acr, ecr...).
 * @param provider
 * @returns {string}
 */
function getRegistryProviderIcon(provider) {
  let icon = 'fas fa-cube';
  switch (provider.split('.')[0]) {
    case 'acr':
      icon = 'fab fa-microsoft';
      break;
    case 'custom':
      icon = 'fas fa-cubes';
      break;
    case 'ecr':
      icon = 'fab fa-aws';
      break;
    case 'forgejo':
      icon = 'fas fa-code-branch';
      break;
    case 'gcr':
      icon = 'fab fa-google';
      break;
    case 'ghcr':
      icon = 'fab fa-github';
      break;
    case 'gitea':
      icon = 'fas fa-code-branch';
      break;
    case 'gitlab':
      icon = 'fab fa-gitlab';
      break;
    case 'hub':
      icon = 'fab fa-docker';
      break;
    case 'quay':
      icon = 'fab fa-redhat';
      break;
    case 'lscr':
      icon = 'fab fa-linux';
      break;
    case 'trueforge':
      icon = 'fas fa-cube';
      break;
    case 'codeberg':
      icon = 'fas fa-mountain';
      break;
    case 'dhi':
      icon = 'fab fa-docker';
      break;
    case 'docr':
      icon = 'fab fa-digital-ocean';
      break;
  }
  return icon;
}

/**
 * Get registry provider brand color.
 * @param provider
 * @returns {string}
 */
function getRegistryProviderColor(provider) {
  switch (provider.split('.')[0]) {
    case 'acr':
      return '#0078D4';
    case 'ecr':
      return '#FF9900';
    case 'forgejo':
      return '#FB923C';
    case 'gcr':
      return '#4285F4';
    case 'ghcr':
      return '#8B5CF6';
    case 'gitea':
      return '#609926';
    case 'gitlab':
      return '#FC6D26';
    case 'hub':
      return '#2496ED';
    case 'quay':
      return '#EE0000';
    case 'lscr':
      return '#DA3B8A';
    case 'codeberg':
      return '#2185D0';
    case 'dhi':
      return '#2496ED';
    case 'docr':
      return '#0080FF';
    case 'custom':
      return '#6B7280';
    case 'trueforge':
      return '#6B7280';
    default:
      return '#6B7280';
  }
}

/**
 * get all registries.
 * @returns {Promise<any>}
 */
async function getAllRegistries() {
  const response = await fetch('/api/registries', { credentials: 'include' });
  return response.json();
}

export { getRegistryIcon, getRegistryProviderIcon, getRegistryProviderColor, getAllRegistries };
