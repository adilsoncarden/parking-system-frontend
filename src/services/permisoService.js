import apiService from "./api";

const BASE_PERMISOS = "/api/permisos";

export const permisoService = {
    getAll: async () => {
        const res = await apiService.get(BASE_PERMISOS);
        return res.data || [];
    },

    getPermisosByRol: async (rolId) => {
        const res = await apiService.get(`/api/roles/${rolId}/permisos`);
        return res.data;
    },

    assignPermisosToRol: async (rolId, permisoIds) => {
        const res = await apiService.put(`/api/roles/${rolId}/permisos`, { permisoIds });
        return res.data;
    },
};
