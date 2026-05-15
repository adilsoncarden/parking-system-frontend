import  api  from './api';

export const pisoService = {

    getAll: async () => {
        const response = await api.get('/admin/pisos');
        return response.data;
    },

    getByTorre: async (idTorre) => {
        const response = await api.get(`/admin/pisos/torre/${idTorre}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/admin/pisos/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/admin/pisos', {
            numeroPiso: data.numero_piso,
            idTorre: data.id_torre
        });
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/pisos/${id}`, {
            numeroPiso: data.numero_piso,
            idTorre: data.id_torre
        });
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/admin/pisos/${id}`);
        return { success: true, id };
    },
};