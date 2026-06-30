import apiService from "./api";

const BASE = "/api/condominios";

/**
 * Transforma los datos del formulario al formato esperado por el backend.
 * @param {object} datos
 * @param {string} datos.nombre
 * @param {string} datos.direccion
 * @param {string} [datos.telefono]
 * @param {string} [datos.email]
 * @returns {object}
 */
const toBackend = ({ nombre, direccion, telefono, email }) => ({
    nombre: nombre?.trim(),
    direccion: direccion?.trim(),
    telefono: telefono?.trim() || null,
    email: email?.trim() || null,
});

/**
 * Servicio para la gestión de condominios.
 * Consume el endpoint /api/condominios del backend CondoSaaS.
 */
export const condominioService = {

    /** Obtiene la lista completa de condominios. */
    getAll: async () => {
        const res = await apiService.get(BASE);
        return res.data || [];
    },

    /**
     * Obtiene un condominio por su ID.
     * @param {number} id
     */
    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return res.data;
    },

    /**
     * Crea un nuevo condominio.
     * @param {object} datos - Datos del formulario.
     */
    create: async (datos) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(datos));
        return res.data;
    },

    /**
     * Actualiza un condominio existente.
     * @param {number} id
     * @param {object} datos - Datos actualizados del formulario.
     */
    update: async (id, datos) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(datos));
        return res.data;
    },

    /**
     * Elimina un condominio por su ID.
     * @param {number} id
     */
    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
    },
};