import apiService from "./api";

const BASE = "/api/condominios";

const fromBackend = (c) => ({
    id: c.id,
    nombre: c.nombre,
    direccion: c.direccion,
    telefono: c.telefono,
    email: c.email,
    estado: c.estado,
    tipo: c.estado === "INACTIVO" ? "premium" : "residencial",
});

const toBackend = (c) => ({
    nombre: c.nombre,
    direccion: c.direccion,
    telefono: c.telefono || null,
    email: c.email || null,
    estado: c.estado || "ACTIVO",
});

export const condominioService = {

    getAll: async (estado) => {
        const params = estado != null ? { estado } : {};
        const res = await apiService.get(BASE, { params });
        return (res.data || []).map(fromBackend);
    },

    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return fromBackend(res.data);
    },

    create: async (datos) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(datos));
        return fromBackend(res.data);
    },

    update: async (id, datos) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(datos));
        return fromBackend(res.data);
    },

    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
        return true;
    },
};
