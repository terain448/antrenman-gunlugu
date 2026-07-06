import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiClient } from "../services/apiClient.js";
import { readStorage, writeStorage } from "../utils/storage.js";

const AUTH_STORAGE_KEY = "couple_auth";
const TOKEN_STORAGE_KEY = "couple_token";

const PRIVATE_USERS = [
  { id: "admin", name: "Tuna", role: "admin", email: "Tuna", password: "Y01092024t." },
  { id: "partner", name: "Yağmur", role: "partner", email: "Yağmur", password: "Y01092024t." },
];

const AuthContext = createContext(null);

function createLocalToken(user) {
  return btoa(JSON.stringify({ sub: user.id, role: user.role, private: true }));
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStorage(AUTH_STORAGE_KEY, null));

  const login = useCallback(async ({ email, password }) => {
    const normalizedLogin = email.trim().toLocaleLowerCase("tr-TR");

    try {
      const response = await apiClient.login({ email: normalizedLogin, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      writeStorage(AUTH_STORAGE_KEY, response.user);
      setSession(response.user);
      return response.user;
    } catch {
      const user = PRIVATE_USERS.find(
        (item) => item.email.toLocaleLowerCase("tr-TR") === normalizedLogin && item.password === password,
      );

      if (!user) {
        throw new Error("Kullanıcı adı veya şifre hatalı.");
      }

      const safeUser = toSafeUser(user);
      localStorage.setItem(TOKEN_STORAGE_KEY, createLocalToken(safeUser));
      writeStorage(AUTH_STORAGE_KEY, safeUser);
      setSession(safeUser);
      return safeUser;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
