function getStoreIcon() {
  return 'fas fa-copy';
}

async function getStore() {
  const response = await fetch('/api/store', { credentials: 'include' });
  return response.json();
}

export { getStoreIcon, getStore };
