import api from "./api";

// ═══════════════════════════════════════════════════════════
// APARTAMENTO SERVICE
// Conecta con el backend Spring Boot real.
// Endpoints: /admin/apartamentos
// ═══════════════════════════════════════════════════════════

// Mapeo de lo que recibimos del servidor (Entity) a lo que usa el Frontend
const fromBackend = (a) => ({
    id: a.idApartamento || a.id,
    numero: a.numero || a.numeroApartamento,
    id_piso: a.piso ? a.piso.id : a.idPiso,
    propietario: a.propietario || '',
    estado: a.estado || 'Disponible',
    createdAt: a.createdAt,
});

// Mapeo de lo que enviamos al servidor (ApartamentoRequest DTO)
const toBackend = (a) => ({
    numero: a.numero,
    idPiso: parseInt(a.id_piso),
    propietario: a.propietario,
    estado: a.estado
});

// Configuración de headers para incluir el Token JWT de forma explícita
const getAuthConfig = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    }
});

export const apartamentoService = {

    // GET /admin/apartamentos
    getAll: async () => {
        const res = await api.get("/admin/apartamentos", getAuthConfig());
        return Array.isArray(res.data) ? res.data.map(fromBackend) : [];
    },

    // GET /admin/apartamentos/piso/{idPiso}
    getByPiso: async (id_piso) => {
        const res = await api.get(`/admin/apartamentos/piso/${id_piso}`, getAuthConfig());
        return Array.isArray(res.data) ? res.data.map(fromBackend) : [];
    },

    // GET /admin/apartamentos/{id}
    getById: async (id) => {
        const res = await api.get(`/admin/apartamentos/${id}`, getAuthConfig());
        return fromBackend(res.data);
    },

    // POST /admin/apartamentos
    create: async (datos) => {
        const res = await api.post("/admin/apartamentos", toBackend(datos), getAuthConfig());
        return fromBackend(res.data);
    },

    // PUT /admin/apartamentos/{id}
    update: async (id, datos) => {
        const res = await api.put(`/admin/apartamentos/${id}`, toBackend(datos), getAuthConfig());
        return fromBackend(res.data);
    },

    // DELETE /admin/apartamentos/{id}
    delete: async (id) => {
        await api.delete(`/admin/apartamentos/${id}`, getAuthConfig());
        return true;
    },
};
