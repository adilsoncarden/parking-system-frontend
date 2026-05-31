import apiService from "./api";

const BASE = "/api/apartamentos";

const toBackend = ({ numero, pisoId, area, estado }) => {
    const parsedArea = area === "" || area == null ? null : Number(area);
    return {
        numero: String(numero).trim(),
        pisoId: Number(pisoId),
        area: Number.isNaN(parsedArea) ? null : parsedArea,
        estado: estado || "DISPONIBLE",
    };
};

export const apartamentoService = {
    getAll: async (pisoId) => {
        const params = pisoId ? { pisoId } : {};
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
