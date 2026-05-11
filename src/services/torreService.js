import api from "./api";

// ═══════════════════════════════════════════════════════════
// TORRE SERVICE
// Conecta con el backend Spring Boot real.
// Endpoints: /admin/torres
// ═══════════════════════════════════════════════════════════

const fromBackend = (t) => ({
    id: t.idTorres,
    nombre: t.Nombre, // El backend usa Nombre (con N mayúscula)
    pisos: t.cantidadPisos,
    apartamentos: t.cantidadApartametos, // Nota: el backend tiene el typo "apartametos"
    id_condominio: t.condominio ? t.condominio.id : null,
    createdAt: t.createdAt,
});

const toBackend = (t) => ({
    Nombre: t.nombre,
    cantidadPisos: parseInt(t.pisos),
    cantidadApartametos: parseInt(t.apartamentos),
    condominio: { id: t.id_condominio }
});

export const torreService = {

    // GET /admin/torres
    getAll: async () => {
        const res = await api.get("/admin/torres");
        return Array.isArray(res.data) ? res.data.map(fromBackend) : [];
    },

    // GET /admin/torres/condominio/{id}
    getByCondominio: async (id_condominio) => {
        const res = await api.get(`/admin/torres/condominio/${id_condominio}`);
        return Array.isArray(res.data) ? res.data.map(fromBackend) : [];
    },

    // GET /admin/torres/{id}
    getById: async (id) => {
        const res = await api.get(`/admin/torres/${id}`);
        return fromBackend(res.data);
    },

    // POST /admin/torres
    create: async (datos) => {
        const res = await api.post("/admin/torres", toBackend(datos));
        return fromBackend(res.data);
    },

    // PUT /admin/torres/{id}
    update: async (id, datos) => {
        const res = await api.put(`/admin/torres/${id}`, toBackend(datos));
        return fromBackend(res.data);
    },

    // DELETE /admin/torres/{id}
    delete: async (id) => {
        await api.delete(`/admin/torres/${id}`);
        return true;
    },
};