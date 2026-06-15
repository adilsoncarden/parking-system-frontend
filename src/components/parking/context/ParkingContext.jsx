// src/components/parking/context/ParkingContext.jsx
//
// Contexto del módulo Parking conectado a la API real de CondoSaaS.
// Mantiene la MISMA interfaz pública que la versión mock para no tocar las páginas:
// vehicles, parkingSpaces, accessLog + acciones (addVehicle, grantAccess, registerExit, ...).
// Los datos crudos de la API se mapean a la forma que esperan los componentes.

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { format } from "date-fns";
import { parkingService } from "../../../services/parkingService";

const ParkingContext = createContext(null);

// ── Helpers de mapeo API → forma de la UI ──────────────────────────

// El backend usa PROPIETARIO/INQUILINO/VISITANTE; la UI de parking usa residente/visitante.
const mapTipoOcupante = (t) => (t === "VISITANTE" ? "visitante" : "residente");

const mapVehiculo = (v) => ({
    id: v.id,
    placa: v.placa,
    vehiculoDesc: [v.marca, v.modelo, v.color].filter(Boolean).join(" ") || "—",
    propietario: v.usuarioNombre || "—",
    unidad: v.unidad || null,
    espacioAsignado: null,
    tipoOcupante: mapTipoOcupante(v.tipoOcupante),
    estado: v.estado === "ACTIVO" ? "activo" : "expirado",
    fechaExpiracion: null,
    // Campos crudos para la ficha del Control de Acceso (sin llamadas extra a la API)
    usuarioNombre: v.usuarioNombre,
    marca: v.marca,
    modelo: v.modelo,
    color: v.color,
    tipoOcupanteRaw: v.tipoOcupante,
    condominioNombre: v.condominioNombre,
    torreNombre: v.torreNombre,
    pisoNumero: v.pisoNumero,
});

const mapEstacionamiento = (e) => ({
    id: e.id,
    code: e.codigo,
    zona: e.zonaNombre,
    zonaId: e.zonaEstacionamientoId,
    condominio: e.condominioNombre || "Sin condominio",
    condominioId: e.condominioId || null,
    tipo: "residente",
    ocupado: e.estadoOcupacion === "OCUPADO",
    enMantenimiento: e.estadoOcupacion === "INACTIVO",
    vehiculoId: e.vehiculoActualId || null,
    placaActual: e.placaActual || null,
});

const calcDuracion = (entrada, salida) => {
    if (!entrada || !salida) return null;
    const min = Math.round((salida.getTime() - entrada.getTime()) / 60000);
    if (min <= 0) return "0h 0m";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
};

const mapPermanencia = (p, vehiculosById) => {
    const v = vehiculosById[p.vehiculoId];
    const entrada = p.fechaEntrada ? new Date(p.fechaEntrada) : null;
    const salida = p.fechaSalida ? new Date(p.fechaSalida) : null;
    return {
        id: p.id,
        vehiculoId: p.vehiculoId,
        placa: p.placa,
        propietario: v?.propietario || "—",
        unidad: v?.unidad || null,
        tipoOcupante: v?.tipoOcupante || "residente",
        vehiculoDesc: v?.vehiculoDesc || "—",
        espacioId: null,
        fecha: entrada ? format(entrada, "yyyy-MM-dd") : "",
        horaEntrada: entrada ? format(entrada, "HH:mm") : null,
        horaSalida: salida ? format(salida, "HH:mm") : null,
        duracion: entrada && salida ? calcDuracion(entrada, salida) : null,
        estadoEntrada: p.estado === "ACTIVA" ? "entrada_aprobada" : "salida_registrada",
    };
};

const getCurrentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null")?.id ?? null;
    } catch {
        return null;
    }
};

