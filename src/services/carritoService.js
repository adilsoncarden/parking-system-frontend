import api from './api';

export const carritoService = {

    getAll: async () => {
        const response = await api.get('/admin/carritos');
        return response.data;
    },

    getByCondominio: async (idCondominio) => {
        const response = await api.get(`/admin/carritos/condominio/${idCondominio}`);
        return response.data;
    },

    getByEntrada: async (idEntrada) => {
        const response = await api.get(`/admin/carritos/entrada/${idEntrada}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/admin/carritos/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/admin/carritos', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/carritos/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/admin/carritos/${id}`);
        return { success: true, id };
    },

    cambiarDisponibilidad: async (id, disponible) => {
        const response = await api.patch(`/admin/carritos/${id}/disponibilidad?disponible=${disponible}`);
        return response.data;
    },
};