import { getAuthToken, isJwtExpired } from "./jwt";

export { getAuthToken };

export const isLoggedIn = () => {
    const token = getAuthToken();
    if (!token) return false;
    return !isJwtExpired(token);
};
