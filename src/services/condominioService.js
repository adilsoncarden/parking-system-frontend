import api from "./api";

// ═══════════════════════════════════════════════════════════
// CONDOMINIO SERVICE
// Conecta con el backend Spring Boot real.
// Endpoints: /admin/condominios
// El JWT se agrega automáticamente vía interceptor en api.js
// ═══════════════════════════════════════════════════════════

// El backend usa "latitud/longitud" pero el frontend usa "lat/lng".
// Estos helpers traducen entre los dos formatos.

const fromBackend = (c) => ({
    id:        c.id,
    nombre:    c.nombre,
    direccion: c.direccion,
    tipo:      c.tipo,
    imagen:    c.imagen,
    lat:       c.latitud,
    lng:       c.longitud,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
});

const toBackend = (c) => ({
    nombre:    c.nombre,
    direccion: c.direccion,
    tipo:      c.tipo,
    imagen:    c.imagen,
    latitud:   c.lat,
    longitud:  c.lng,
});

export const condominioService = {

    // GET /admin/condominios
    getAll: async () => {
        const res = await api.get("/admin/condominios");
        return res.data.map(fromBackend);
    },

    // GET /admin/condominios/{id}
    getById: async (id) => {
        const res = await api.get(`/admin/condominios/${id}`);
        return fromBackend(res.data);
    },

    // POST /admin/condominios
    create: async (datos) => {
        const res = await api.post("/admin/condominios", toBackend(datos));
        return fromBackend(res.data);
    },

    // PUT /admin/condominios/{id}
    update: async (id, datos) => {
        const res = await api.put(`/admin/condominios/${id}`, toBackend(datos));
        return fromBackend(res.data);
    },

    // DELETE /admin/condominios/{id}
    delete: async (id) => {
        await api.delete(`/admin/condominios/${id}`);
        return true;
    },
};