import axios from "axios";

const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

apiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        const requestUrl = String(config.url || "");
        const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/api/auth/login");

        if (!token && !isAuthRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            window.location.href = "/login";
            return Promise.reject({ response: { status: 401 }, message: "Sin token de autenticación" });
        }

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }

        if (status === 403) {
            error.forbidden = true;
            error.message = error.response?.data?.message || "No tienes permisos para realizar esta acción";
        }

        return Promise.reject(error);
    }
);

export { apiService };
export default apiService;
