import apiService from "./api";

const BASE = "/api/pisos";

const fromBackend = (p) => ({
    id: p.id,
    numero_piso: p.numero,
    id_torre: p.torreId,
    estado: p.estado,
    torreNombre: p.torreNombre,
    condominioId: p.condominioId,
});

const toBackend = (p) => ({
    numero: parseInt(p.numero_piso, 10),
    torreId: Number(p.id_torre),
    estado: p.estado || "ACTIVO",
});

export const pisoService = {

    getAll: async (torreId) => {
        const params = torreId ? { torreId } : {};
        const res = await apiService.get(BASE, { params });
        return (res.data || []).map(fromBackend);
    },

    getByTorre: async (torreId) => pisoService.getAll(torreId),

    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return fromBackend(res.data);
    },

    create: async (data) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(data));
        return fromBackend(res.data);
    },

    update: async (id, data) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(data));
        return fromBackend(res.data);
    },

    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
        return { success: true, id };
    },
};
