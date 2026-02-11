function getServerIcon() {
  return "fas fa-server";
}

async function getServer() {
  const response = await fetch("/api/server", { credentials: "include" });
  return response.json();
}

export { getServerIcon, getServer };
