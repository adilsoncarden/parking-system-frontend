import apiService from "./api";

const BASE = "/api/carritos";

const toBackend = ({ codigo, descripcion, estado, condominioId }) => ({
    codigo: codigo?.trim(),
    descripcion: descripcion?.trim() || null,
    estado: estado || "DISPONIBLE",
    condominioId: Number(condominioId),
});

export const carritoService = {
    getAll: async (condominioId) => {
        const params = condominioId ? { condominioId } : {};
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
