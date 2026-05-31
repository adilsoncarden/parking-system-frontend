import apiService from "./api";

export const authService = {

    login: async ({ username, password }) => {
        try {
            const response = await apiService.post("/api/auth/login", { email: username, password });
            const { token, usuario } = response.data;

            if (!token) {
                return { ok: false, error: "El servidor no devolvió un token" };
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(usuario || { username }));
            localStorage.setItem("isAuthenticated", "true");

            return { ok: true, user: usuario || { username }, token };

        } catch (error) {
            if (error.response?.status === 401) {
                return { ok: false, error: "Usuario o contraseña incorrectos" };
            }
            if (error.response?.status === 403 || error.forbidden) {
                return { ok: false, error: "No tienes permisos para acceder" };
            }
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
