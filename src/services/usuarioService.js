import apiService from "./api";

const BASE = "/api/usuarios";

/**
 * Transforma los datos del formulario al formato esperado por el backend.
 * @param {object} u - Datos del usuario desde el formulario.
 * @param {string} u.nombres
 * @param {string} u.apellidos
 * @param {string} u.email
 * @param {string} [u.telefono]
 * @param {string} u.password
 * @param {string} u.tipoOcupante
 * @param {string} u.estado
 * @param {number} u.rolId
 * @param {number} [u.apartamentoId]
 * @param {number} [u.condominioId]
 * @returns {object}
 */
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
    condominioId: u.condominioId ? Number(u.condominioId) : null,
});

/**
 * Servicio para la gestión de usuarios.
 * Consume el endpoint /api/usuarios del backend CondoSaaS.
 */
export const usuarioService = {

    /**
     * Obtiene la lista de usuarios con filtros opcionales.
     * @param {number} [rolId] - Filtrar por rol.
     * @param {number} [apartamentoId] - Filtrar por apartamento.
     * @param {number} [condominioId] - Filtrar por condominio.
     * @returns {Promise<object[]>}
     */
    getAll: async (rolId, apartamentoId, condominioId) => {
        const params = {};
        if (rolId) params.rolId = rolId;
        if (apartamentoId) params.apartamentoId = apartamentoId;
        if (condominioId) params.condominioId = condominioId;
        const res = await apiService.get(BASE, { params });
        return res.data || [];
    },

    /**
     * Obtiene un usuario por su ID.
     * @param {number} id
     * @returns {Promise<object>}
     */
    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return res.data;
    },

    /**
     * Crea un nuevo usuario.
     * @param {object} datos - Datos del formulario.
     * @returns {Promise<object>}
     */
    create: async (datos) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(datos));
        return res.data;
    },

    /**
     * Actualiza un usuario existente.
     * @param {number} id
     * @param {object} datos - Datos actualizados del formulario.
     * @returns {Promise<object>}
     */
    update: async (id, datos) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(datos));
        return res.data;
    },

    /**
     * Elimina un usuario por su ID.
     * @param {number} id
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
    },
};