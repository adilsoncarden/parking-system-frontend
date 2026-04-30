import { fakeDelay } from "./_apiHelper";

// ═══════════════════════════════════════════════════════════
// AUTH SERVICE
// Hoy: valida contra usuarios hardcodeados.
// El rol se determina automáticamente por el correo (no se pide al usuario)
// Mañana: hará POST /api/auth/login y guardará el JWT
// ═══════════════════════════════════════════════════════════

const USUARIOS_MOCK = [
    { email: "admin@condominio.com",   password: "admin123",   rol: "admin"    },
    { email: "portero@condominio.com", password: "portero123", rol: "porteria" },
];

export const authService = {

    login: async ({ email, password }) => {
        const usuario = USUARIOS_MOCK.find(
            u => u.email === email && u.password === password
        );

        if (!usuario) {
            return fakeDelay({ ok: false, error: "Correo o contraseña incorrectos" });
        }

        // Simula token JWT (luego lo dará el backend)
        const fakeToken = btoa(`${email}:${usuario.rol}:${Date.now()}`);

        localStorage.setItem("token", fakeToken);
        localStorage.setItem("user", JSON.stringify({ email, rol: usuario.rol }));
        localStorage.setItem("isAuthenticated", "true");

        return fakeDelay({
            ok: true,
            user: { email, rol: usuario.rol },
            token: fakeToken,
        });
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

    isAuthenticated: () => localStorage.getItem("isAuthenticated") === "true",
};