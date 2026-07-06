const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("couple_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Bir hata oluştu." }));
    throw new Error(error.message);
  }

  return response.json();
}

export const apiClient = {
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
