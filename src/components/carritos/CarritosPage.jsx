import { useState, useEffect } from "react";
import { carritoService } from "../../services/carritoService";
import { prestamoCarritoService, toApiDateTime, formatDateTime } from "../../services/prestamoCarritoService";
import { condominioService } from "../../services/condominioService";
import { usuarioService } from "../../services/usuarioService";
import { getApiErrorMessage } from "../../services/api";
import { confirmDelete, showSuccess, showError, confirmAction } from "../../utils/swalHelpers";
import CrudPageLayout from "../infraestructura/crud/CrudPageLayout";
import CrudTableCard from "../infraestructura/crud/CrudTableCard";
import CrudModal from "../infraestructura/crud/CrudModal";
import FormField from "../infraestructura/crud/FormField";
import { usePagination } from "../../hooks/usePagination";

const CARRITO_EMPTY = { codigo: "", descripcion: "", estado: "DISPONIBLE", condominioId: "" };
const PRESTAMO_EMPTY = { carritoId: "", usuarioId: "", estado: "ACTIVO" };

const CARRITO_COLUMNS = [
    { key: "idx", label: "#" },
    { key: "codigo", label: "Código" },
    { key: "descripcion", label: "Descripción" },
    { key: "condominio", label: "Condominio" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones", className: "text-end" },
];

const PRESTAMO_COLUMNS = [
    { key: "idx", label: "#" },
    { key: "carrito", label: "Carrito" },
    { key: "usuario", label: "Usuario" },
    { key: "prestamo", label: "Fecha préstamo" },
    { key: "devolucion", label: "Fecha devolución" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones", className: "text-end" },
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

const EstadoCarritoBadge = ({ estado }) => (
    <span className={`badge ${ESTADO_CARRITO_STYLE[estado] || "bg-secondary"}`}>{estado}</span>
);

const EstadoPrestamoBadge = ({ estado }) => (
    <span className={`badge ${ESTADO_PRESTAMO_STYLE[estado] || "bg-secondary"}`}>{estado}</span>
);

const CarritosPage = () => {
    const [activeTab, setActiveTab] = useState("carritos");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");
    const [carritos, setCarritos] = useState([]);
    const [carritosTodos, setCarritosTodos] = useState([]);
    const [prestamos, setPrestamos] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [filtroCondominioId, setFiltroCondominioId] = useState("");
    const [filtroCarritoId, setFiltroCarritoId] = useState("");
    const [filtering, setFiltering] = useState(false);

    const [showCarritoModal, setShowCarritoModal] = useState(false);
    const [carritoEditMode, setCarritoEditMode] = useState(false);
    const [carritoSelected, setCarritoSelected] = useState(null);
    const [carritoForm, setCarritoForm] = useState(CARRITO_EMPTY);
    const [carritoModalError, setCarritoModalError] = useState("");

    const [showPrestamoModal, setShowPrestamoModal] = useState(false);
    const [prestamoForm, setPrestamoForm] = useState(PRESTAMO_EMPTY);
    const [prestamoModalError, setPrestamoModalError] = useState("");

    const loadCatalogos = async () => {
        const [condos, users, todosCarritos] = await Promise.all([
            condominioService.getAll(),
            usuarioService.getAll(),
            carritoService.getAll(),
        ]);
        setCondominios(condos);
        setUsuarios(users);
        setCarritosTodos(todosCarritos);
    };

    const loadCarritos = async (condominioId = filtroCondominioId) => {
        const data = await carritoService.getAll(condominioId || undefined);
        setCarritos(data);
    };

    const loadPrestamos = async (carritoId = filtroCarritoId) => {
        const data = await prestamoCarritoService.getAll(carritoId || undefined);
        setPrestamos(data);
    };

    const loadAll = async () => {
        await Promise.all([loadCatalogos(), loadCarritos(), loadPrestamos()]);
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

    useEffect(() => {
        if (loading || activeTab !== "carritos") return;
        (async () => {
            setFiltering(true);
            try {
                await loadCarritos(filtroCondominioId);
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al filtrar carritos"));
            } finally {
                setFiltering(false);
            }
        })();
    }, [filtroCondominioId]);

    useEffect(() => {
        if (loading || activeTab !== "prestamos") return;
        (async () => {
            setFiltering(true);
            try {
                await loadPrestamos(filtroCarritoId);
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al filtrar préstamos"));
            } finally {
                setFiltering(false);
            }
        })();
    }, [filtroCarritoId, activeTab]);

    const carritosPagination = usePagination(carritos);
    const prestamosPagination = usePagination(prestamos);

    const openCarritoCreate = () => {
        setCarritoEditMode(false);
        setCarritoSelected(null);
        setCarritoForm({
            ...CARRITO_EMPTY,
            condominioId: filtroCondominioId || condominios[0]?.id || "",
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
                await carritoService.update(carritoSelected.id, carritoForm);
                await showSuccess("Carrito actualizado correctamente.");
            } else {
                await carritoService.create(carritoForm);
                await showSuccess("Carrito creado correctamente.");
            }
            await loadCarritos(filtroCondominioId);
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
        setSaving(true);
        try {
            await carritoService.delete(item.id);
            await loadCarritos(filtroCondominioId);
            await showSuccess("Carrito eliminado correctamente.");
        } catch (err) {
            await showError(getApiErrorMessage(err, "Error al eliminar el carrito"));
        } finally {
            setSaving(false);
        }
    };

    const openPrestamoCreate = (carritoId = "") => {
        setPrestamoForm({
            carritoId: carritoId || filtroCarritoId || "",
            usuarioId: "",
            estado: "ACTIVO",
        });
        setPrestamoModalError("");
        setShowPrestamoModal(true);
        setActiveTab("prestamos");
    };

    const syncCarritoEstado = async (carritoId, estado) => {
        const carrito = carritosTodos.find((c) => c.id === Number(carritoId));
        if (!carrito) return;
        await carritoService.update(carrito.id, {
            codigo: carrito.codigo,
            descripcion: carrito.descripcion,
            estado,
            condominioId: carrito.condominioId,
        });
    };

    const carritosDisponibles = carritosTodos.filter((c) => c.estado === "DISPONIBLE");

    const savePrestamo = async () => {
        if (!prestamoForm.carritoId || !prestamoForm.usuarioId) {
            setPrestamoModalError("Selecciona carrito y usuario.");
            return;
        }
        setSaving(true);
        setPrestamoModalError("");
        try {
            await prestamoCarritoService.create({
                fechaPrestamo: toApiDateTime(),
                fechaDevolucion: null,
                estado: "ACTIVO",
                carritoId: prestamoForm.carritoId,
                usuarioId: prestamoForm.usuarioId,
            });
            await syncCarritoEstado(prestamoForm.carritoId, "PRESTADO");
            await loadCatalogos();
            await loadPrestamos(filtroCarritoId);
            await loadCarritos(filtroCondominioId);
            setShowPrestamoModal(false);
            await showSuccess("Préstamo registrado correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al registrar el préstamo");
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
            await prestamoCarritoService.registrarDevolucion(prestamo);
            await syncCarritoEstado(prestamo.carritoId, "DISPONIBLE");
            await loadCatalogos();
            await loadPrestamos(filtroCarritoId);
            await loadCarritos(filtroCondominioId);
            await showSuccess("Devolución registrada correctamente.");
        } catch (err) {
            await showError(getApiErrorMessage(err, "Error al registrar la devolución"));
        } finally {
            setSaving(false);
        }
    };

    const deletePrestamo = async (prestamo) => {
        const ok = await confirmDelete(`el préstamo #${prestamo.id}`);
        if (!ok) return;
        setSaving(true);
        try {
            await prestamoCarritoService.delete(prestamo.id);
            await loadPrestamos(filtroCarritoId);
            await showSuccess("Préstamo eliminado correctamente.");
        } catch (err) {
            await showError(getApiErrorMessage(err, "Error al eliminar el préstamo"));
        } finally {
            setSaving(false);
        }
    };

    const verHistorialCarrito = (carritoId) => {
        setFiltroCarritoId(String(carritoId));
        setActiveTab("prestamos");
    };

    const condoFilter = (
        <select
            className="form-select form-select-sm"
            style={{ width: "200px" }}
            value={filtroCondominioId}
            onChange={(e) => setFiltroCondominioId(e.target.value)}
        >
            <option value="">Todos los condominios</option>
            {condominios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
        </select>
    );

    const carritoFilter = (
        <select
            className="form-select form-select-sm"
            style={{ width: "200px" }}
            value={filtroCarritoId}
            onChange={(e) => setFiltroCarritoId(e.target.value)}
        >
            <option value="">Todos los carritos</option>
            {carritosTodos.map((c) => (
                <option key={c.id} value={c.id}>{c.codigo}</option>
            ))}
        </select>
    );

    const carritoRows = carritosPagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{carritosPagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.codigo}</td>
            <td className="px-4 py-3">{item.descripcion || "—"}</td>
            <td className="px-4 py-3">{item.condominioNombre || "—"}</td>
            <td className="px-4 py-3"><EstadoCarritoBadge estado={item.estado} /></td>
            <td className="text-nowrap px-4 py-3">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-success me-1"
                    title="Prestar"
                    onClick={() => openPrestamoCreate(item.id)}
                    disabled={saving || item.estado !== "DISPONIBLE"}
                >
                    <i className="bi bi-box-arrow-right" />
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary me-1"
                    title="Historial"
                    onClick={() => verHistorialCarrito(item.id)}
                    disabled={saving}
                >
                    <i className="bi bi-clock-history" />
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-1"
                    title="Editar"
                    onClick={() => openCarritoEdit(item)}
                    disabled={saving}
                >
                    <i className="bi bi-pencil" />
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Eliminar"
                    onClick={() => deleteCarrito(item)}
                    disabled={saving}
                >
                    <i className="bi bi-trash" />
                </button>
            </td>
        </tr>
    ));

    const prestamoRows = prestamosPagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{prestamosPagination.rowIndex(index)}</td>
            <td className="px-4 py-3 fw-semibold">{item.codigoCarrito}</td>
            <td className="px-4 py-3">{item.usuarioNombre}</td>
            <td className="px-4 py-3">{formatDateTime(item.fechaPrestamo)}</td>
            <td className="px-4 py-3">{formatDateTime(item.fechaDevolucion)}</td>
            <td className="px-4 py-3"><EstadoPrestamoBadge estado={item.estado} /></td>
            <td className="text-nowrap px-4 py-3">
                {item.estado === "ACTIVO" && (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-success me-1"
                        onClick={() => devolverPrestamo(item)}
                        disabled={saving}
                    >
                        <i className="bi bi-arrow-return-left me-1" />
                        Devolver
                    </button>
                )}
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deletePrestamo(item)}
                    disabled={saving}
                    title="Eliminar"
                >
                    <i className="bi bi-trash" />
                </button>
            </td>
        </tr>
    ));

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
                        <i className="bi bi-clock-history me-1" /> Préstamos e historial
                    </button>
                </li>
            </ul>

            {activeTab === "carritos" && (
                <CrudTableCard
                    title="Listado de Carritos"
                    filter={condoFilter}
                    onAdd={openCarritoCreate}
                    addLabel="Agregar Carrito"
                    filtering={filtering}
                    saving={saving}
                    columns={CARRITO_COLUMNS}
                    colSpan={CARRITO_COLUMNS.length}
                    emptyMessage="No hay carritos registrados"
                    rows={carritoRows}
                    pagination={carritosPagination}
                />
            )}

            {activeTab === "prestamos" && (
                <CrudTableCard
                    title="Historial de Préstamos"
                    filter={carritoFilter}
                    onAdd={() => openPrestamoCreate()}
                    addLabel="Registrar Préstamo"
                    filtering={filtering}
                    saving={saving}
                    columns={PRESTAMO_COLUMNS}
                    colSpan={PRESTAMO_COLUMNS.length}
                    emptyMessage="No hay préstamos registrados"
                    rows={prestamoRows}
                    pagination={prestamosPagination}
                />
            )}

            <CrudModal
                show={showCarritoModal}
                title={carritoEditMode ? "Editar Carrito" : "Agregar Carrito"}
                error={carritoModalError}
                saving={saving}
                onClose={() => setShowCarritoModal(false)}
                onSave={saveCarrito}
                editMode={carritoEditMode}
            >
                <FormField label="Código" required>
                    <input
                        type="text"
                        className="form-control"
                        value={carritoForm.codigo}
                        onChange={(e) => setCarritoForm({ ...carritoForm, codigo: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Descripción">
                    <input
                        type="text"
                        className="form-control"
                        value={carritoForm.descripcion}
                        onChange={(e) => setCarritoForm({ ...carritoForm, descripcion: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Condominio" required>
                    <select
                        className="form-select"
                        value={carritoForm.condominioId}
                        onChange={(e) => setCarritoForm({ ...carritoForm, condominioId: e.target.value })}
                        disabled={saving}
                    >
                        <option value="">Selecciona un condominio</option>
                        {condominios.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Estado" required>
                    <select
                        className="form-select"
                        value={carritoForm.estado}
                        onChange={(e) => setCarritoForm({ ...carritoForm, estado: e.target.value })}
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
                onClose={() => setShowPrestamoModal(false)}
                onSave={savePrestamo}
                editMode={false}
            >
                <FormField label="Carrito" required>
                    <select
                        className="form-select"
                        value={prestamoForm.carritoId}
                        onChange={(e) => setPrestamoForm({ ...prestamoForm, carritoId: e.target.value })}
                        disabled={saving}
                    >
                        <option value="">Selecciona un carrito</option>
                        {carritosDisponibles.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.codigo} — {c.condominioNombre}
                            </option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Usuario" required>
                    <select
                        className="form-select"
                        value={prestamoForm.usuarioId}
                        onChange={(e) => setPrestamoForm({ ...prestamoForm, usuarioId: e.target.value })}
                        disabled={saving}
                    >
                        <option value="">Selecciona un usuario</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.nombres} {u.apellidos}
                            </option>
                        ))}
                    </select>
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default CarritosPage;
