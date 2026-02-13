export async function previewContainer(id: string) {
  const response = await fetch(`/api/containers/${id}/preview`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Preview failed: ${response.statusText}`);
  }
  return response.json();
}
