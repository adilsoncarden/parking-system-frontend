import apiService from "./api";

const BASE = "/api/apartamentos";

const fromBackend = (a) => ({
    id: a.id,
    numero: a.numero,
    numero_apartamento: a.numero,
    id_piso: a.pisoId,
    area: a.area,
    estado: a.estado,
    pisoNumero: a.pisoNumero,
    torreId: a.torreId,
    torreNombre: a.torreNombre,
    condominioId: a.condominioId,
});

const toBackend = (a) => ({
    numero: String(a.numero_apartamento || a.numero),
    pisoId: Number(a.id_piso),
    area: a.area ?? null,
    estado: a.estado || "DISPONIBLE",
});

export const apartamentoService = {

    getAll: async (pisoId) => {
        const params = pisoId ? { pisoId } : {};
        const res = await apiService.get(BASE, { params });
        return (res.data || []).map(fromBackend);
    },

    getByPiso: async (pisoId) => apartamentoService.getAll(pisoId),

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
