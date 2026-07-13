import apiService from "./api";

const BASE = "/api/configuracion-multa";

/**
 * Servicio de configuración de multas por condominio (spec V6).
 * El Admin_Condominio define el tiempo límite y la tarifa por minuto; si no hay
 * configuración guardada, el backend responde los valores por defecto del sistema.
 */
export const configuracionMultaService = {
    /** Lista las configuraciones visibles (scoped por condominio en el backend). */
    getAll: async () => {
        const res = await apiService.get(BASE);
        return res.data || [];
    },

    /** Obtiene la configuración efectiva de un condominio (guardada o por defecto). */
    getByCondominio: async (condominioId) => {
        const res = await apiService.get(`${BASE}/condominio/${condominioId}`);
        return res.data;
    },

    /** Crea o actualiza la configuración de multas de un condominio. */
    upsert: async ({ condominioId, tiempoLimiteMinutos, tarifaPorMinuto }) => {
        const res = await apiService.put(BASE, {
            condominioId: Number(condominioId),
            tiempoLimiteMinutos: Number(tiempoLimiteMinutos),
            tarifaPorMinuto: Number(tarifaPorMinuto),
        });
        return res.data;
    },
};
