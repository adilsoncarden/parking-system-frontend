import apiService from "./api";

const BASE = "/api/prestamos-carrito";

const toBackend = ({ fechaPrestamo, fechaDevolucion, estado, carritoId, usuarioId }) => ({
    fechaPrestamo: fechaPrestamo || null,
    fechaDevolucion: fechaDevolucion || null,
    estado: estado || null,
    carritoId: Number(carritoId),
    usuarioId: Number(usuarioId),
});

export const prestamoCarritoService = {
    getAll: async (carritoId, usuarioId) => {
        const params = {};
        if (carritoId) params.carritoId = carritoId;
        if (usuarioId) params.usuarioId = usuarioId;
        const res = await apiService.get(BASE, { params });
        return res.data || [];
    },

    getById: async (id) => {
        const res = await apiService.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (datos) => {
        const res = await apiService.post(`${BASE}/create`, toBackend(datos));
        return res.data;
    },

    update: async (id, datos) => {
        const res = await apiService.put(`${BASE}/${id}/update`, toBackend(datos));
        return res.data;
    },

    delete: async (id) => {
        await apiService.delete(`${BASE}/${id}/delete`);
    },

    devolver: async (id) => {
        const res = await apiService.post(`${BASE}/${id}/devolver`);
        return res.data;
    },

    marcarPagado: async (id) => {
        const res = await apiService.patch(`${BASE}/${id}/pagar`);
        return res.data;
    },
};

export const toApiDateTime = (date = new Date()) => {
    const pad = (n) => String(n).padStart(2, "0");
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

export const formatMoney = (value) => {
    if (value == null) return "—";
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(Number(value));
};
