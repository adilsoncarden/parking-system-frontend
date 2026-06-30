import apiService, { applyAuthToken, clearAuthToken, resetSessionExpiredFlag } from "./api";
import { clearStoredPermisos, setStoredPermisos } from "../utils/permissions";

/**
 * Servicio de autenticación.
 * Maneja login, logout y persistencia de sesión en localStorage.
 */
export const authService = {

    /**
     * Inicia sesión con email y contraseña.
     * Guarda el token JWT y los permisos en localStorage.
     * @param {object} credentials
     * @param {string} credentials.email
     * @param {string} credentials.password
     * @returns {Promise<{ok: boolean, user?: object, token?: string, permisos?: string[], error?: string}>}
     */
    login: async ({ email, password }) => {
        try {
            const response = await apiService.post(
                "/api/auth/login",
                { email, password },
                { skipAuth: true }
            );
            const { token, usuario, permisos } = response.data;

            if (!token) {
                // Login fallido: el backend responde 200 con { success:false, message }
                // (así no hay error rojo en consola). Mostramos ese mensaje al usuario.
                return { ok: false, error: response.data?.message || "Credenciales incorrectas" };
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

    /**
     * Cierra la sesión del usuario actual.
     * Limpia el token, datos de usuario y permisos del localStorage.
     */
    logout: () => {
        clearAuthToken();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        clearStoredPermisos();
    },

    /**
     * Obtiene el token JWT almacenado en localStorage.
     * @returns {string|null} Token JWT o null si no existe.
     */
    getToken: () => {
        const raw = localStorage.getItem("token");
        if (!raw || raw === "null" || raw === "undefined") return null;
        return raw.trim();
    },

    /**
     * Obtiene el usuario actualmente autenticado desde localStorage.
     * @returns {object|null} Datos del usuario o null si no hay sesión.
     */
    getCurrentUser: () => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    },

    /**
     * Verifica si hay una sesión activa comprobando la existencia del token.
     * @returns {boolean}
     */
    isAuthenticated: () => !!authService.getToken(),
};