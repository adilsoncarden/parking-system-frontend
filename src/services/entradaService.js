import api from './api';

export const entradaService = {

    getAll: async () => {
        const response = await api.get('/admin/entradas');
        return response.data;
    },

    getByCondominio: async (idCondominio) => {
        const response = await api.get(`/admin/entradas/condominio/${idCondominio}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/admin/entradas/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/admin/entradas', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/entradas/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/admin/entradas/${id}`);
        return { success: true, id };
    },
};