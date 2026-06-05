import axios, { AxiosHeaders } from "axios";
import { getAuthToken, isJwtExpired } from "../utils/jwt";

const resolveBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl !== undefined && envUrl !== "") {
        return String(envUrl).replace(/\/$/, "");
    }
    if (import.meta.env.DEV) {
        return "";
    }
    return "http://localhost:8080";
};

const apiService = axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const resolveRequestUrl = (config) => {
    const base = String(config?.baseURL ?? apiService.defaults.baseURL ?? "").replace(/\/$/, "");
    const path = String(config?.url || "");
    if (path.startsWith("http")) return path;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

const isAuthRequest = (config) =>
    config?.skipAuth === true || /\/api\/auth\//i.test(resolveRequestUrl(config));

export const applyAuthToken = (token) => {
    if (!token) return;
    const value = `Bearer ${token}`;
    const common = AxiosHeaders.from(apiService.defaults.headers.common || {});
    common.set("Authorization", value);
    apiService.defaults.headers.common = common;
};

export const clearAuthToken = () => {
    const common = AxiosHeaders.from(apiService.defaults.headers.common || {});
    common.delete("Authorization");
    apiService.defaults.headers.common = common;
};

const attachAuthorizationHeader = (config, token) => {
    const headers = AxiosHeaders.from(config.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
};

const parseErrorBody = (error) => {
    const data = error?.response?.data;
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return { message: data };
        }
    }
    return data && typeof data === "object" ? data : {};
};

let sessionExpiredDispatched = false;

export const resetSessionExpiredFlag = () => {
    sessionExpiredDispatched = false;
};

const notifySessionExpired = () => {
    if (sessionExpiredDispatched) return;
    sessionExpiredDispatched = true;
    clearAuthToken();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    try {
        localStorage.removeItem("permisos");
    } catch {
        /* ignore */
    }
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
};

const isSessionExpiredResponse = (error) => {
    const code = parseErrorBody(error)?.code;
    return code === "TOKEN_EXPIRED" || code === "TOKEN_MISSING" || code === "TOKEN_INVALID";
};

const storedToken = getAuthToken();
if (storedToken) {
    applyAuthToken(storedToken);
}

apiService.interceptors.request.use(
    (config) => {
        if (isAuthRequest(config)) {
            if (config.headers instanceof AxiosHeaders) {
                config.headers.delete("Authorization");
            } else if (config.headers) {
                delete config.headers.Authorization;
            }
            return config;
        }

        const token = getAuthToken();
        if (!token) {
            return Promise.reject({
                code: "NO_TOKEN",
                message: "Sin token de autenticación",
            });
        }

        if (isJwtExpired(token)) {
            return Promise.reject({
                code: "TOKEN_EXPIRED",
                message: "Sesión expirada",
            });
        }

        attachAuthorizationHeader(config, token);
        return config;
    },
    (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const config = error.config;

        if (status === 403) {
            const body = parseErrorBody(error);
            error.forbidden = true;
            error.message = body.message || "No tienes permisos para realizar esta acción";
            return Promise.reject(error);
        }

        if (status === 401 && config && !isAuthRequest(config)) {
            if (isSessionExpiredResponse(error)) {
                notifySessionExpired();
            } else {
                const body = parseErrorBody(error);
                error.authError = true;
                error.message = body.message || "Error de autenticación";
            }
        }

        if (error?.code === "TOKEN_EXPIRED" || error?.code === "NO_TOKEN") {
            if (error?.code === "TOKEN_EXPIRED") {
                notifySessionExpired();
            }
        }

        return Promise.reject(error);
    }
);

export const getApiErrorMessage = (err, fallback = "Error en la operación") => {
    if (err?.code === "NO_TOKEN") return "Sesión no iniciada.";
    if (err?.code === "TOKEN_EXPIRED") return "Sesión expirada. Inicia sesión nuevamente.";
    if (err?.forbidden) return err.message;
    if (err?.authError) return err.message || "Error de autenticación.";
    if (err?.response?.status === 401) {
        const body = parseErrorBody(err);
        if (body.code === "TOKEN_EXPIRED" || body.code === "TOKEN_MISSING" || body.code === "TOKEN_INVALID") {
            return "Sesión expirada. Inicia sesión nuevamente.";
        }
        if (body.code === "FORBIDDEN") return body.message || "No tienes permisos para realizar esta acción.";
        return body.message || "Error de autenticación.";
    }
    const data = err?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors
            .map((e) => e.defaultMessage || e.message)
            .filter(Boolean)
            .join(". ");
    }
    if (err?.response?.status >= 500) return "Error del servidor. Intenta más tarde.";
    return err?.message || fallback;
};

export { apiService };
export default apiService;
