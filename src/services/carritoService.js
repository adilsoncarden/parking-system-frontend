import apiService from "./api";

const BASE = "/api/carritos";

/**
 * Transforma los datos del formulario al formato esperado por el backend.
 * @param {object} datos
 * @param {string} datos.codigo
 * @param {string} [datos.descripcion]
 * @param {string} [datos.estado]
 * @param {number} datos.condominioId
 * @returns {object}
 */
const toBackend = ({ codigo, descripcion, estado, condominioId }) => ({
    codigo: codigo?.trim(),
    descripcion: descripcion?.trim() || null,
    estado: estado || "DISPONIBLE",
    condominioId: Number(condominioId),
});

/**
 * Servicio para la gestión de carritos de carga.
 * Consume el endpoint /api/carritos del backend CondoSaaS.
 */
export const carritoService = {

    /**
     * Obtiene la lista de carritos, opcionalmente filtrada por condominio.
     * @param {number} [condominioId] - ID del condominio para filtrar.
     * @returns {Promise<object[]>}
     */
    getAll: async (condominioId) => {
        const params = condominioId ? { condominioId } : {};
        const res = await apiService.get(BASE, { params });
        return res.data || [];
    },

    /**
     * Obtiene un carrito por su ID.
     * @param {number} id
     * @returns {Promise<object>}
     */
    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return res.data;
    },

    /**
     * Crea un nuevo carrito de carga.
     * @param {object} datos - Datos del formulario.
     * @returns {Promise<object>}
     */
    create: async (datos) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(datos));
        return res.data;
    },

    /**
     * Actualiza un carrito existente.
     * @param {number} id
     * @param {object} datos - Datos actualizados del formulario.
     * @returns {Promise<object>}
     */
    update: async (id, datos) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(datos));
        return res.data;
    },

    /**
     * Elimina un carrito por su ID.
     * @param {number} id
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
    },
};