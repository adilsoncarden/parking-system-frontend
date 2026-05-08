import axios from "axios";

// ═══════════════════════════════════════════════════════════
// Cliente HTTP central
// Todas las llamadas al backend pasan por aquí.
// El interceptor agrega automáticamente el JWT a cada petición.
// ═══════════════════════════════════════════════════════════

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Antes de cada petición: si hay token, lo agrega al header ──
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Cuando llega respuesta: si hay error 401, cierra sesión ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;