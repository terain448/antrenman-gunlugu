const RESET_MARKER_KEY = "couple_storage_reset_2026_07_07";

export function resetAppStorageOnce() {
  if (localStorage.getItem(RESET_MARKER_KEY)) {
    return;
  }

  const keysToRemove = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (key?.startsWith("couple_") || key?.startsWith("profile_photo_")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(RESET_MARKER_KEY, "true");
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
