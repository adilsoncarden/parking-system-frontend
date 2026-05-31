import apiService from "./api";

const BASE = "/api/usuarios";

const toBackend = (u) => ({
    nombres: u.nombres?.trim(),
    apellidos: u.apellidos?.trim(),
    email: u.email?.trim(),
    telefono: u.telefono?.trim() || null,
    password: u.password,
    tipoOcupante: u.tipoOcupante,
    estado: u.estado,
    rolId: Number(u.rolId),
    apartamentoId: u.apartamentoId ? Number(u.apartamentoId) : null,
});

export const usuarioService = {
    getAll: async (rolId, apartamentoId) => {
        const params = {};
        if (rolId) params.rolId = rolId;
        if (apartamentoId) params.apartamentoId = apartamentoId;
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
