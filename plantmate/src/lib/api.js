import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:7777";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  (err) => {
    const s = err?.response?.status;
    const url = err?.config?.url || "";
    // don't auto-redirect for auth endpoints
    if (s === 401 && !url.startsWith("/auth")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
