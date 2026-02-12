function getAuthenticationIcon() {
  return 'fas fa-lock';
}

function getAuthProviderIcon(type) {
  switch (type) {
    case 'basic':
      return 'fas fa-key';
    case 'oidc':
      return 'fas fa-openid';
    case 'anonymous':
      return 'fas fa-user-secret';
    default:
      return 'fas fa-lock';
  }
}

async function getAllAuthentications() {
  const response = await fetch('/api/authentications', { credentials: 'include' });
  return response.json();
}

export { getAuthenticationIcon, getAuthProviderIcon, getAllAuthentications };
