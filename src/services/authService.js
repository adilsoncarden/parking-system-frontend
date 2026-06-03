import apiService, { applyAuthToken, clearAuthToken, resetSessionExpiredFlag } from "./api";
import { clearStoredPermisos, setStoredPermisos } from "../utils/permissions";

export const authService = {

    login: async ({ email, password }) => {
        try {
            const response = await apiService.post(
                "/api/auth/login",
                { email, password },
                { skipAuth: true }
            );
            const { token, usuario, permisos } = response.data;

            if (!token) {
                return { ok: false, error: "El servidor no devolvió un token" };
            }

            resetSessionExpiredFlag();
            const normalizedToken = String(token).trim();
            applyAuthToken(normalizedToken);
            localStorage.setItem("token", normalizedToken);
            localStorage.setItem("user", JSON.stringify(usuario || { email }));
            localStorage.setItem("isAuthenticated", "true");
            setStoredPermisos(permisos || []);

            return { ok: true, user: usuario, token: normalizedToken, permisos: permisos || [] };

        } catch (error) {
            if (error.response?.status === 404) {
                return { ok: false, error: "Usuario no encontrado" };
            }
            if (error.response?.status === 403) {
                return { ok: false, error: "Contraseña incorrecta" };
            }
            if (error.response?.status === 401) {
                return { ok: false, error: "Email o contraseña incorrectos" };
            }
            if (error.code === "ERR_NETWORK") {
                return { ok: false, error: "No se puede conectar al servidor. Verifica que el backend esté corriendo." };
            }
            const msg = typeof error.response?.data === "string"
                ? error.response.data
                : null;
            return { ok: false, error: msg || "Error al iniciar sesión. Intenta de nuevo." };
        }
    },

    logout: () => {
        clearAuthToken();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        clearStoredPermisos();
    },

    getToken: () => {
        const raw = localStorage.getItem("token");
        if (!raw || raw === "null" || raw === "undefined") return null;
        return raw.trim();
    },

    getCurrentUser: () => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    },

    isAuthenticated: () => !!authService.getToken(),
};
