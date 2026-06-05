export const getAuthToken = () => {
    const raw = localStorage.getItem("token");
    if (!raw || raw === "null" || raw === "undefined") return null;
    return raw.trim();
};

export const decodeJwtPayload = (token) => {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

export const isJwtExpired = (token, skewMs = 10_000) => {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;
    return payload.exp * 1000 < Date.now() + skewMs;
};
