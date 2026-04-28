import React, { useState, useEffect, useMemo } from "react";
import "./ModalTorres.css";

// --- UI Components ---
const TorreCard = ({ torre, onManage }) => (
    <div className="card h-100 torre-card border-0 shadow-sm position-relative transition-all">
        <div className="card-body p-4 d-flex flex-column">
            <div className="mb-4">
                <h5 className="fw-bold mb-1">{torre.nombre}</h5>
                <span className={`badge rounded-pill state-badge bg-opacity-10 text-${torre.estado === 'Operativa' ? 'success' : torre.estado === 'Mantenimiento' ? 'warning' : 'secondary'} bg-${torre.estado === 'Operativa' ? 'success' : torre.estado === 'Mantenimiento' ? 'warning' : 'secondary'}`}>
                    {torre.estado}
                </span>
            </div>
            <div className="row g-2 mb-4 mt-auto">
                {[["Pisos", torre.pisos], ["Aptos", torre.apartamentos]].map(([label, val]) => (
                    <div className="col-6" key={label}>
                        <div className="info-box py-2">
                            <div className="info-label">{label}</div>
                            <div className="info-value fs-5">{val}</div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="btn btn-brand w-100 fw-bold py-2" onClick={() => onManage(torre)}>
                Gestionar
            </button>
        </div>
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="card border-0 shadow-sm torre-card p-3 h-100">
        <div className="d-flex align-items-center">
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3 text-${color}`}>
                <i className={`bi ${icon} fs-4`}></i>
            </div>
            <div>
                <small className="text-muted fw-bold text-uppercase ls-1">{title}</small>
                <h4 className="fw-bold mb-0 text-body">{value}</h4>
            </div>
        </div>
    </div>
);

// --- Main Module ---
const ModalTorres = () => {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Todas");
    const [search, setSearch] = useState("");
    const [showDrawer, setShowDrawer] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State para datos
    const [torres, setTorres] = useState([
        { id: 1, nombre: "Torre A", estado: "Operativa", pisos: 15, apartamentos: 60, condominio: "Residencial Las Palmas" },
        { id: 2, nombre: "Torre B", estado: "Mantenimiento", pisos: 12, apartamentos: 48, condominio: "Residencial Las Palmas" },
        { id: 3, nombre: "Torre Norte", estado: "Operativa", pisos: 20, apartamentos: 80, condominio: "Condominio El Bosque" },
        { id: 4, nombre: "Torre Sur", estado: "Inactiva", pisos: 10, apartamentos: 40, condominio: "Condominio El Bosque" },
        { id: 5, nombre: "Torre C", estado: "Operativa", pisos: 18, apartamentos: 72, condominio: "Residencial Las Palmas" },
        { id: 6, nombre: "Torre Este", estado: "Operativa", pisos: 22, apartamentos: 88, condominio: "Condominio El Bosque" }
    ]);

    // State para el formulario
    const [formData, setFormData] = useState({
        id: null,
        nombre: "",
        condominio: "Residencial Las Palmas",
        pisos: "",
        apartamentos: "",
        estado: "Operativa"
    });

    useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

    // Handlers
    const handleOpenAdd = () => {
        setFormData({ id: null, nombre: "", condominio: "Residencial Las Palmas", pisos: "", apartamentos: "", estado: "Operativa" });
        setIsEditing(false);
        setShowDrawer(true);
    };

    const handleManage = (torre) => {
        setFormData({ ...torre });
        setIsEditing(true);
        setShowDrawer(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (isEditing) {
            setTorres(torres.map(t => t.id === formData.id ? formData : t));
        } else {
            const newTorre = { ...formData, id: Date.now() };
            setTorres([...torres, newTorre]);
        }
        setShowDrawer(false);
    };

    const handleDelete = () => {
        if (window.confirm("¿Estás seguro de eliminar esta torre?")) {
            setTorres(torres.filter(t => t.id !== formData.id));
            setShowDrawer(false);
        }
    };

    const grouped = useMemo(() => {
        const res = {};
        torres.filter(t => (filter === "Todas" || t.estado === filter) && 
            (t.nombre.toLowerCase().includes(search.toLowerCase()) || t.condominio.toLowerCase().includes(search.toLowerCase()))
        ).forEach(t => {
            if (!res[t.condominio]) res[t.condominio] = [];
            res[t.condominio].push(t);
        });
        return res;
    }, [torres, filter, search]);

    const metrics = useMemo(() => ({
        total: torres.length,
        operativas: torres.filter(t => t.estado === "Operativa").length,
        apartamentos: torres.reduce((a, t) => a + Number(t.apartamentos), 0)
    }), [torres]);

    return (
        <div className="container-fluid py-4 torre-container">
            {/* Metrics */}
            <div className="row g-3 mb-4">
                {[
                    ["Total Torres", metrics.total, "bi-buildings", "primary"],
                    ["Operativas", metrics.operativas, "bi-check-circle", "success"],
                    ["Apartamentos", metrics.apartamentos, "bi-house-fill", "warning"]
                ].map(([t, v, i, c]) => (
                    <div className="col-12 col-md-4" key={t}><StatCard title={t} value={v} icon={i} color={c} /></div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="card border-0 shadow-sm mb-4 torre-card p-3">
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <div className="input-group border-theme rounded-pill overflow-hidden">
                            <span className="input-group-text bg-transparent border-0 pe-0"><i className="bi bi-search text-muted"></i></span>
                            <input type="text" className="form-control border-0 bg-transparent text-body" placeholder="Buscar..." onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="btn-group w-100 p-1 bg-theme-body rounded-pill border-theme">
                            {["Todas", "Operativa", "Mantenimiento"].map(s => (
                                <button key={s} className={`btn btn-sm rounded-pill border-0 py-2 transition-all ${filter === s ? 'btn-brand shadow-primary' : 'text-muted'}`} onClick={() => setFilter(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-3 text-end">
                        <button className="btn btn-brand px-4 py-2" onClick={handleOpenAdd}><i className="bi bi-plus-lg me-2"></i>Nueva</button>
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : 
                <div className="accordion d-flex flex-column gap-3">
                    {Object.entries(grouped).map(([condo, list], i) => (
                        <div className="accordion-item border-0 shadow-sm rounded-4 overflow-hidden" key={condo}>
                            <h2 className="accordion-header">
                                <button className="accordion-button px-4 py-3 fw-bold fs-5" data-bs-toggle="collapse" data-bs-target={`#c-${i}`}>
                                    <i className="bi bi-building-fill text-brand me-3"></i>{condo}
                                    <span className="badge bg-theme-body text-muted ms-3 fw-normal">{list.length} Torres</span>
                                </button>
                            </h2>
                            <div id={`c-${i}`} className="accordion-collapse collapse show">
                                <div className="accordion-body p-4"><div className="row g-4">{list.map(t => <div className="col-md-6 col-lg-4" key={t.id}><TorreCard torre={t} onManage={handleManage} /></div>)}</div></div>
                            </div>
                        </div>
                    ))}
                </div>
            }

            {/* Drawer (Add / Edit) */}
            <div className={`offcanvas offcanvas-end bg-theme-body border-start border-theme ${showDrawer ? 'show' : ''}`} style={{ width: '400px', visibility: showDrawer ? 'visible' : 'hidden' }}>
                <div className="offcanvas-header border-bottom border-theme">
                    <h5 className="fw-bold mb-0 text-body">{isEditing ? 'Gestionar Torre' : 'Nueva Torre'}</h5>
                    <button className="btn-close" onClick={() => setShowDrawer(false)}></button>
                </div>
                <div className="offcanvas-body p-4">
                    <form className="d-flex flex-column h-100" onSubmit={handleSave}>
                        <div className="mb-3">
                            <label className="small fw-bold text-muted text-uppercase">Nombre</label>
                            <input className="form-control info-box text-start bg-transparent text-body" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Torre Alpha" required />
                        </div>
                        <div className="mb-3">
                            <label className="small fw-bold text-muted text-uppercase">Condominio</label>
                            <select className="form-select info-box bg-transparent text-body" value={formData.condominio} onChange={e => setFormData({...formData, condominio: e.target.value})}>
                                <option>Residencial Las Palmas</option>
                                <option>Condominio El Bosque</option>
                            </select>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="small fw-bold text-muted text-uppercase">Pisos</label>
                                <input type="number" className="form-control info-box bg-transparent text-body" value={formData.pisos} onChange={e => setFormData({...formData, pisos: e.target.value})} required />
                            </div>
                            <div className="col-6">
                                <label className="small fw-bold text-muted text-uppercase">Aptos</label>
                                <input type="number" className="form-control info-box bg-transparent text-body" value={formData.apartamentos} onChange={e => setFormData({...formData, apartamentos: e.target.value})} required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="small fw-bold text-muted text-uppercase">Estado</label>
                            <div className="d-flex gap-2 mt-1">
                                {["Operativa", "Mantenimiento", "Inactiva"].map(s => (
                                    <button type="button" key={s} className={`btn btn-sm rounded-pill border-theme flex-grow-1 ${formData.estado === s ? 'btn-brand' : 'text-muted bg-transparent'}`} onClick={() => setFormData({...formData, estado: s})}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-auto d-grid gap-2">
                            <button type="submit" className="btn btn-brand py-3">{isEditing ? 'Actualizar Cambios' : 'Guardar Torre'}</button>
                            {isEditing && <button type="button" className="btn btn-outline-danger py-3 fw-bold rounded-3" onClick={handleDelete}><i className="bi bi-trash me-2"></i>Eliminar Torre</button>}
                            <button className="btn btn-light py-3 fw-bold rounded-3" type="button" onClick={() => setShowDrawer(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
            {showDrawer && <div className="offcanvas-backdrop fade show" onClick={() => setShowDrawer(false)}></div>}
        </div>
    );
};

export default ModalTorres;
