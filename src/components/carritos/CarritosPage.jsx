import { useState, useEffect, useMemo, useRef } from "react";
import { carritoService } from "../../services/carritoService";
import {
    prestamoCarritoService,
    formatDateTime,
    formatMoney,
} from "../../services/prestamoCarritoService";
import { condominioService } from "../../services/condominioService";
import { usuarioService } from "../../services/usuarioService";
import { getApiErrorMessage } from "../../services/api";
import {
    confirmDelete,
    showSuccess,
    showError,
    confirmAction,
} from "../../utils/swalHelpers";
import CrudPageLayout from "../infraestructura/crud/CrudPageLayout";
import CrudTableCard from "../infraestructura/crud/CrudTableCard";
import CrudModal from "../infraestructura/crud/CrudModal";
import FormField from "../infraestructura/crud/FormField";
import { usePagination } from "../../hooks/usePagination";
import { useModulePermissions } from "../../hooks/useModulePermissions";

const CARRITO_EMPTY = {
    codigo: "",
    descripcion: "",
    estado: "DISPONIBLE",
    condominioId: "",
};
const PRESTAMO_EMPTY = { carritoId: "", usuarioId: "", estado: "ACTIVO" };

const CARRITO_COLUMNS = [
    { key: "idx", label: "#" },
    { key: "codigo", label: "Código" },
    { key: "descripcion", label: "Descripción" },
    { key: "condominio", label: "Condominio" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

const PRESTAMO_COLUMNS = [
    { key: "idx", label: "#" },
    { key: "carrito", label: "Carrito" },
    { key: "usuario", label: "Usuario" },
    { key: "tiempo", label: "Tiempo usado" },
    { key: "penalizacion", label: "Penalización" },
    { key: "estadoPen", label: "Estado penal." },
    { key: "prestamo", label: "Fecha préstamo" },
    { key: "devolucion", label: "Devolución" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

const ESTADO_CARRITO_STYLE = {
    DISPONIBLE: "bg-success",
    PRESTADO: "bg-warning text-dark",
    MANTENIMIENTO: "bg-info text-dark",
    INACTIVO: "bg-secondary",
};

const ESTADO_PRESTAMO_STYLE = {
    ACTIVO: "bg-warning text-dark",
    FINALIZADO: "bg-success",
    RETRASADO: "bg-danger",
};

const carritoLabel = (c) =>
    `${c.codigo}${c.descripcion ? ` — ${c.descripcion}` : ""} — ${c.condominioNombre || "—"} — ${c.estado}`;

const usuarioLabel = (u) =>
    `${u.nombres} ${u.apellidos}${u.email ? ` — ${u.email}` : ""}`;

const SearchableSelect = ({
    options,
    value,
    onChange,
    disabled,
    placeholder = "Buscar...",
    allowEmpty = false,
    emptyLabel = "—",
    inputClassName = "form-control",
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);

    const selected = options.find((o) => String(o.id) === String(value));

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery(selected?.nombre || "");
        }
    }, [open, selected?.nombre, value]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) =>
            (o.nombre || "").toLowerCase().includes(q),
        );
    }, [options, query]);

    const pick = (id, nombre) => {
        onChange(id === "" ? "" : id);
        setQuery(nombre || "");
        setOpen(false);
    };

    return (
        <div className="position-relative" ref={containerRef}>
            <input
                type="text"
                className={inputClassName}
                value={query}
                onChange={(e) => {
                    const next = e.target.value;
                    setQuery(next);
                    setOpen(true);
                    if (!next.trim() && allowEmpty) {
                        onChange("");
                    } else if (
                        !allowEmpty &&
                        selected &&
                        next !== selected.nombre
                    ) {
                        onChange("");
                    }
                }}
                onFocus={() => !disabled && setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
            />
            {open && !disabled && (
                <ul
                    className="list-group position-absolute w-100 shadow-sm border rounded-bottom"
                    style={{
                        zIndex: 1060,
                        maxHeight: "220px",
                        overflowY: "auto",
                    }}
                >
                    {allowEmpty && (
                        <li>
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action py-2 ${!value ? "active" : ""}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pick("", emptyLabel)}
                            >
                                {emptyLabel}
                            </button>
                        </li>
                    )}
                    {filtered.length === 0 ? (
                        <li className="list-group-item text-muted small py-2">
                            Sin resultados
                        </li>
                    ) : (
                        filtered.map((o) => (
                            <li key={o.id}>
                                <button
                                    type="button"
                                    className={`list-group-item list-group-item-action py-2 ${String(o.id) === String(value) ? "active" : ""}`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => pick(o.id, o.nombre)}
                                >
                                    {o.nombre}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

const EstadoCarritoBadge = ({ estado }) => (
    <span className={`badge ${ESTADO_CARRITO_STYLE[estado] || "bg-secondary"}`}>
        {estado}
    </span>
);

const EstadoPrestamoBadge = ({ estado }) => (
    <span
        className={`badge ${ESTADO_PRESTAMO_STYLE[estado] || "bg-secondary"}`}
    >
        {estado}
    </span>
);

const PENALIZACION_STYLE = {
    SIN_PENALIZACION: { badge: "bg-success", label: "✔ Sin penalización" },
    PENALIZADO: { badge: "bg-warning text-dark", label: "⚠ Penalizado" },
    PAGADO: { badge: "bg-info", label: "💰 Pagado" },
};

const PenalizacionBadge = ({ estadoPenalizacion }) => {
    const cfg =
        PENALIZACION_STYLE[estadoPenalizacion] ||
        PENALIZACION_STYLE.SIN_PENALIZACION;
    return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
};

const CarritosPage = () => {
    const carritoPerms = useModulePermissions("CARRITOS");
    const prestamoPerms = useModulePermissions("PRESTAMOS");
    const [activeTab, setActiveTab] = useState("carritos");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pageError, setPageError] = useState("");
    const [carritosTodos, setCarritosTodos] = useState([]);
    const [prestamosTodos, setPrestamosTodos] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [searchCarritos, setSearchCarritos] = useState("");
    const [searchPrestamos, setSearchPrestamos] = useState("");
    const [filtroCondominioId, setFiltroCondominioId] = useState("");
    const [filtroCarritoId, setFiltroCarritoId] = useState("");

    const [showCarritoModal, setShowCarritoModal] = useState(false);
    const [carritoEditMode, setCarritoEditMode] = useState(false);
    const [carritoSelected, setCarritoSelected] = useState(null);
    const [carritoForm, setCarritoForm] = useState(CARRITO_EMPTY);
    const [carritoModalError, setCarritoModalError] = useState("");

    const [showPrestamoModal, setShowPrestamoModal] = useState(false);
    const [prestamoForm, setPrestamoForm] = useState(PRESTAMO_EMPTY);
    const [prestamoModalError, setPrestamoModalError] = useState("");
    const [prestamoFormKey, setPrestamoFormKey] = useState(0);

    const busy = saving || deletingId != null;

    const condominioOptions = useMemo(
        () => condominios.map((c) => ({ ...c, nombre: c.nombre })),
        [condominios],
    );

    const carritoFilterOptions = useMemo(
        () => carritosTodos.map((c) => ({ ...c, nombre: carritoLabel(c) })),
        [carritosTodos],
    );

    const carritoPrestamoOptions = useMemo(
        () =>
            carritosTodos
                .filter((c) => c.estado === "DISPONIBLE")
                .map((c) => ({ ...c, nombre: carritoLabel(c) })),
        [carritosTodos],
    );

    const usuarioOptions = useMemo(
        () => usuarios.map((u) => ({ ...u, nombre: usuarioLabel(u) })),
        [usuarios],
    );

    const loadAll = async () => {
        const [condos, users, carritosData, prestamosData] = await Promise.all([
            condominioService.getAll(),
            usuarioService.getAll(),
            carritoService.getAll(),
            prestamoCarritoService.getAll(),
        ]);
        setCondominios(condos);
        setUsuarios(users);
        setCarritosTodos(carritosData);
        setPrestamosTodos(prestamosData);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await loadAll();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar datos"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filteredCarritos = useMemo(() => {
        let list = carritosTodos;
        if (filtroCondominioId) {
            list = list.filter(
                (c) => String(c.condominioId) === String(filtroCondominioId),
            );
        }
        const q = searchCarritos.trim().toLowerCase();
        if (!q) return list;
        return list.filter((c) => {
            const codigo = (c.codigo || "").toLowerCase();
            const desc = (c.descripcion || "").toLowerCase();
            const estado = (c.estado || "").toLowerCase();
            const condo = (c.condominioNombre || "").toLowerCase();
            return (
                codigo.includes(q) ||
                desc.includes(q) ||
                estado.includes(q) ||
                condo.includes(q)
            );
        });
    }, [carritosTodos, filtroCondominioId, searchCarritos]);

    const filteredPrestamos = useMemo(() => {
        let list = prestamosTodos;
        if (filtroCarritoId) {
            list = list.filter(
                (p) => String(p.carritoId) === String(filtroCarritoId),
            );
        }
        const q = searchPrestamos.trim().toLowerCase();
        if (!q) return list;
        return list.filter((p) => {
            const carrito = (p.codigoCarrito || "").toLowerCase();
            const usuario = (p.usuarioNombre || "").toLowerCase();
            const estado = (p.estado || "").toLowerCase();
            const fPrestamo = formatDateTime(p.fechaPrestamo).toLowerCase();
            const fDev = formatDateTime(p.fechaDevolucion).toLowerCase();
            return (
                carrito.includes(q) ||
                usuario.includes(q) ||
                estado.includes(q) ||
                fPrestamo.includes(q) ||
                fDev.includes(q)
            );
        });
    }, [prestamosTodos, filtroCarritoId, searchPrestamos]);

    const carritosPagination = usePagination(filteredCarritos);
    const prestamosPagination = usePagination(filteredPrestamos);

    const updateCarritoInState = (updated) => {
        setCarritosTodos((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c)),
        );
    };

    const openCarritoCreate = () => {
        setCarritoEditMode(false);
        setCarritoSelected(null);
        setCarritoForm({
            ...CARRITO_EMPTY,
            condominioId: filtroCondominioId || "",
        });
        setCarritoModalError("");
        setShowCarritoModal(true);
    };

    const openCarritoEdit = (item) => {
        setCarritoEditMode(true);
        setCarritoSelected(item);
        setCarritoForm({
            codigo: item.codigo || "",
            descripcion: item.descripcion || "",
            estado: item.estado || "DISPONIBLE",
            condominioId: item.condominioId || "",
        });
        setCarritoModalError("");
        setShowCarritoModal(true);
    };

    const saveCarrito = async () => {
        if (!carritoForm.codigo?.trim() || !carritoForm.condominioId) {
            setCarritoModalError("Código y condominio son obligatorios.");
            return;
        }
        setSaving(true);
        setCarritoModalError("");
        try {
            if (carritoEditMode) {
                const updated = await carritoService.update(
                    carritoSelected.id,
                    carritoForm,
                );
                updateCarritoInState(updated);
                await showSuccess("Carrito actualizado correctamente.");
            } else {
                const created = await carritoService.create(carritoForm);
                setCarritosTodos((prev) => [...prev, created]);
                await showSuccess("Carrito creado correctamente.");
            }
            setShowCarritoModal(false);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar el carrito");
            setCarritoModalError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const deleteCarrito = async (item) => {
        const ok = await confirmDelete(`el carrito "${item.codigo}"`);
        if (!ok) return;
        setDeletingId(item.id);
        try {
            await carritoService.delete(item.id);
            setCarritosTodos((prev) => prev.filter((c) => c.id !== item.id));
            await showSuccess("Carrito eliminado correctamente.");
        } catch (err) {
            await showError(
                getApiErrorMessage(err, "Error al eliminar el carrito"),
            );
        } finally {
            setDeletingId(null);
        }
    };

    const openPrestamoCreate = (carritoId = "") => {
        setPrestamoForm({
            carritoId: carritoId ? String(carritoId) : "",
            usuarioId: "",
            estado: "ACTIVO",
        });
        setPrestamoFormKey((k) => k + 1);
        setPrestamoModalError("");
        setShowPrestamoModal(true);
        setActiveTab("prestamos");
    };

    const setCarritoEstadoLocal = (carritoId, estado) => {
        setCarritosTodos((prev) =>
            prev.map((c) =>
                String(c.id) === String(carritoId) ? { ...c, estado } : c,
            ),
        );
    };

    const savePrestamo = async () => {
        if (!prestamoForm.carritoId) {
            setPrestamoModalError("Seleccione un carrito.");
            return;
        }
        if (!prestamoForm.usuarioId) {
            setPrestamoModalError("Seleccione un usuario.");
            return;
        }
        setSaving(true);
        setPrestamoModalError("");
        try {
            const created = await prestamoCarritoService.create({
                carritoId: prestamoForm.carritoId,
                usuarioId: prestamoForm.usuarioId,
            });
            setPrestamosTodos((prev) => [...prev, created]);
            setCarritoEstadoLocal(prestamoForm.carritoId, "PRESTADO");
            setShowPrestamoModal(false);
            await showSuccess("Préstamo registrado correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                "Error al registrar el préstamo",
            );
            setPrestamoModalError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const devolverPrestamo = async (prestamo) => {
        const ok = await confirmAction({
            title: "¿Registrar devolución?",
            text: `Carrito ${prestamo.codigoCarrito} — ${prestamo.usuarioNombre}`,
            confirmText: "Sí, devolver",
            icon: "question",
        });
        if (!ok) return;
        setSaving(true);
        try {
            const updated = await prestamoCarritoService.devolver(prestamo.id);
            setPrestamosTodos((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p)),
            );
            setCarritoEstadoLocal(prestamo.carritoId, "DISPONIBLE");
            if (updated.penalizado && !updated.pagado) {
                await showSuccess(
                    `Devolución registrada. Penalización: ${formatMoney(updated.montoPenalizacion)} (${updated.tiempoExcedidoMinutos} min excedidos).`,
                );
            } else {
                await showSuccess("Devolución registrada correctamente.");
            }
        } catch (err) {
            await showError(
                getApiErrorMessage(err, "Error al registrar la devolución"),
            );
        } finally {
            setSaving(false);
        }
    };

    const pagarPenalizacion = async (prestamo) => {
        const ok = await confirmAction({
            title: "¿Registrar pago de penalización?",
            text: `Monto: ${formatMoney(prestamo.montoPenalizacion)} — ${prestamo.usuarioNombre}`,
            confirmText: "Sí, marcar pagado",
            icon: "question",
        });
        if (!ok) return;
        setSaving(true);
        try {
            const updated = await prestamoCarritoService.marcarPagado(prestamo.id);
            setPrestamosTodos((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p)),
            );
            await showSuccess("Penalización marcada como pagada.");
        } catch (err) {
            await showError(
                getApiErrorMessage(err, "Error al registrar el pago"),
            );
        } finally {
            setSaving(false);
        }
    };

    const deletePrestamo = async (prestamo) => {
        const ok = await confirmDelete(`el préstamo #${prestamo.id}`);
        if (!ok) return;
        setDeletingId(prestamo.id);
        try {
            await prestamoCarritoService.delete(prestamo.id);
            setPrestamosTodos((prev) =>
                prev.filter((p) => p.id !== prestamo.id),
            );
            await showSuccess("Préstamo eliminado correctamente.");
        } catch (err) {
            await showError(
                getApiErrorMessage(err, "Error al eliminar el préstamo"),
            );
        } finally {
            setDeletingId(null);
        }
    };

    const verHistorialCarrito = (carritoId) => {
        setFiltroCarritoId(String(carritoId));
        setSearchPrestamos("");
        setActiveTab("prestamos");
    };

    const carritosTableFilter = (
        <div className="d-flex flex-wrap gap-2 align-items-center">
            <input
                type="search"
                className="form-control form-control-sm"
                style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}
                placeholder="Buscar por código, descripción o estado..."
                value={searchCarritos}
                onChange={(e) => setSearchCarritos(e.target.value)}
                disabled={loading}
            />
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    options={condominioOptions}
                    value={filtroCondominioId}
                    onChange={setFiltroCondominioId}
                    disabled={loading}
                    placeholder="Filtrar condominio..."
                    allowEmpty
                    emptyLabel="Todos los condominios"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
        </div>
    );

    const prestamosTableFilter = (
        <div className="d-flex flex-wrap gap-2 align-items-center">
            <input
                type="search"
                className="form-control form-control-sm"
                style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}
                placeholder="Buscar por carrito, usuario o fecha..."
                value={searchPrestamos}
                onChange={(e) => setSearchPrestamos(e.target.value)}
                disabled={loading}
            />
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    options={carritoFilterOptions}
                    value={filtroCarritoId}
                    onChange={setFiltroCarritoId}
                    disabled={loading}
                    placeholder="Filtrar carrito..."
                    allowEmpty
                    emptyLabel="Todos los carritos"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
        </div>
    );

    const carritoRows = carritosPagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{carritosPagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.codigo}</td>
            <td className="px-4 py-3">{item.descripcion || "—"}</td>
            <td className="px-4 py-3">{item.condominioNombre || "—"}</td>
            <td className="px-4 py-3">
                <EstadoCarritoBadge estado={item.estado} />
            </td>
            <td className="text-nowrap px-4 py-3">
                {prestamoPerms.canCreate && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-success me-1"
                    title="Prestar"
                    onClick={() => openPrestamoCreate(item.id)}
                    disabled={busy || item.estado !== "DISPONIBLE"}
                >
                    <i className="bi bi-box-arrow-right" />
                </button>
                )}
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary me-1"
                    title="Historial"
                    onClick={() => verHistorialCarrito(item.id)}
                    disabled={busy}
                >
                    <i className="bi bi-clock-history" />
                </button>
                {carritoPerms.canEdit && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-1"
                    title="Editar"
                    onClick={() => openCarritoEdit(item)}
                    disabled={busy}
                >
                    <i className="bi bi-pencil" />
                </button>
                )}
                {carritoPerms.canDelete && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Eliminar"
                    onClick={() => deleteCarrito(item)}
                    disabled={busy || deletingId === item.id}
                >
                    <i className="bi bi-trash" />
                </button>
                )}
            </td>
        </tr>
    ));

    const prestamoRows = prestamosPagination.paginatedItems.map(
        (item, index) => (
            <tr key={item.id}>
                <td className="px-4 py-3">
                    {prestamosPagination.rowIndex(index)}
                </td>
                <td className="px-4 py-3 fw-semibold">{item.codigoCarrito}</td>
                <td className="px-4 py-3">{item.usuarioNombre}</td>
                <td className="px-4 py-3">
                    {item.minutosUsados != null
                        ? `${item.minutosUsados} min`
                        : "—"}
                    {item.tiempoLimiteMinutos != null && (
                        <small className="text-muted d-block">
                            límite {item.tiempoLimiteMinutos} min
                        </small>
                    )}
                </td>
                <td className="px-4 py-3">
                    {item.penalizado
                        ? formatMoney(item.montoPenalizacion)
                        : "—"}
                </td>
                <td className="px-4 py-3">
                    <PenalizacionBadge
                        estadoPenalizacion={item.estadoPenalizacion}
                    />
                </td>
                <td className="px-4 py-3">
                    {formatDateTime(item.fechaPrestamo)}
                </td>
                <td className="px-4 py-3">
                    {formatDateTime(item.fechaDevolucion)}
                </td>
                <td className="px-4 py-3">
                    <EstadoPrestamoBadge estado={item.estado} />
                </td>
                <td className="text-nowrap px-4 py-3">
                {item.estado === "ACTIVO" && prestamoPerms.canEdit && (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-success me-1"
                        onClick={() => devolverPrestamo(item)}
                        disabled={busy}
                    >
                            <i className="bi bi-arrow-return-left me-1" />
                            Devolver
                        </button>
                    )}
                    {item.penalizado &&
                        !item.pagado &&
                        prestamoPerms.canEdit && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-warning me-1"
                                onClick={() => pagarPenalizacion(item)}
                                disabled={busy}
                                title="Marcar penalización pagada"
                            >
                                <i className="bi bi-cash-coin me-1" />
                                Pagar
                            </button>
                        )}
                    {prestamoPerms.canDelete && (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deletePrestamo(item)}
                        disabled={busy || deletingId === item.id}
                        title="Eliminar"
                    >
                        <i className="bi bi-trash" />
                    </button>
                    )}
                </td>
            </tr>
        ),
    );

    return (
        <CrudPageLayout
            loading={loading}
            title="Gestión de Carritos"
            subtitle="Administra carritos de carga y el historial de préstamos"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${activeTab === "carritos" ? "active" : ""}`}
                        onClick={() => setActiveTab("carritos")}
                    >
                        <i className="bi bi-cart me-1" /> Carritos
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${activeTab === "prestamos" ? "active" : ""}`}
                        onClick={() => setActiveTab("prestamos")}
                    >
                        <i className="bi bi-clock-history me-1" /> Préstamos e
                        historial
                    </button>
                </li>
            </ul>

            {activeTab === "carritos" && (
                <CrudTableCard
                    title="Listado de Carritos"
                    filter={carritosTableFilter}
                    onAdd={openCarritoCreate}
                    canAdd={carritoPerms.canCreate}
                    addLabel="Agregar Carrito"
                    saving={busy}
                    columns={CARRITO_COLUMNS}
                    colSpan={CARRITO_COLUMNS.length}
                    emptyMessage={
                        searchCarritos.trim() || filtroCondominioId
                            ? "No hay resultados para la búsqueda"
                            : "No hay carritos registrados"
                    }
                    rows={carritoRows}
                    pagination={carritosPagination}
                />
            )}

            {activeTab === "prestamos" && (
                <CrudTableCard
                    title="Historial de Préstamos"
                    filter={prestamosTableFilter}
                    onAdd={() => openPrestamoCreate()}
                    canAdd={prestamoPerms.canCreate}
                    addLabel="Registrar Préstamo"
                    saving={busy}
                    columns={PRESTAMO_COLUMNS}
                    colSpan={PRESTAMO_COLUMNS.length}
                    emptyMessage={
                        searchPrestamos.trim() || filtroCarritoId
                            ? "No hay resultados para la búsqueda"
                            : "No hay préstamos registrados"
                    }
                    rows={prestamoRows}
                    pagination={prestamosPagination}
                />
            )}

            <CrudModal
                show={showCarritoModal}
                title={carritoEditMode ? "Editar Carrito" : "Agregar Carrito"}
                error={carritoModalError}
                saving={saving}
                onClose={() => !busy && setShowCarritoModal(false)}
                onSave={saveCarrito}
                editMode={carritoEditMode}
            >
                <FormField label="Código" required>
                    <input
                        type="text"
                        className="form-control"
                        value={carritoForm.codigo}
                        onChange={(e) =>
                            setCarritoForm({
                                ...carritoForm,
                                codigo: e.target.value,
                            })
                        }
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Descripción">
                    <input
                        type="text"
                        className="form-control"
                        value={carritoForm.descripcion}
                        onChange={(e) =>
                            setCarritoForm({
                                ...carritoForm,
                                descripcion: e.target.value,
                            })
                        }
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Condominio" required>
                    <SearchableSelect
                        options={condominioOptions}
                        value={carritoForm.condominioId}
                        onChange={(id) =>
                            setCarritoForm({ ...carritoForm, condominioId: id })
                        }
                        disabled={saving}
                        placeholder="Seleccione un condominio"
                        inputClassName="form-control"
                    />
                </FormField>
                <FormField label="Estado" required>
                    <select
                        className="form-select"
                        value={carritoForm.estado}
                        onChange={(e) =>
                            setCarritoForm({
                                ...carritoForm,
                                estado: e.target.value,
                            })
                        }
                        disabled={saving}
                    >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="PRESTADO">Prestado</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </FormField>
            </CrudModal>

            <CrudModal
                show={showPrestamoModal}
                title="Registrar Préstamo"
                error={prestamoModalError}
                saving={saving}
                onClose={() => !busy && setShowPrestamoModal(false)}
                onSave={savePrestamo}
                editMode={false}
            >
                <FormField label="Carrito" required>
                    <SearchableSelect
                        key={`carrito-prestamo-${prestamoFormKey}-${prestamoForm.carritoId}`}
                        options={carritoPrestamoOptions}
                        value={prestamoForm.carritoId}
                        onChange={(id) =>
                            setPrestamoForm({ ...prestamoForm, carritoId: id })
                        }
                        disabled={saving}
                        placeholder="Buscar carrito..."
                        inputClassName="form-control"
                    />
                </FormField>
                <FormField label="Usuario" required>
                    <SearchableSelect
                        key={`usuario-prestamo-${prestamoFormKey}`}
                        options={usuarioOptions}
                        value={prestamoForm.usuarioId}
                        onChange={(id) =>
                            setPrestamoForm({ ...prestamoForm, usuarioId: id })
                        }
                        disabled={saving}
                        placeholder="Buscar usuario..."
                        inputClassName="form-control"
                    />
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default CarritosPage;
