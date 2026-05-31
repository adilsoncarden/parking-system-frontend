import { authService } from "../services/authService";

export const getAuthToken = () => authService.getToken();

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!payload?.exp) return false;
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

/** true si hay token válido y no expirado. */
export const isLoggedIn = () => {
    const token = getAuthToken();
    if (!token) return false;
    if (isTokenExpired(token)) {
        authService.logout();
        return false;
    }
    return true;
};

export const debugAuthToken = () => {
    console.log("TOKEN:", localStorage.getItem("token"));
};
