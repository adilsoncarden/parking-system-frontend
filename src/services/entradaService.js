import apiService from "./api";

const BASE = "/api/entradas";

const toBackend = ({ nombre, capacidadCarritos, condominioId }) => ({
    nombre: nombre?.trim(),
    capacidadCarritos:
        capacidadCarritos === "" || capacidadCarritos == null
            ? null
            : Number(capacidadCarritos),
    condominioId: Number(condominioId),
});

export const entradaService = {
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
