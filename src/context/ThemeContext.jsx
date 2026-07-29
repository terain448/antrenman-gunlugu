import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { APP_THEMES } from "../constants/theme.js";
import { useAuth } from "./AuthContext.jsx";
import { useCoupleData } from "./CoupleDataContext.jsx";
import { readStorage, writeStorage } from "../utils/storage.js";

const THEME_STORAGE_KEY = "couple_theme";
const DEFAULT_THEME_ID = "amethyst";

const ThemeContext = createContext(null);

function getTheme(themeId) {
  return APP_THEMES.find((theme) => theme.id === themeId) ?? APP_THEMES[0];
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const { preferences, setUserTheme } = useCoupleData();
  const [themeId, setThemeIdState] = useState(() => readStorage(THEME_STORAGE_KEY, DEFAULT_THEME_ID));
  const activeTheme = getTheme(themeId);

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme.id;
  }, [activeTheme.id]);

  useEffect(() => {
    const cloudThemeId = preferences?.[user?.id]?.themeId;
    if (!cloudThemeId) return;
    const nextTheme = getTheme(cloudThemeId);
    writeStorage(THEME_STORAGE_KEY, nextTheme.id);
    setThemeIdState(nextTheme.id);
  }, [preferences, user?.id]);

  const setThemeId = useCallback((nextThemeId) => {
    const nextTheme = getTheme(nextThemeId);
    writeStorage(THEME_STORAGE_KEY, nextTheme.id);
    setThemeIdState(nextTheme.id);
    setUserTheme(user?.id, nextTheme.id);
  }, [setUserTheme, user?.id]);

  const value = useMemo(
    () => ({
      activeTheme,
      themes: APP_THEMES,
      setThemeId,
    }),
    [activeTheme, setThemeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