export function ParkingProvider({ children }) {
    const [vehicles, setVehicles] = useState([]);
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [accessLog, setAccessLog] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const generateId = (prefix) =>
        `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const addNotification = useCallback((type, message, detail = "") => {
        setNotifications((prev) =>
            [
                {
                    id: generateId("notif"),
                    type,
                    message,
                    detail,
                    timestamp: new Date().toISOString(),
                    read: false,
                },
                ...prev,
            ].slice(0, 50),
        );
    }, []);

    // ── Carga inicial / recarga desde la API ──
    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [vehRaw, estRaw, permRaw] = await Promise.all([
                parkingService.getVehiculos(),
                parkingService.getEstacionamientos(),
                parkingService.getPermanencias(),
            ]);

            const veh = vehRaw.map(mapVehiculo);
            const vehById = Object.fromEntries(veh.map((v) => [v.id, v]));

            setVehicles(veh);
            setParkingSpaces(estRaw.map(mapEstacionamiento));
            setAccessLog(
                permRaw
                    .map((p) => mapPermanencia(p, vehById))
                    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
            );
        } catch (err) {
            setError(err?.message || "No se pudieron cargar los datos de parking");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    // ── VEHÍCULOS ──
    const addVehicle = useCallback(
        async (data) => {
            try {
                await parkingService.createVehiculo({
                    placa: (data.placa || "").toUpperCase(),
                    marca: data.vehiculoDesc || data.marca || "",
                    modelo: data.modelo || "",
                    color: data.color || "",
                    estado: data.estado === "expirado" ? "INACTIVO" : "ACTIVO",
                    usuarioId: data.usuarioId || getCurrentUserId(),
                });
                addNotification("success", `Vehículo registrado — ${data.placa}`);
                await loadAll();
            } catch (err) {
                addNotification("alert", "No se pudo registrar el vehículo", err?.message || "");
            }
        },
        [addNotification, loadAll],
    );

    const updateVehicle = useCallback(
        async (id, changes) => {
            // Solo aplica si trae datos de vehículo (no el espacioAsignado interno del mock)
            if (!changes || (!changes.placa && !changes.estado)) return;
            try {
                await parkingService.updateVehiculo(id, {
                    placa: changes.placa,
                    marca: changes.marca || "",
                    modelo: changes.modelo || "",
                    color: changes.color || "",
                    estado: changes.estado === "expirado" ? "INACTIVO" : "ACTIVO",
                    usuarioId: changes.usuarioId || getCurrentUserId(),
                });
                await loadAll();
            } catch (err) {
                addNotification("alert", "No se pudo actualizar el vehículo", err?.message || "");
            }
        },
        [addNotification, loadAll],
    );

    const removeVehicle = useCallback(
        async (id) => {
            try {
                await parkingService.deleteVehiculo(id);
                addNotification("info", "Vehículo eliminado");
                await loadAll();
            } catch (err) {
                addNotification("alert", "No se pudo eliminar el vehículo", err?.message || "");
            }
        },
        [addNotification, loadAll],
    );

    // ── ACCESO ──
    const grantAccess = useCallback(
        async (placa, observacion) => {
            try {
                await parkingService.registrarEntrada({
                    placa: (placa || "").toUpperCase(),
                    metodo: "MANUAL",
                    observacion: observacion || null,
                });
                addNotification("success", `Entrada aprobada — ${placa?.toUpperCase()}`);
                await loadAll();
            } catch (err) {
                addNotification("alert", `No se pudo registrar la entrada — ${placa}`, err?.message || "");
            }
        },
        [addNotification, loadAll],
    );

    const registerExit = useCallback(
        async (placa) => {
            try {
                await parkingService.registrarSalida({ placa: (placa || "").toUpperCase() });
                addNotification("info", `Salida registrada — ${placa?.toUpperCase()}`);
                await loadAll();
            } catch (err) {
                addNotification("warning", `Sin entrada activa — ${placa?.toUpperCase()}`, err?.message || "");
            }
        },
        [addNotification, loadAll],
    );

    // El registro manual (placa ilegible / sin vehículo) requiere un vehículo existente en la API.
    const registerManual = useCallback(
        async (placa) => {
            await grantAccess(placa);
        },
        [grantAccess],
    );

    // ── ESPACIOS ──
    const getFirstAvailableSpace = useCallback(
        () => parkingSpaces.find((s) => !s.ocupado && !s.enMantenimiento) || null,
        [parkingSpaces],
    );

    // Asignar un vehículo a una plaza = registrar su entrada en esa plaza.
    const reassignSpace = useCallback(
        async (spaceId, placa) => {
            if (!placa) return;
            try {
                await parkingService.registrarEntrada({
                    placa: placa.toUpperCase(),
                    metodo: "MANUAL",
                    estacionamientoId: spaceId,
                });
                addNotification("success", `Plaza asignada a ${placa.toUpperCase()}`);
                await loadAll();
            } catch (err) {
                addNotification("alert", "No se pudo asignar la plaza", err?.message || "");
            }
        },
        [addNotification, loadAll],
    );

    const toggleSpaceMaintenance = useCallback(
        async (spaceId, newStatus) => {
            const space = parkingSpaces.find((s) => s.id === spaceId);
            if (!space) return;
            try {
                await parkingService.updateEstacionamiento(spaceId, {
                    codigo: space.code,
                    estadoOcupacion: newStatus === "maintenance" ? "INACTIVO" : "LIBRE",
                    zonaEstacionamientoId: space.zonaId,
                });
                await loadAll();
            } catch (err) {
                addNotification("alert", "No se pudo cambiar el estado de la plaza", err?.message || "");
            }
        },
        [parkingSpaces, addNotification, loadAll],
    );

    // ── DERIVADAS ──
    const recentActivity = accessLog.slice(0, 10);
    const activeVehicles = vehicles.filter((v) => v.estado === "activo");
    const expiredVehicles = vehicles.filter((v) => v.estado === "expirado");
    const spacesAvailable = parkingSpaces.filter((s) => !s.ocupado && !s.enMantenimiento).length;
    const spacesOccupied = parkingSpaces.filter((s) => s.ocupado).length;

    const value = {
        vehicles,
        parkingSpaces,
        accessLog,
        loading,
        error,
        reload: loadAll,

        recentActivity,
        activeVehicles,
        expiredVehicles,
        spacesAvailable,
        spacesOccupied,

        addVehicle,
        updateVehicle,
        removeVehicle,

        grantAccess,
        registerExit,
        registerManual,

        reassignSpace,
        toggleSpaceMaintenance,
        getFirstAvailableSpace,
        resetAll: loadAll,

        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        markAsRead: (id) =>
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
        markAllAsRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
        clearNotifications: () => setNotifications([]),
    };

    return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
    const ctx = useContext(ParkingContext);
    if (!ctx) throw new Error("useParking debe usarse dentro de <ParkingProvider>");
    return ctx;
}
