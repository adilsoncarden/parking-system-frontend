import { condominioService } from "./condominioService";
import { torreService } from "./torreService";
import { pisoService } from "./pisoService";
import { apartamentoService } from "./apartamentoService";
import { usuarioService } from "./usuarioService";
import { carritoService } from "./carritoService";
import { entradaService } from "./entradaService";

// Agrega en el frontend la info de todos los módulos y la agrupa por condominio.
// No requiere endpoints nuevos: Torre/Piso/Apartamento ya exponen condominioId,
// y los residentes se resuelven vía su apartamento. Se cachea unos segundos para
// no recargar todo en cada navegación entre el listado y el detalle.

const CACHE_MS = 30_000;
let cache = null;

const isDisponible = (estado) => String(estado).toUpperCase() === "DISPONIBLE";
const isPrestado = (estado) => {
    const e = String(estado).toUpperCase();
    return e === "PRESTADO" || e === "OCUPADO" || e === "EN_USO";
};

const loadAll = async () => {
    const [cond, torres, pisos, aptos, usuarios, carritos, entradas] = await Promise.allSettled([
        condominioService.getAll(),
        torreService.getAll(),
        pisoService.getAll(),
        apartamentoService.getAll(),
        usuarioService.getAll(),
        carritoService.getAll(),
        entradaService.getAll(),
    ]);
    const val = (r) => (r.status === "fulfilled" ? r.value : []);
    return {
        condominios: val(cond),
        torres: val(torres),
        pisos: val(pisos),
        apartamentos: val(aptos),
        usuarios: val(usuarios),
        carritos: val(carritos),
        entradas: val(entradas),
    };
};

const getRaw = async (force = false) => {
    if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.data;
    const data = await loadAll();
    cache = { data, at: Date.now() };
    return data;
};

const emptyStats = () => ({
    torres: 0,
    pisos: 0,
    apartamentos: 0,
    residentes: 0,
    carritos: 0,
    carritosDisponibles: 0,
    carritosPrestados: 0,
    entradas: 0,
});

const buildStatsByCondominio = (raw) => {
    const stats = new Map();
    const ensure = (id) => {
        if (!stats.has(id)) stats.set(id, emptyStats());
        return stats.get(id);
    };

    raw.torres.forEach((t) => {
        if (t.condominioId != null) ensure(t.condominioId).torres++;
    });
    raw.pisos.forEach((p) => {
        if (p.condominioId != null) ensure(p.condominioId).pisos++;
    });
    raw.apartamentos.forEach((a) => {
        if (a.condominioId != null) ensure(a.condominioId).apartamentos++;
    });
    raw.entradas.forEach((e) => {
        if (e.condominioId != null) ensure(e.condominioId).entradas++;
    });
    raw.carritos.forEach((c) => {
        if (c.condominioId == null) return;
        const s = ensure(c.condominioId);
        s.carritos++;
        if (isDisponible(c.estado)) s.carritosDisponibles++;
        else if (isPrestado(c.estado)) s.carritosPrestados++;
    });

    // residentes: usuario -> apartamento -> condominio
    const aptoCond = new Map(raw.apartamentos.map((a) => [a.id, a.condominioId]));
    raw.usuarios.forEach((u) => {
        const cid = u.apartamentoId != null ? aptoCond.get(u.apartamentoId) : null;
        if (cid != null) ensure(cid).residentes++;
    });

    return stats;
};

export const condominioResumenService = {
    invalidate: () => {
        cache = null;
    },

    // Listado de condominios, cada uno con sus totales (para las tarjetas).
    getResumen: async ({ force = false } = {}) => {
        const raw = await getRaw(force);
        const stats = buildStatsByCondominio(raw);
        return raw.condominios.map((c) => ({
            ...c,
            stats: stats.get(c.id) ?? emptyStats(),
        }));
    },

    // Detalle completo de un condominio (para la página de detalle).
    getDetalle: async (id, { force = false } = {}) => {
        const cid = Number(id);
        const raw = await getRaw(force);

        const condominio = raw.condominios.find((c) => c.id === cid) ?? null;
        const stats = buildStatsByCondominio(raw).get(cid) ?? emptyStats();

        const torres = raw.torres
            .filter((t) => t.condominioId === cid)
            .map((t) => ({
                ...t,
                nPisos: raw.pisos.filter((p) => p.torreId === t.id).length,
                nApartamentos: raw.apartamentos.filter((a) => a.torreId === t.id).length,
            }));

        const aptoById = new Map(raw.apartamentos.map((a) => [a.id, a]));
        const aptoIds = new Set(
            raw.apartamentos.filter((a) => a.condominioId === cid).map((a) => a.id),
        );
        const residentes = raw.usuarios
            .filter((u) => u.apartamentoId != null && aptoIds.has(u.apartamentoId))
            .map((u) => ({ ...u, apartamento: aptoById.get(u.apartamentoId) ?? null }));

        const carritos = raw.carritos.filter((c) => c.condominioId === cid);

        return { condominio, stats, torres, residentes, carritos };
    },
};
