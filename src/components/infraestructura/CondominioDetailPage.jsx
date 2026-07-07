import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { condominioResumenService } from "../../services/condominioResumenService";
import { entradaService } from "../../services/entradaService";
import { getApiErrorMessage } from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/swalHelpers";
import CrudPageLayout from "./crud/CrudPageLayout";
import CrudPagination from "./crud/CrudPagination";
import CondominioFormModal from "./CondominioFormModal";
import EntradaFormModal from "./EntradaFormModal";
import TorreFormModal from "./TorreFormModal";
import CarritoFormModal from "./CarritoFormModal";
import { useModulePermissions } from "../../hooks/useModulePermissions";
import { usePagination } from "../../hooks/usePagination";
import { initialsForName } from "../../utils/condominioVisual";
import { imageForCondominio } from "../../utils/condominioImages";

const MAX_ENTRADAS = 2;

const CARRITO_BADGE = {
    DISPONIBLE: "bg-success",
    PRESTADO: "bg-primary",
    OCUPADO: "bg-primary",
    MANTENIMIENTO: "bg-warning text-dark",
    INACTIVO: "bg-secondary",
};

const EstadoBadge = ({ estado, map = CARRITO_BADGE }) => (
    <span className={`badge ${map[estado] || "bg-secondary"}`}>{estado || "—"}</span>
);

const StatCard = ({ icon, label, value, color, hint }) => (
    <div className="card cond-statcard h-100 shadow-sm">
        <div className="card-body d-flex align-items-center gap-3">
            <span className="cond-stat-chip cond-stat-chip--lg" style={{ background: `${color}1f`, color }}>
                <i className={`bi ${icon}`} />
            </span>
            <div className="lh-1">
                <div className="cond-statcard-value">{value}</div>
                <small className="text-muted">{label}</small>
                {hint && <div className="cond-statcard-hint">{hint}</div>}
            </div>
        </div>
    </div>
);

const SectionCard = ({ title, icon, count, action, children }) => (
    <div className="card cond-section shadow-sm">
        <div className="card-header d-flex align-items-center justify-content-between bg-transparent">
            <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0">
                    <i className={`bi ${icon} me-2 text-primary`} />
                    {title}
                </h5>
                {count != null && <span className="badge bg-light text-dark rounded-pill">{count}</span>}
            </div>
            {action}
        </div>
        <div className="card-body p-0">{children}</div>
    </div>
);

const EmptyRow = ({ colSpan, icon, message }) => (
    <tr>
        <td colSpan={colSpan}>
            <div className="cond-empty">
                <i className={`bi ${icon}`} />
                {message}
            </div>
        </td>
    </tr>
);

const CondominioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canEdit } = useModulePermissions("CONDOMINIOS");
    const entradaPerms = useModulePermissions("ENTRADAS");
    const torrePerms = useModulePermissions("TORRES");
    const carritoPerms = useModulePermissions("CARRITOS");

    const [data, setData] = useState(null);
    const [entradas, setEntradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [showEntradaModal, setShowEntradaModal] = useState(false);
    const [showTorreModal, setShowTorreModal] = useState(false);
    const [showCarritoModal, setShowCarritoModal] = useState(false);
    const [entradaEdit, setEntradaEdit] = useState(null);
    const [entradaBusy, setEntradaBusy] = useState(false);

    const load = useCallback(
        async (force = false) => {
            const [detalle, entradasList] = await Promise.all([
                condominioResumenService.getDetalle(id, { force }),
                entradaService.getAll(id).catch(() => []),
            ]);
            if (!detalle.condominio) {
                throw new Error("Condominio no encontrado");
            }
            setData(detalle);
            setEntradas(entradasList);
        },
        [id],
    );

    const reloadEntradas = async () => {
        try {
            setEntradas(await entradaService.getAll(id));
        } catch (err) {
            setPageError(getApiErrorMessage(err, "Error al recargar entradas"));
        }
    };

    const openCreateEntrada = () => {
        setEntradaEdit(null);
        setShowEntradaModal(true);
    };

    const openEditEntrada = (entrada) => {
        setEntradaEdit(entrada);
        setShowEntradaModal(true);
    };

    const handleEntradaSaved = async () => {
        setShowEntradaModal(false);
        await reloadEntradas();
    };

    const handleDeleteEntrada = async (entrada) => {
        const ok = await confirmAction({
            title: "¿Eliminar esta entrada?",
            text: entrada.nombre ? `"${entrada.nombre}"` : "",
            confirmText: "Sí, eliminar",
            icon: "warning",
        });
        if (!ok) return;
        setEntradaBusy(true);
        try {
            await entradaService.delete(entrada.id);
            await showSuccess("Entrada eliminada correctamente.");
            await reloadEntradas();
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al eliminar la entrada");
            setPageError(msg);
            await showError(msg);
        } finally {
            setEntradaBusy(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                setLoading(true);
                await load();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "No se pudo cargar el condominio"));
            } finally {
                setLoading(false);
            }
        })();
    }, [load]);

    const handleSaved = async () => {
        setShowEdit(false);
        condominioResumenService.invalidate();
        try {
            await load(true);
        } catch (err) {
            setPageError(getApiErrorMessage(err, "Error al recargar"));
        }
    };

    // Paginadores (antes de los early-returns por las reglas de hooks).
    // Las listas largas (torres, carritos, residentes) se muestran de a 10.
    const torresPag = usePagination(data?.torres ?? []);
    const carritosPag = usePagination(data?.carritos ?? []);
    const residentesPag = usePagination(data?.residentes ?? []);

    if (loading) {
        return (
            <CrudPageLayout loading title="Detalle de Condominio" subtitle="" />
        );
    }

    if (!data?.condominio) {
        return (
            <CrudPageLayout
                title="Detalle de Condominio"
                subtitle=""
                pageError={pageError || "Condominio no encontrado"}
                onDismissError={() => navigate("/condominios")}
            >
                <button className="btn btn-secondary" onClick={() => navigate("/condominios")}>
                    <i className="bi bi-arrow-left me-1" /> Volver a condominios
                </button>
            </CrudPageLayout>
        );
    }

    const { condominio, stats, torres, residentes, carritos } = data;

    return (
        <CrudPageLayout
            title="Detalle de Condominio"
            subtitle="Resumen completo: torres, pisos, apartamentos, residentes y carritos"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <button className="btn btn-link text-decoration-none px-0 mb-3" onClick={() => navigate("/condominios")}>
                <i className="bi bi-arrow-left me-1" /> Volver a condominios
            </button>

            {/* Cabecera */}
            <div
                className="card cond-detail-header shadow-sm mb-4"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(20,28,55,0.82), rgba(20,28,55,0.45)), url(${imageForCondominio(condominio.id, condominio.nombre)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="card-body d-flex flex-wrap align-items-center gap-3">
                    <span
                        className="cond-avatar"
                        style={{ background: "rgba(255,255,255,0.25)", width: 64, height: 64, fontSize: "1.4rem" }}
                    >
                        {initialsForName(condominio.nombre)}
                    </span>
                    <div className="grow">
                        <h3 className="mb-1">{condominio.nombre}</h3>
                        <div className="small d-flex flex-wrap gap-3">
                            <span><i className="bi bi-geo-alt me-1" />{condominio.direccion || "Sin dirección"}</span>
                            <span><i className="bi bi-telephone me-1" />{condominio.telefono || "—"}</span>
                            <span><i className="bi bi-envelope me-1" />{condominio.email || "—"}</span>
                        </div>
                    </div>
                    {canEdit && (
                        <button className="btn btn-light fw-semibold" onClick={() => setShowEdit(true)}>
                            <i className="bi bi-pencil me-1" /> Editar
                        </button>
                    )}
                </div>
            </div>

            {/* Estadísticas */}
            <div className="cond-statgrid mb-4">
                <StatCard icon="bi-building" label="Torres" value={stats.torres} color="#5a8dee" />
                <StatCard icon="bi-layers-fill" label="Pisos" value={stats.pisos} color="#ff9f43" />
                <StatCard icon="bi-door-open-fill" label="Apartamentos" value={stats.apartamentos} color="#28c76f" />
                <StatCard icon="bi-people-fill" label="Residentes" value={stats.residentes} color="#00cfe8" />
                <StatCard
                    icon="bi-cart3"
                    label="Carritos"
                    value={stats.carritos}
                    color="#7367f0"
                    hint={`${stats.carritosDisponibles} disp. · ${stats.carritosPrestados} prestados`}
                />
                <StatCard icon="bi-signpost-2-fill" label="Entradas" value={entradas.length} color="#ea5455" />
            </div>

            {/* Entradas (puestos de carrito) */}
            <div className="card cond-section shadow-sm mb-4">
                <div className="card-header d-flex align-items-center justify-content-between bg-transparent">
                    <h5 className="mb-0">
                        <i className="bi bi-signpost-2-fill me-2 text-primary" />
                        Entradas
                        <span className="text-muted ms-2" style={{ fontSize: ".8rem", fontWeight: 400 }}>
                            (máx. {MAX_ENTRADAS})
                        </span>
                    </h5>
                    {entradaPerms.canCreate && (
                        <button
                            className="btn btn-sm btn-primary"
                            disabled={entradas.length >= MAX_ENTRADAS || entradaBusy}
                            onClick={openCreateEntrada}
                            title={entradas.length >= MAX_ENTRADAS ? "Máximo 2 entradas por condominio" : ""}
                        >
                            <i className="bi bi-plus-lg me-1" /> Agregar entrada
                        </button>
                    )}
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle cond-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Entrada</th>
                                    <th>Puesto de carritos</th>
                                    <th className="pe-4 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entradas.length === 0 ? (
                                    <EmptyRow colSpan={3} icon="bi-signpost-2" message="Sin entradas registradas" />
                                ) : (
                                    entradas.map((e) => (
                                        <tr key={e.id}>
                                            <td className="ps-4 fw-semibold">
                                                <i className="bi bi-door-open me-2 text-primary" />
                                                {e.nombre}
                                            </td>
                                            <td>
                                                {e.capacidadCarritos != null
                                                    ? `${e.capacidadCarritos} carritos`
                                                    : "—"}
                                            </td>
                                            <td className="pe-4 text-end">
                                                {entradaPerms.canEdit && (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        disabled={entradaBusy}
                                                        onClick={() => openEditEntrada(e)}
                                                        title="Editar"
                                                    >
                                                        <i className="bi bi-pencil" />
                                                    </button>
                                                )}
                                                {entradaPerms.canDelete && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        disabled={entradaBusy}
                                                        onClick={() => handleDeleteEntrada(e)}
                                                        title="Eliminar"
                                                    >
                                                        <i className="bi bi-trash" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                {/* Torres */}
                <div className="col-12 col-xl-6">
                    <SectionCard title="Torres" icon="bi-building" count={torres.length}>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle cond-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Torre</th>
                                        <th>Pisos</th>
                                        <th className="pe-4">Apartamentos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {torres.length === 0 ? (
                                        <EmptyRow colSpan={3} icon="bi-building" message="Sin torres registradas" />
                                    ) : (
                                        torresPag.paginatedItems.map((t) => (
                                            <tr key={t.id}>
                                                <td className="ps-4 fw-semibold">{t.nombre}</td>
                                                <td>{t.nPisos}</td>
                                                <td className="pe-4">{t.nApartamentos}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <CrudPagination
                            currentPage={torresPag.currentPage}
                            totalPages={torresPag.totalPages}
                            onPageChange={torresPag.setCurrentPage}
                            totalItems={torresPag.totalItems}
                            pageSize={torresPag.pageSize}
                        />
                    </SectionCard>
                </div>

                {/* Carritos */}
                <div className="col-12 col-xl-6">
                    <SectionCard title="Carritos" icon="bi-cart3" count={carritos.length}>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle cond-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Código</th>
                                        <th>Descripción</th>
                                        <th className="pe-4">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carritos.length === 0 ? (
                                        <EmptyRow colSpan={3} icon="bi-cart3" message="Sin carritos registrados" />
                                    ) : (
                                        carritosPag.paginatedItems.map((c) => (
                                            <tr key={c.id}>
                                                <td className="ps-4 fw-semibold">{c.codigo || "—"}</td>
                                                <td>{c.descripcion || "—"}</td>
                                                <td className="pe-4"><EstadoBadge estado={c.estado} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <CrudPagination
                            currentPage={carritosPag.currentPage}
                            totalPages={carritosPag.totalPages}
                            onPageChange={carritosPag.setCurrentPage}
                            totalItems={carritosPag.totalItems}
                            pageSize={carritosPag.pageSize}
                        />
                    </SectionCard>
                </div>

                {/* Residentes */}
                <div className="col-12">
                    <SectionCard title="Residentes" icon="bi-people" count={residentes.length}>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle cond-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Nombre</th>
                                        <th>Email</th>
                                        <th>Apartamento</th>
                                        <th>Tipo</th>
                                        <th className="pe-4">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {residentes.length === 0 ? (
                                        <EmptyRow colSpan={5} icon="bi-people" message="Sin residentes registrados" />
                                    ) : (
                                        residentesPag.paginatedItems.map((r) => (
                                            <tr key={r.id}>
                                                <td className="ps-4 fw-semibold">
                                                    {[r.nombres, r.apellidos].filter(Boolean).join(" ") || "—"}
                                                </td>
                                                <td>{r.email || "—"}</td>
                                                <td>{r.apartamento?.numero ? `N° ${r.apartamento.numero}` : "—"}</td>
                                                <td>{r.tipoOcupante || "—"}</td>
                                                <td className="pe-4"><EstadoBadge estado={r.estado} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <CrudPagination
                            currentPage={residentesPag.currentPage}
                            totalPages={residentesPag.totalPages}
                            onPageChange={residentesPag.setCurrentPage}
                            totalItems={residentesPag.totalItems}
                            pageSize={residentesPag.pageSize}
                        />
                    </SectionCard>
                </div>
            </div>

            <CondominioFormModal
                show={showEdit}
                editMode
                target={condominio}
                onClose={() => setShowEdit(false)}
                onSaved={handleSaved}
            />

            <EntradaFormModal
                show={showEntradaModal}
                editMode={!!entradaEdit}
                target={entradaEdit}
                condominioId={condominio.id}
                onClose={() => setShowEntradaModal(false)}
                onSaved={handleEntradaSaved}
            />
        </CrudPageLayout>
    );
};

export default CondominioDetailPage;
