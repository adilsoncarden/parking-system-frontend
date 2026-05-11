import api from "./api";

// ═══════════════════════════════════════════════════════════
// TORRE SERVICE
// Conecta con el backend Spring Boot real.
// Endpoints: /admin/torres
// ═══════════════════════════════════════════════════════════

// Mapeo de lo que recibimos del servidor (Entity) a lo que usa el Frontend
const fromBackend = (t) => ({
    id: t.idTorres,
    nombre: t.Nombre || t.nombre,
    pisos: t.cantidadPisos || t.pisos,
    apartamentos: t.cantidadApartametos || t.aptos,
    id_condominio: t.condominio ? t.condominio.id : t.idCondominio,
    createdAt: t.createdAt,
});

// Mapeo de lo que enviamos al servidor (TorreRequest DTO)
const toBackend = (t) => ({
    nombre: t.nombre,
    idCondominio: parseInt(t.id_condominio),
    pisos: parseInt(t.pisos),
    aptos: parseInt(t.apartamentos)
});

// Configuración de headers para incluir el Token JWT de forma explícita
const getAuthConfig = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    }
});

export const torreService = {

    // GET /admin/torres
    getAll: async () => {
        const res = await api.get("/admin/torres", getAuthConfig());
        return Array.isArray(res.data) ? res.data.map(fromBackend) : [];
    },

    // GET /admin/torres/condominio/{id}
    getByCondominio: async (id_condominio) => {
        const res = await api.get(`/admin/torres/condominio/${id_condominio}`, getAuthConfig());
        return Array.isArray(res.data) ? res.data.map(fromBackend) : [];
    },

    // GET /admin/torres/{id}
    getById: async (id) => {
        const res = await api.get(`/admin/torres/${id}`, getAuthConfig());
        return fromBackend(res.data);
    },

    // POST /admin/torres
    create: async (datos) => {
        const res = await api.post("/admin/torres", toBackend(datos), getAuthConfig());
        return fromBackend(res.data);
    },

    // PUT /admin/torres/{id}
    update: async (id, datos) => {
        const res = await api.put(`/admin/torres/${id}`, toBackend(datos), getAuthConfig());
        return fromBackend(res.data);
    },

    // DELETE /admin/torres/{id}
    delete: async (id) => {
        await api.delete(`/admin/torres/${id}`, getAuthConfig());
        return true;
    },
};