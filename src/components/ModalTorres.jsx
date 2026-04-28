import React, { useState, useEffect, useMemo } from "react";
import "./ModalTorres.css";

// --- Sub-componente: TorreCard Simplificada ---
const TorreCard = ({ nombre, estado, pisos, apartamentos }) => {
    return (
        <div className="card h-100 torre-card position-relative shadow-sm border-0">
            <div className="card-body p-4 d-flex flex-column">
                <div className="mb-4">
                    <h5 className="fw-bold mb-1 text-body">{nombre}</h5>
                    <span className={`badge rounded-pill state-badge bg-opacity-10 text-${estado === 'Operativa' ? 'success' : estado === 'Mantenimiento' ? 'warning' : 'secondary'} bg-${estado === 'Operativa' ? 'success' : estado === 'Mantenimiento' ? 'warning' : 'secondary'}`}>
                        {estado}
                    </span>
                </div>
                
                {/* Información de Pisos y Aptos alineada en columnas */}
                <div className="row g-3 mb-4 mt-auto">
                    <div className="col-6">
                        <div className="info-box">
                            <div className="info-label">Pisos</div>
                            <div className="info-value">{pisos}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="info-box">
                            <div className="info-label">Aptos</div>
                            <div className="info-value">{apartamentos}</div>
                        </div>
                    </div>
                </div>

                {/* Botón Primario Azul Marca */}
                <button className="btn btn-brand w-100 mt-2">
                    Gestionar Torre
                </button>
            </div>
        </div>
    );
};

