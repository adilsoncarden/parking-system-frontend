import apiService from "./api";

const BASE = "/api/torres";

const fromBackend = (t) => ({
    id: t.id,
    nombre: t.nombre,
    id_condominio: t.condominioId,
    estado: t.estado,
    condominioNombre: t.condominioNombre,
});

const toBackend = (t) => ({
    nombre: t.nombre,
    condominioId: Number(t.id_condominio),
    estado: t.estado || "ACTIVO",
});

export const torreService = {

    getAll: async (condominioId) => {
        const params = condominioId ? { condominioId } : {};
        const res = await apiService.get(BASE, { params });
        return (res.data || []).map(fromBackend);
    },

    getByCondominio: async (condominioId) => torreService.getAll(condominioId),

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
