export function resetAppStorageOnce() {
  // Kept as a compatibility no-op. Dashboard data is now cloud-first; deleting
  // the cache at startup could otherwise destroy the only offline copy.
}

export function readStorage(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
