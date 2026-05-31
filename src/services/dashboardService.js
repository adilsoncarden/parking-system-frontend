import apiService from "./api";
import { torreService } from "./torreService";
import { pisoService } from "./pisoService";
import { apartamentoService } from "./apartamentoService";

const CACHE_MS = 30_000;
const cache = new Map();

const withCache = async (key, fetcher) => {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
    const data = await fetcher();
    cache.set(key, { data, at: Date.now() });
    return data;
};

const ESTADO_LABELS = {
    DISPONIBLE: "Disponible",
    OCUPADO: "Ocupado",
    MANTENIMIENTO: "Mantenimiento",
    INACTIVO: "Inactivo",
};

const ESTADO_COLORS = {
    DISPONIBLE: "bg-primary",
    OCUPADO: "bg-success",
    MANTENIMIENTO: "bg-warning text-dark",
    INACTIVO: "bg-secondary",
};

const emptyCarritosStats = () => ({
    totalCarritos: 0,
    carritosDisponibles: 0,
    carritosEnUso: 0,
    prestamosActivos: 0,
    penalizacionesActivas: 0,
    totalRecaudadoPenalizaciones: 0,
});

const mapCarritosResponse = (payload) => {
    const e = payload?.estadisticas ?? payload ?? {};
    return {
        totalCarritos: e.totalCarritos ?? 0,
        carritosDisponibles: e.disponibles ?? e.carritosDisponibles ?? 0,
        carritosEnUso: e.prestados ?? e.carritosEnUso ?? 0,
        prestamosActivos: e.prestamosActivos ?? 0,
        penalizacionesActivas: e.penalizados ?? e.penalizacionesActivas ?? 0,
        totalRecaudadoPenalizaciones: Number(e.totalRecaudado ?? e.totalRecaudadoPenalizaciones ?? 0),
    };
};

const fetchCarritosStats = async () => {
    try {
        const res = await apiService.get("/api/dashboard/carritos");
        return mapCarritosResponse(res.data);
    } catch {
        return emptyCarritosStats();
    }
};

export const dashboardService = {
    getCarritosStats: () =>
        withCache("dashboard-carritos", fetchCarritosStats),

    getStats: async () =>
        withCache("dashboard-stats-full", async () => {
            const [statsRes, torresRes, pisosRes, apartamentosRes, carritosStats] =
                await Promise.allSettled([
                    apiService.get("/api/dashboard/stats"),
                    torreService.getAll(),
                    pisoService.getAll(),
                    apartamentoService.getAll(),
                    fetchCarritosStats(),
                ]);

            if (statsRes.status !== "fulfilled") {
                throw statsRes.reason;
            }

            const stats = statsRes.value.data;
            const torres = torresRes.status === "fulfilled" ? torresRes.value : [];
            const pisos = pisosRes.status === "fulfilled" ? pisosRes.value : [];
            const apartamentos =
                apartamentosRes.status === "fulfilled" ? apartamentosRes.value : [];
            const carritos =
                carritosStats.status === "fulfilled"
                    ? carritosStats.value
                    : emptyCarritosStats();

            const totalApartamentos = stats?.totalApartamentos ?? 0;

            const estadosData = [
                { key: "DISPONIBLE", cantidad: stats?.apartamentosDisponibles ?? 0 },
                { key: "OCUPADO", cantidad: stats?.apartamentosOcupados ?? 0 },
                { key: "MANTENIMIENTO", cantidad: stats?.apartamentosMantenimiento ?? 0 },
                { key: "INACTIVO", cantidad: stats?.apartamentosInactivos ?? 0 },
            ]
                .filter((e) => e.cantidad > 0)
                .map((e) => ({
                    label: ESTADO_LABELS[e.key],
                    cantidad: e.cantidad,
                    porcentaje: totalApartamentos
                        ? Math.round((e.cantidad / totalApartamentos) * 100)
                        : 0,
                    color: ESTADO_COLORS[e.key],
                }));

            const aptosPorPiso = apartamentos.reduce((acc, a) => {
                acc[a.pisoId] = (acc[a.pisoId] || 0) + 1;
                return acc;
            }, {});

            const reportePisos = pisos
                .map((p) => ({
                    piso: `Piso ${p.numero}${p.torreNombre ? ` — ${p.torreNombre}` : ""}`,
                    cantidad: aptosPorPiso[p.id] || 0,
                }))
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 8);

            const maxPiso = Math.max(...reportePisos.map((r) => r.cantidad), 1);

            const pisosPorTorre = pisos.reduce((acc, p) => {
                acc[p.torreId] = (acc[p.torreId] || 0) + 1;
                return acc;
            }, {});

            const aptosPorTorre = apartamentos.reduce((acc, a) => {
                const tid = a.torreId;
                if (tid) acc[tid] = (acc[tid] || 0) + 1;
                return acc;
            }, {});

            const resumenTorres = torres.map((t) => ({
                id: t.id,
                nombre: t.nombre,
                n_pisos: pisosPorTorre[t.id] || 0,
                n_apartamentos: aptosPorTorre[t.id] || 0,
                condominio: t.condominioNombre || "—",
            }));

            const tasaOcupacion = totalApartamentos
                ? Math.round(((stats?.apartamentosOcupados ?? 0) / totalApartamentos) * 100)
                : 0;

            return {
                estadisticas: [
                    {
                        label: "Total Condominios",
                        valor: stats?.totalCondominios ?? 0,
                        icon: "bi-buildings-fill",
                        color: "bg-primary",
                    },
                    {
                        label: "Total Torres",
                        valor: stats?.totalTorres ?? 0,
                        icon: "bi-building",
                        color: "bg-info",
                    },
                    {
                        label: "Total Pisos",
                        valor: stats?.totalPisos ?? 0,
                        icon: "bi-layers-fill",
                        color: "bg-warning",
                    },
                    {
                        label: "Total Apartamentos",
                        valor: stats?.totalApartamentos ?? 0,
                        icon: "bi-door-open-fill",
                        color: "bg-success",
                    },
                ],
                carritosStats: carritos,
                tasaOcupacion,
                estadosData,
                reportePisos: reportePisos.map((r) => ({ ...r, max: maxPiso })),
                resumenTorres,
            };
        }),
};
