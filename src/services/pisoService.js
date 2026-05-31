import apiService from "./api";

const BASE = "/api/pisos";

const toBackend = ({ numero, torreId, estado }) => ({
    numero: Number(numero),
    torreId: Number(torreId),
    estado: estado || "ACTIVO",
});

export const pisoService = {
    getAll: async (torreId) => {
        const params = torreId ? { torreId } : {};
        const res = await apiService.get(BASE, { params });
        return res.data || [];
    },

    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (datos) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(datos));
        return res.data;
    },

    update: async (id, datos) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(datos));
        return res.data;
    },

    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
    },
};
