import apiService from "./api";

/**
 * Servicio del módulo Parking (ParkControl) contra la API real de CondoSaaS.
 * Reutiliza apiService (axios), que ya inyecta el JWT automáticamente.
 * Convención de rutas del backend: /create, /{id}/update, /{id}/delete.
 */
export const parkingService = {
    // ── Vehículos ──

    /** Obtiene la lista completa de vehículos registrados. */
    getVehiculos: async () => (await apiService.get("/api/vehiculos")).data || [],

    /** Busca un vehículo por su placa. @param {string} placa */
    getVehiculoByPlaca: async (placa) =>
        (await apiService.get(`/api/vehiculos/by-placa/${encodeURIComponent(placa)}`)).data,

    /** Crea un nuevo vehículo. @param {object} data */
    createVehiculo: async (data) => (await apiService.post("/api/vehiculos/create", data)).data,

    /** Actualiza un vehículo existente. @param {number} id @param {object} data */
    updateVehiculo: async (id, data) => (await apiService.put(`/api/vehiculos/${id}/update`, data)).data,

    /** Elimina un vehículo por ID. @param {number} id */
    deleteVehiculo: async (id) => {
        await apiService.delete(`/api/vehiculos/${id}/delete`);
    },

    // ── Estacionamientos (plazas) ──

    /** Obtiene la lista de plazas de estacionamiento. */
    getEstacionamientos: async () => (await apiService.get("/api/estacionamiento")).data || [],

    /** Actualiza el estado de una plaza. @param {number} id @param {object} data */
    updateEstacionamiento: async (id, data) =>
        (await apiService.put(`/api/estacionamiento/${id}/update`, data)).data,

    // ── Permanencias (estancias + flujo entrada/salida) ──

    /** Obtiene todas las permanencias activas e históricas. */
    getPermanencias: async () => (await apiService.get("/api/permanencias")).data || [],

    /** Registra la entrada de un vehículo. @param {object} data */
    registrarEntrada: async (data) =>
        (await apiService.post("/api/permanencias/registrar-entrada", data)).data,

    /** Registra la salida de un vehículo. @param {object} data */
    registrarSalida: async (data) =>
        (await apiService.post("/api/permanencias/registrar-salida", data)).data,

    // ── Logs de acceso ──

    /** Obtiene el historial de accesos vehiculares. */
    getLogs: async () => (await apiService.get("/api/logs-acceso-vehicular")).data || [],

    // ── Zonas ──

    /** Obtiene las zonas de estacionamiento disponibles. */
    getZonas: async () => (await apiService.get("/api/zonas-estacionamiento")).data || [],

    // ── Condominios e inquilinos (para el registro de vehículos) ──

    /** Obtiene la lista de condominios. */
    getCondominios: async () => (await apiService.get("/api/condominios")).data || [],

    /**
     * Obtiene los inquilinos de un condominio.
     * @param {number} condominioId
     */
    getInquilinos: async (condominioId) =>
        (await apiService.get("/api/usuarios", { params: { condominioId } })).data || [],

    // ── Stats del dashboard ──

    /** Obtiene las estadísticas del dashboard de parking. */
    getParkingStats: async () => (await apiService.get("/api/dashboard/parking")).data,
};

export default parkingService;