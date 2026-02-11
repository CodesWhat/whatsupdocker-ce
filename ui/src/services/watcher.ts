function getWatcherIcon() {
  return "fas fa-arrows-rotate";
}

async function getAllWatchers() {
  const response = await fetch("/api/watchers", { credentials: "include" });
  return response.json();
}

export { getWatcherIcon, getAllWatchers };
