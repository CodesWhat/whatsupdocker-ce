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
const REGISTRY_PROVIDER_ICONS = {
  acr: 'fab fa-microsoft',
  custom: 'fas fa-cubes',
  ecr: 'fab fa-aws',
  forgejo: 'fas fa-code-branch',
  gcr: 'fab fa-google',
  ghcr: 'fab fa-github',
  gitea: 'fas fa-code-branch',
  gitlab: 'fab fa-gitlab',
  hub: 'fab fa-docker',
  quay: 'fab fa-redhat',
  lscr: 'fab fa-linux',
  codeberg: 'fas fa-mountain',
  dhi: 'fab fa-docker',
  docr: 'fab fa-digital-ocean',
};

function getRegistryProviderIcon(provider) {
  const providerName = `${provider || ''}`.split('.')[0];
  return REGISTRY_PROVIDER_ICONS[providerName] || 'fas fa-cube';
}

/**
 * Get registry provider brand color.
 * @param provider
 * @returns {string}
 */
const REGISTRY_PROVIDER_COLORS = {
  acr: '#0078D4',
  ecr: '#FF9900',
  forgejo: '#FB923C',
  gcr: '#4285F4',
  ghcr: '#8B5CF6',
  gitea: '#609926',
  gitlab: '#FC6D26',
  hub: '#2496ED',
  quay: '#EE0000',
  lscr: '#DA3B8A',
  codeberg: '#2185D0',
  dhi: '#2496ED',
  docr: '#0080FF',
  custom: '#6B7280',
  trueforge: '#6B7280',
};

function getRegistryProviderColor(provider) {
  return REGISTRY_PROVIDER_COLORS[provider.split('.')[0]] || '#6B7280';
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
