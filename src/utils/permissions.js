import { MODULE_PERMS } from "../constants/permissions";

const STORAGE_KEY = "permisos";

export const getStoredPermisos = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const setStoredPermisos = (permisos) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permisos || []));
};

export const clearStoredPermisos = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.rolNombre?.toUpperCase() === "ADMIN";
};

export const hasPermission = (permission) => {
    if (!permission) return true;
    if (isAdmin()) return true;
    return getStoredPermisos().includes(permission);
};

export const getModulePermissions = (moduleKey) => {
    const perms = MODULE_PERMS[moduleKey];
    if (!perms) {
        return { canView: true, canCreate: true, canEdit: true, canDelete: true };
    }
    return {
        canView: hasPermission(perms.view),
        canCreate: hasPermission(perms.create),
        canEdit: hasPermission(perms.edit),
        canDelete: hasPermission(perms.delete),
    };
};
