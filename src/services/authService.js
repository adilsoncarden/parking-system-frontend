import api from "./api";

// ═══════════════════════════════════════════════════════════
// AUTH SERVICE
// Conecta con el backend Spring Boot real.
// Endpoint: POST http://localhost:8080/auth/login
// ═══════════════════════════════════════════════════════════

export const authService = {

    login: async ({ username, password }) => {
        try {
            const response = await api.post("/auth/login", { username, password });
            const token = response.data.token;

            if (!token) {
                return { ok: false, error: "El servidor no devolvió un token" };
            }

            // Guardamos token + sesión activa
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ username }));
            localStorage.setItem("isAuthenticated", "true");

            return { ok: true, user: { username }, token };

        } catch (error) {
            // 401: credenciales incorrectas
            if (error.response && error.response.status === 401) {
                return { ok: false, error: "Usuario o contraseña incorrectos" };
            }
            // 403: usuario no tiene permisos
            if (error.response && error.response.status === 403) {
                return { ok: false, error: "No tienes permisos para acceder" };
            }
            // Backend caído / sin red
            if (error.code === "ERR_NETWORK") {
                return { ok: false, error: "No se puede conectar al servidor. Verifica que el backend esté corriendo." };
            }
            return { ok: false, error: "Error al iniciar sesión. Intenta de nuevo." };
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
    },

    getToken: () => localStorage.getItem("token"),

    getCurrentUser: () => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    },

    isAuthenticated: () => !!localStorage.getItem("token"),
};