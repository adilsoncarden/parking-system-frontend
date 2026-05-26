import api from './api';

export const prestamoService = {

    getAll: async () => {
        const response = await api.get('/admin/prestamos');
        return response.data;
    },

    getActivos: async () => {
        const response = await api.get('/admin/prestamos/activos');
        return response.data;
    },

    getMultados: async () => {
        const response = await api.get('/admin/prestamos/multados');
        return response.data;
    },

    getByCondominio: async (idCondominio) => {
        const response = await api.get(`/admin/prestamos/condominio/${idCondominio}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/admin/prestamos', data);
        return response.data;
    },

    devolver: async (id) => {
        const response = await api.patch(`/admin/prestamos/${id}/devolver`);
        return response.data;
    },

    aplicarMulta: async (id) => {
        const response = await api.patch(`/admin/prestamos/${id}/multa`);
        return response.data;
    },
};