import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { condominioResumenService } from "../../services/condominioResumenService";
import { getApiErrorMessage } from "../../services/api";
import CrudPageLayout from "./crud/CrudPageLayout";
import CondominioFormModal from "./CondominioFormModal";
import { useModulePermissions } from "../../hooks/useModulePermissions";
import { colorForName, initialsForName } from "../../utils/condominioVisual";
import { imageForCondominio } from "../../utils/condominioImages";

const StatItem = ({ icon, label, value, color }) => (
    <div className="cond-stat">
        <span className="cond-stat-chip" style={{ background: `${color}1f`, color }}>
            <i className={`bi ${icon}`} />
        </span>
        <div className="lh-1">
            <div className="cond-stat-value">{value}</div>
            <small className="text-muted">{label}</small>
        </div>
    </div>
);

const CondominioCard = ({ condominio, onOpen }) => {
    const s = condominio.stats;
    const open = () => onOpen(condominio.id);
    return (
        <div
            className="card cond-card h-100"
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                }
            }}
        >
            <div
                className="cond-card-banner"
                style={{ backgroundImage: `url(${imageForCondominio(condominio.id, condominio.nombre)})` }}
            >
                <i className="bi bi-arrow-right-circle-fill cond-card-go" />
                <span
                    className="cond-card-badge"
                    style={{ background: colorForName(condominio.nombre) }}
                >
                    {initialsForName(condominio.nombre)}
                </span>
            </div>

            <div className="card-body cond-card-body">
                <h5 className="mb-1 text-truncate">{condominio.nombre}</h5>
                <small className="text-muted d-block text-truncate mb-3">
                    <i className="bi bi-geo-alt me-1" />
                    {condominio.direccion || "Sin dirección"}
                </small>

                <div className="cond-stats">
                    <StatItem icon="bi-building" label="Torres" value={s.torres} color="#5a8dee" />
                    <StatItem icon="bi-layers-fill" label="Pisos" value={s.pisos} color="#ff9f43" />
                    <StatItem icon="bi-door-open-fill" label="Apartamentos" value={s.apartamentos} color="#28c76f" />
                    <StatItem icon="bi-cart3" label="Carritos" value={s.carritos} color="#7367f0" />
                    <div className="cond-stats-footer">
                        <StatItem icon="bi-people-fill" label="Residentes" value={s.residentes} color="#00cfe8" />
                        <StatItem icon="bi-signpost-2-fill" label="Entradas" value={s.entradas} color="#ea5455" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CondominiosPage = () => {
    const navigate = useNavigate();
    const { canCreate } = useModulePermissions("CONDOMINIOS");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const load = async (force = false) => {
        const data = await condominioResumenService.getResumen({ force });
        setItems(data);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await load();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar condominios"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (c) =>
                (c.nombre || "").toLowerCase().includes(q) ||
                (c.direccion || "").toLowerCase().includes(q),
        );
    }, [items, search]);

    const handleSaved = async () => {
        setShowModal(false);
        condominioResumenService.invalidate();
        try {
            await load(true);
        } catch (err) {
            setPageError(getApiErrorMessage(err, "Error al recargar condominios"));
        }
    };

    return (
        <CrudPageLayout
            loading={loading}
            title="Gestión de Condominios"
            subtitle="Selecciona un condominio para ver todo su detalle"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <input
                    type="search"
                    className="form-control"
                    style={{ maxWidth: "320px" }}
                    placeholder="Buscar por nombre o dirección..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {canCreate && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-1" /> Agregar Condominio
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center text-muted py-5">
                    {search.trim()
                        ? "No hay resultados para la búsqueda"
                        : "No hay condominios registrados"}
                </div>
            ) : (
                <div className="row g-3">
                    {filtered.map((c) => (
                        <div className="col-12 col-md-6 col-xl-4" key={c.id}>
                            <CondominioCard condominio={c} onOpen={(id) => navigate(`/condominios/${id}`)} />
                        </div>
                    ))}
                </div>
            )}

            <CondominioFormModal
                show={showModal}
                editMode={false}
                onClose={() => setShowModal(false)}
                onSaved={handleSaved}
            />
        </CrudPageLayout>
    );
};

export default CondominiosPage;
