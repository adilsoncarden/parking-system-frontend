import apiService from "./api";
import { torreService } from "./torreService";
import { pisoService } from "./pisoService";
import { apartamentoService } from "./apartamentoService";

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

export const dashboardService = {
    getStats: async () => {
        const [statsRes, torres, pisos, apartamentos] = await Promise.all([
            apiService.get("/api/dashboard/stats"),
            torreService.getAll(),
            pisoService.getAll(),
            apartamentoService.getAll(),
        ]);

        const stats = statsRes.data;
        const totalApartamentos = stats.totalApartamentos;

        const estadosData = [
            { key: "DISPONIBLE", cantidad: stats.apartamentosDisponibles },
            { key: "OCUPADO", cantidad: stats.apartamentosOcupados },
            { key: "MANTENIMIENTO", cantidad: stats.apartamentosMantenimiento ?? 0 },
            { key: "INACTIVO", cantidad: stats.apartamentosInactivos },
        ]
            .filter((e) => e.cantidad > 0)
            .map((e) => ({
                label: ESTADO_LABELS[e.key],
                cantidad: e.cantidad,
                porcentaje: totalApartamentos ? Math.round((e.cantidad / totalApartamentos) * 100) : 0,
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
            ? Math.round((stats.apartamentosOcupados / totalApartamentos) * 100)
            : 0;

        return {
            estadisticas: [
                { label: "Total Condominios", valor: stats.totalCondominios, icon: "bi-buildings-fill", color: "bg-primary" },
                { label: "Total Torres", valor: stats.totalTorres, icon: "bi-building", color: "bg-info" },
                { label: "Total Pisos", valor: stats.totalPisos, icon: "bi-layers-fill", color: "bg-warning" },
                { label: "Total Apartamentos", valor: stats.totalApartamentos, icon: "bi-door-open-fill", color: "bg-success" },
            ],
            tasaOcupacion,
            estadosData,
            reportePisos: reportePisos.map((r) => ({ ...r, max: maxPiso })),
            resumenTorres,
        };
    },
};
