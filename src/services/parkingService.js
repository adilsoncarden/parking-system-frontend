import apiService from "./api";

/*
 * Servicio del módulo Parking (ParkControl) contra la API real de CondoSaaS.
 * Reutiliza apiService (axios), que ya inyecta el JWT automáticamente.
 * Convención de rutas del backend: /create, /{id}/update, /{id}/delete.
 */
export const parkingService = {
    // ── Vehículos ──
    getVehiculos: async () => (await apiService.get("/api/vehiculos")).data || [],
    getVehiculoByPlaca: async (placa) =>
        (await apiService.get(`/api/vehiculos/by-placa/${encodeURIComponent(placa)}`)).data,
    createVehiculo: async (data) => (await apiService.post("/api/vehiculos/create", data)).data,
    updateVehiculo: async (id, data) => (await apiService.put(`/api/vehiculos/${id}/update`, data)).data,
    deleteVehiculo: async (id) => {
        await apiService.delete(`/api/vehiculos/${id}/delete`);
    },

    // ── Estacionamientos (plazas) ──
    getEstacionamientos: async () => (await apiService.get("/api/estacionamiento")).data || [],
    updateEstacionamiento: async (id, data) =>
        (await apiService.put(`/api/estacionamiento/${id}/update`, data)).data,

    // ── Permanencias (estancias + flujo entrada/salida) ──
    getPermanencias: async () => (await apiService.get("/api/permanencias")).data || [],
    registrarEntrada: async (data) =>
        (await apiService.post("/api/permanencias/registrar-entrada", data)).data,
    registrarSalida: async (data) =>
        (await apiService.post("/api/permanencias/registrar-salida", data)).data,

    // ── Logs de acceso ──
    getLogs: async () => (await apiService.get("/api/logs-acceso-vehicular")).data || [],

    // ── Zonas ──
    getZonas: async () => (await apiService.get("/api/zonas-estacionamiento")).data || [],

    // ── Condominios e inquilinos (para el registro de vehículos) ──
    getCondominios: async () => (await apiService.get("/api/condominios")).data || [],
    getInquilinos: async (condominioId) =>
        (await apiService.get("/api/usuarios", { params: { condominioId } })).data || [],

    // ── Stats del dashboard ──
    getParkingStats: async () => (await apiService.get("/api/dashboard/parking")).data,
};

export default parkingService;
