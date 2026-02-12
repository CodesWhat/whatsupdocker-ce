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
  switch (provider.split('.')[0]) {
    case 'acr':
      return 'fab fa-microsoft';
    case 'custom':
      return 'fas fa-cubes';
    case 'ecr':
      return 'fab fa-aws';
    case 'forgejo':
      return 'fas fa-code-branch';
    case 'gcr':
      return 'fab fa-google';
    case 'ghcr':
      return 'fab fa-github';
    case 'gitea':
      return 'fas fa-code-branch';
    case 'gitlab':
      return 'fab fa-gitlab';
    case 'hub':
      return 'fab fa-docker';
    case 'quay':
      return 'fab fa-redhat';
    case 'lscr':
      return 'fab fa-linux';
    case 'codeberg':
      return 'fas fa-mountain';
    case 'dhi':
      return 'fab fa-docker';
    case 'docr':
      return 'fab fa-digital-ocean';
    default:
      return 'fas fa-cube';
  }
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
