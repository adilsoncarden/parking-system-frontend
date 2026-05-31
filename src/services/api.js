import axios from "axios";

const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const resolveRequestUrl = (config) => {
    const base = String(config?.baseURL || apiService.defaults.baseURL || "").replace(/\/$/, "");
    const path = String(config?.url || "");
    if (path.startsWith("http")) return path;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

const isAuthRequest = (config) =>
    config?.skipAuth === true || /\/api\/auth\//i.test(resolveRequestUrl(config));

const getStoredToken = () => {
    const raw = localStorage.getItem("token");
    if (!raw || raw === "null" || raw === "undefined") return null;
    return raw.trim();
};

let sessionExpiredDispatched = false;

export const resetSessionExpiredFlag = () => {
    sessionExpiredDispatched = false;
};

const notifySessionExpired = () => {
    if (sessionExpiredDispatched) return;
    sessionExpiredDispatched = true;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
};

apiService.interceptors.request.use(
    (config) => {
        if (isAuthRequest(config)) {
            if (config.headers) {
                delete config.headers.Authorization;
            }
            return config;
        }

        const token = getStoredToken();
        if (!token) {
            return Promise.reject({
                code: "NO_TOKEN",
                message: "Sin token de autenticación",
            });
        }

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const config = error.config;

        if (status === 401 && config && !isAuthRequest(config)) {
            notifySessionExpired();
        }

        if (status === 403) {
            error.forbidden = true;
            error.message = error.response?.data?.message || "No tienes permisos para realizar esta acción";
        }

        return Promise.reject(error);
    }
);

export const getApiErrorMessage = (err, fallback = "Error en la operación") => {
    if (err?.code === "NO_TOKEN") return "Sesión no iniciada.";
    if (err?.forbidden) return err.message;
    if (err?.response?.status === 401) return "Sesión expirada. Inicia sesión nuevamente.";
    const data = err?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.map((e) => e.defaultMessage || e.message).filter(Boolean).join(". ");
    }
    if (err?.response?.status >= 500) return "Error del servidor. Intenta más tarde.";
    return err?.message || fallback;
};

export { apiService };
export default apiService;