// --- Sub-componente: Stat Card ---
const StatCard = ({ title, value, icon, color }) => (
    <div className="card border-0 shadow-sm h-100 torre-card">
        <div className="card-body d-flex align-items-center p-3">
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3 text-${color}`}>
                <i className={`bi ${icon} fs-4`}></i>
            </div>
            <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-bold ls-1">{title}</h6>
                <h3 className="fw-bold mb-0 text-body">{value}</h3>
            </div>
        </div>
    </div>
);

// --- Componente Principal ---
const ModalTorres = () => {
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("Todas");
    const [searchTerm, setSearchTerm] = useState("");
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    
    // Datos Mockeados
    const [torres] = useState([
        { id: 1, nombre: "Torre A", estado: "Operativa", pisos: 15, apartamentos: 60, condominio: "Residencial Las Palmas" },
        { id: 2, nombre: "Torre B", estado: "Mantenimiento", pisos: 12, apartamentos: 48, condominio: "Residencial Las Palmas" },
        { id: 3, nombre: "Torre Norte", estado: "Operativa", pisos: 20, apartamentos: 80, condominio: "Condominio El Bosque" },
        { id: 4, nombre: "Torre Sur", estado: "Inactiva", pisos: 10, apartamentos: 40, condominio: "Condominio El Bosque" },
        { id: 5, nombre: "Torre C", estado: "Operativa", pisos: 18, apartamentos: 72, condominio: "Residencial Las Palmas" },
        { id: 6, nombre: "Torre Este", estado: "Operativa", pisos: 22, apartamentos: 88, condominio: "Condominio El Bosque" }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredTorres = useMemo(() => {
        return torres.filter(t => {
            const matchesStatus = filterStatus === "Todas" || t.estado === filterStatus;
            const matchesSearch = t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || t.condominio.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [torres, filterStatus, searchTerm]);

    const groupedTorres = useMemo(() => {
        const groups = {};
        filteredTorres.forEach(t => {
            if (!groups[t.condominio]) groups[t.condominio] = [];
            groups[t.condominio].push(t);
        });
        return groups;
    }, [filteredTorres]);

    const metrics = useMemo(() => {
        return {
            total: torres.length,
            operativas: torres.filter(t => t.estado === "Operativa").length,
            apartamentos: torres.reduce((acc, t) => acc + t.apartamentos, 0)
        };
    }, [torres]);

    return (
        <div className="container-fluid py-4 torre-container">
            {/* --- MÉTRICAS GLOBALES --- */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <StatCard title="Total Torres" value={metrics.total} icon="bi-buildings" color="primary" />
                </div>
                <div className="col-12 col-md-4">
                    <StatCard title="Operativas" value={metrics.operativas} icon="bi-check-circle" color="success" />
                </div>
                <div className="col-12 col-md-4">
                    <StatCard title="Total Apartamentos" value={metrics.apartamentos} icon="bi-house-fill" color="warning" />
                </div>
            </div>

            {/* --- FILTROS --- */}
            <div className="card border-0 shadow-sm mb-4 torre-card">
                <div className="card-body p-3">
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0 border-theme">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0 border-theme bg-transparent text-body" 
                                    placeholder="Buscar torre o condominio..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-5">
                            <div className="btn-group w-100 p-1 bg-theme-body rounded-pill border-theme">
                                {["Todas", "Operativa", "Mantenimiento"].map(s => (
                                    <button 
                                        key={s}
                                        className={`btn btn-sm rounded-pill border-0 py-2 ${filterStatus === s ? 'btn-brand shadow-primary' : 'text-muted bg-transparent'}`}
                                        onClick={() => setFilterStatus(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-12 col-md-3 text-md-end">
                            <button className="btn btn-brand px-4" onClick={() => setShowOffcanvas(true)}>
                                <i className="bi bi-plus-lg me-2"></i>Nueva Torre
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRID DE TORRES AGRUPADAS --- */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="accordion d-flex flex-column gap-3" id="torresAccordion">
                    {Object.entries(groupedTorres).map(([condominio, lista], idx) => (
                        <div className="accordion-item border-0 shadow-sm rounded-4 overflow-hidden" key={condominio}>
                            <h2 className="accordion-header">
                                <button className="accordion-button px-4 py-3 fw-bold fs-5" type="button" data-bs-toggle="collapse" data-bs-target={`#condo-${idx}`}>
                                    <i className="bi bi-building-fill text-brand me-3"></i>
                                    {condominio}
                                    <span className="badge bg-theme-body text-muted ms-3 fs-6 fw-normal">{lista.length} Torres</span>
                                </button>
                            </h2>
                            <div id={`condo-${idx}`} className="accordion-collapse collapse show" data-bs-parent="#torresAccordion">
                                <div className="accordion-body p-4">
                                    <div className="row g-4">
                                        {lista.map(t => (
                                            <div key={t.id} className="col-12 col-md-6 col-lg-4">
                                                <TorreCard {...t} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- OFFCANVAS REGISTRO --- */}
            <div className={`offcanvas offcanvas-end bg-theme-body ${showOffcanvas ? 'show' : ''}`} style={{ visibility: showOffcanvas ? 'visible' : 'hidden', width: '400px' }}>
                <div className="offcanvas-header border-bottom border-theme">
                    <h5 className="fw-bold mb-0">Registrar Nueva Torre</h5>
                    <button type="button" className="btn-close" onClick={() => setShowOffcanvas(false)}></button>
                </div>
                <div className="offcanvas-body p-4">
                    <form>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Nombre de la Torre</label>
                            <input type="text" className="form-control info-box text-start bg-transparent" placeholder="Ej: Torre Alpha" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Condominio</label>
                            <select className="form-select info-box text-start bg-transparent">
                                <option>Residencial Las Palmas</option>
                                <option>Condominio El Bosque</option>
                            </select>
                        </div>
                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">Pisos</label>
                                <input type="number" className="form-control info-box bg-transparent" placeholder="0" />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">Apartamentos</label>
                                <input type="number" className="form-control info-box bg-transparent" placeholder="0" />
                            </div>
                        </div>
                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-brand py-3">Guardar Registro</button>
                            <button type="button" className="btn btn-light rounded-3 py-3 fw-bold" onClick={() => setShowOffcanvas(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
            {showOffcanvas && <div className="offcanvas-backdrop fade show" onClick={() => setShowOffcanvas(false)}></div>}
        </div>
    );
};

export default ModalTorres;
