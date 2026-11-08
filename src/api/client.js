import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const tokenStore = {
  get access() {
    return localStorage.getItem("access");
  },
  get refresh() {
    return localStorage.getItem("refresh");
  },
  set(access, refresh) {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  },
  clear() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },
};

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retried &&
      tokenStore.refresh &&
      !original.url.includes("/jwt/")
    ) {
      original._retried = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${BASE_URL}/api/auth/jwt/refresh/`, {
            refresh: tokenStore.refresh,
          });
        const { data } = await refreshing;
        refreshing = null;

        tokenStore.set(data.access, data.refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch {
        refreshing = null;
        tokenStore.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
