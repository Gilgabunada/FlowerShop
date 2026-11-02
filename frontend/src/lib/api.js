// Small wrapper around fetch for the FlowerShop API.
// Usage:
//   import { api, getToken, setToken } from "./lib/api";
//   const { status, data } = await api("/users/login", {
//     method: "POST",
//     body: { email, password },
//   });

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "flowerShopToken";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = "GET", body, params } = {}) {
  const token = getToken();

  const url = new URL(BASE + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response body — leave as null
  }

  return { status: res.status, ok: res.ok, data };
}

// Convenience: unwrap `data` in the happy path, otherwise throw with message
export async function must(path, options) {
  const { status, data } = await api(path, options);
  if (!status || (status >= 400)) {
    const message = data?.error?.message || data?.error || data?.message || `Request failed (${status})`;
    throw new Error(typeof message === "string" ? message : "Request failed");
  }
  return data;
}
