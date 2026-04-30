import React, { useState, useEffect, useMemo } from "react";
import "./ModalTorres.css";

// --- UI Components ---
const TorreCard = ({ torre, onManage }) => (
    <div className="card h-100 torre-card border-0 shadow-sm transition-all">
        <div className="card-body p-4 d-flex flex-column">
            <div className="mb-4">
                <h5 className="fw-bold mb-1">{torre.nombre}</h5>
                <span className={`badge rounded-pill state-badge bg-opacity-10 text-${torre.estado === 'Operativa' ? 'success' : 'warning'} bg-${torre.estado === 'Operativa' ? 'success' : 'warning'}`}>
                    {torre.estado}
                </span>
            </div>
            <div className="row g-2 mb-4 mt-auto">
                {[["Pisos", torre.pisos], ["Aptos", torre.apartamentos]].map(([l, v]) => (
                    <div className="col-6" key={l}><div className="info-box py-2"><small className="info-label">{l}</small><div className="info-value fs-5">{v}</div></div></div>
                ))}
            </div>
            <button className="btn btn-brand w-100 fw-bold py-2" onClick={() => onManage(torre)}>Gestionar</button>
        </div>
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="card border-0 shadow-sm torre-card p-3 h-100"><div className="d-flex align-items-center">
        <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3 text-${color}`}><i className={`bi ${icon} fs-4`}></i></div>
        <div><small className="text-muted fw-bold text-uppercase ls-1">{title}</small><h4 className="fw-bold mb-0">{value}</h4></div>
    </div></div>
);

// --- Main Module ---
const ModalTorres = () => {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Todas");
    const [search, setSearch] = useState("");
    const [drawer, setDrawer] = useState({ open: false, edit: false });
    const [torres, setTorres] = useState([
        { id: 1, nombre: "Torre A", estado: "Operativa", pisos: 15, apartamentos: 60, condominio: "Residencial Las Palmas" },
        { id: 2, nombre: "Torre B", estado: "Mantenimiento", pisos: 12, apartamentos: 48, condominio: "Residencial Las Palmas" },
        { id: 3, nombre: "Torre Norte", estado: "Operativa", pisos: 20, apartamentos: 80, condominio: "Condominio El Bosque" },
        { id: 4, nombre: "Torre Sur", estado: "Inactiva", pisos: 10, apartamentos: 40, condominio: "Condominio El Bosque" },
        { id: 5, nombre: "Torre C", estado: "Operativa", pisos: 18, apartamentos: 72, condominio: "Residencial Las Palmas" },
        { id: 6, nombre: "Torre Este", estado: "Operativa", pisos: 22, apartamentos: 88, condominio: "Condominio El Bosque" }
    ]);
    const [form, setForm] = useState({ id: null, nombre: "", condominio: "Residencial Las Palmas", pisos: "", apartamentos: "", estado: "Operativa" });

    useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

    const filtered = useMemo(() => {
        return torres.filter(t => (filter === "Todas" || t.estado === filter) && (t.nombre + t.condominio).toLowerCase().includes(search.toLowerCase()));
    }, [torres, filter, search]);

    const grouped = useMemo(() => {
        const res = {};
        filtered.forEach(t => (res[t.condominio] = res[t.condominio] || []).push(t));
        return res;
    }, [filtered]);

    const save = (e) => {
        e.preventDefault();
        setTorres(drawer.edit ? torres.map(t => t.id === form.id ? form : t) : [...torres, { ...form, id: Date.now() }]);
        setDrawer({ open: false, edit: false });
    };

    return (
        <div className="container-fluid py-4 torre-container">
            <div className="row g-3 mb-4">
                {[["Total Torres", torres.length, "bi-buildings", "primary"], ["Operativas", torres.filter(t => t.estado === "Operativa").length, "bi-check-circle", "success"], ["Apartamentos", torres.reduce((a, t) => a + +t.apartamentos, 0), "bi-house-fill", "warning"]].map(([t, v, i, c]) => (
                    <div className="col-md-4" key={t}><StatCard title={t} value={v} icon={i} color={c} /></div>
                ))}
            </div>

            <div className="card border-0 shadow-sm mb-4 torre-card p-3"><div className="row g-3 align-items-center">
                <div className="col-md-4"><div className="input-group border-theme rounded-pill overflow-hidden"><span className="input-group-text bg-transparent border-0 pe-0"><i className="bi bi-search"></i></span><input className="form-control border-0 bg-transparent" placeholder="Buscar..." onChange={e => setSearch(e.target.value)} /></div></div>
                <div className="col-md-5"><div className="btn-group w-100 p-1 bg-theme-body rounded-pill border-theme">
                    {["Todas", "Operativa", "Mantenimiento"].map(s => <button key={s} className={`btn btn-sm rounded-pill border-0 py-2 ${filter === s ? 'btn-brand shadow-primary' : 'text-muted'}`} onClick={() => setFilter(s)}>{s}</button>)}
                </div></div>
                <div className="col-md-3 text-end"><button className="btn btn-brand px-4" onClick={() => { setForm({ id: null, nombre: "", condominio: "Residencial Las Palmas", pisos: "", apartamentos: "", estado: "Operativa" }); setDrawer({ open: true, edit: false }); }}><i className="bi bi-plus-lg me-2"></i>Nueva</button></div>
            </div></div>

            {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> :
                <div className="accordion d-flex flex-column gap-3">{Object.entries(grouped).map(([condo, list], i) => (
                    <div className="accordion-item border-0 shadow-sm rounded-4 overflow-hidden" key={condo}>
                        <h2 className="accordion-header"><button className="accordion-button px-4 py-3 fw-bold fs-5" data-bs-toggle="collapse" data-bs-target={`#c-${i}`}><i className="bi bi-building-fill text-brand me-3"></i>{condo}<span className="badge bg-theme-body text-muted ms-3 fw-normal">{list.length} Torres</span></button></h2>
                        <div id={`c-${i}`} className="accordion-collapse collapse show"><div className="accordion-body p-4"><div className="row g-4">{list.map(t => <div className="col-md-6 col-lg-4" key={t.id}><TorreCard torre={t} onManage={torre => { setForm({ ...torre }); setDrawer({ open: true, edit: true }); }} /></div>)}</div></div></div>
                    </div>
                ))}</div>
            }

            <div className={`offcanvas offcanvas-end bg-theme-body border-start border-theme ${drawer.open ? 'show' : ''}`} style={{ width: '400px', visibility: drawer.open ? 'visible' : 'hidden' }}>
                <div className="offcanvas-header border-bottom border-theme"><h5 className="fw-bold mb-0">{drawer.edit ? 'Gestionar' : 'Nueva'} Torre</h5><button className="btn-close" onClick={() => setDrawer({ ...drawer, open: false })}></button></div>
                <div className="offcanvas-body p-4"><form className="d-flex flex-column h-100" onSubmit={save}>
                    <div className="mb-3"><label className="small fw-bold text-muted">NOMBRE</label><input className="form-control info-box bg-transparent" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                    <div className="mb-3"><label className="small fw-bold text-muted">CONDOMINIO</label><select className="form-select info-box bg-transparent" value={form.condominio} onChange={e => setForm({ ...form, condominio: e.target.value })}><option>Residencial Las Palmas</option><option>Condominio El Bosque</option></select></div>
                    <div className="row g-3 mb-3">{[["Pisos", "pisos"], ["Aptos", "apartamentos"]].map(([l, k]) => (
                        <div className="col-6" key={l}><label className="small fw-bold text-muted">{l.toUpperCase()}</label><input type="number" className="form-control info-box bg-transparent" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required /></div>
                    ))}</div>
                    <div className="mb-4"><label className="small fw-bold text-muted">ESTADO</label><div className="d-flex gap-2 mt-1">
                        {["Operativa", "Mantenimiento", "Inactiva"].map(s => <button type="button" key={s} className={`btn btn-sm rounded-pill border-theme flex-grow-1 ${form.estado === s ? 'btn-brand' : 'text-muted'}`} onClick={() => setForm({ ...form, estado: s })}>{s}</button>)}
                    </div></div>
                    <div className="mt-auto d-grid gap-2"><button className="btn btn-brand py-3">{drawer.edit ? 'Actualizar' : 'Guardar'}</button>
                        {drawer.edit && <button type="button" className="btn btn-outline-danger py-2 fw-bold" onClick={() => { if (confirm("¿Eliminar?")) { setTorres(torres.filter(t => t.id !== form.id)); setDrawer({ open: false, edit: false }); } }}>Eliminar</button>}
                        <button className="btn btn-light py-2" type="button" onClick={() => setDrawer({ ...drawer, open: false })}>Cancelar</button>
                    </div>
                </form></div>
            </div>
            {drawer.open && <div className="offcanvas-backdrop fade show" onClick={() => setDrawer({ ...drawer, open: false })}></div>}
        </div>
    );
};

export default ModalTorres;
