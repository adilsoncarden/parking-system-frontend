import apiService from "./api";

const BASE = "/api/condominios";

const toBackend = ({ nombre, direccion, telefono, email, estado }) => ({
    nombre: nombre?.trim(),
    direccion: direccion?.trim(),
    telefono: telefono?.trim() || null,
    email: email?.trim() || null,
    estado: estado || "ACTIVO",
});

export const condominioService = {
    getAll: async (estado) => {
        const params = estado != null ? { estado } : {};
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
