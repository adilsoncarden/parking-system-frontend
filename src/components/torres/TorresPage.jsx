import React, { useState, useEffect, useMemo } from "react";
import TorreCard from "./TorreCard";
import TorreAgregarCard from "./TorreAgregarCard";
import TorreModal from "./TorreModal";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";

const StatCard = ({ title, value, icon, color }) => (
    <div className="card border-0 shadow-sm torre-card p-3 h-100">
        <div className="d-flex align-items-center">
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3 text-${color}`}>
                <i className={`bi ${icon} fs-4`}></i>
            </div>
            <div>
                <small className="text-muted fw-bold text-uppercase ls-1">{title}</small>
                <h4 className="fw-bold mb-0">{value}</h4>
            </div>
        </div>
    </div>
);

const TorresPage = () => {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [drawer, setDrawer] = useState({ open: false, edit: false });
    const [torres, setTorres] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [form, setForm] = useState({ id: null, nombre: "", id_condominio: "", pisos: "", apartamentos: "" });

    useEffect(() => {
        const load = async () => {
            try {
                const [t, c] = await Promise.all([torreService.getAll(), condominioService.getAll()]);
                setTorres(t);
                setCondominios(c);
            } catch (error) {
                console.error("Error cargando torres:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        return torres.filter(t => {
            const condo = condominios.find(c => c.id === t.id_condominio);
            const condoName = condo ? condo.nombre : "";
            return (t.nombre + condoName).toLowerCase().includes(search.toLowerCase());
        });
    }, [torres, search, condominios]);

    const grouped = useMemo(() => {
        const res = {};
        filtered.forEach(t => {
            (res[t.id_condominio] = res[t.id_condominio] || []).push(t);
        });
        return res;
    }, [filtered]);

    const handleAdd = (condoId = null) => {
        setForm({
            id: null,
            nombre: "",
            id_condominio: condoId || (condominios[0]?.id || ""),
            pisos: "",
            apartamentos: ""
        });
        setDrawer({ open: true, edit: false });
    };

    const save = async (e) => {
        e.preventDefault();
        if (drawer.edit) {
            await torreService.update(form.id, form);
        } else {
            await torreService.create(form);
        }
        setTorres(await torreService.getAll());
        setDrawer({ open: false, edit: false });
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta torre?")) {
            await torreService.delete(id);
            setTorres(await torreService.getAll());
            setDrawer({ open: false, edit: false });
        }
    };

    return (
        <div className="container-fluid py-4 torre-container">
            <div className="row g-3 mb-4">
                {[["Total Torres", torres.length, "bi-buildings", "primary"], ["Apartamentos", torres.reduce((a, t) => a + +(t.apartamentos || 0), 0), "bi-house-fill", "warning"]].map(([t, v, i, c]) => (
                    <div className="col-md-6" key={t}><StatCard title={t} value={v} icon={i} color={c} /></div>
                ))}
            </div>

            <div className="card border-0 shadow-sm mb-4 torre-card p-3"><div className="row g-3 align-items-center">
                <div className="col-md-9"><div className="input-group border-theme rounded-pill overflow-hidden"><span className="input-group-text bg-transparent border-0 pe-0"><i className="bi bi-search"></i></span><input className="form-control border-0 bg-transparent" placeholder="Buscar torre por nombre o condominio..." onChange={e => setSearch(e.target.value)} /></div></div>
                <div className="col-md-3 text-end"><button className="btn btn-brand px-4" onClick={() => handleAdd()}><i className="bi bi-plus-lg me-2"></i>Nueva</button></div>
            </div></div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : torres.length === 0 ? (
                <div className="text-center py-5 card border-0 shadow-sm rounded-4">
                    <div className="py-5">
                        <i className="bi bi-buildings text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-muted">No hay torres para mostrar en este momento.</h5>
                        <p className="text-muted small">Haz clic en el botón "Nueva" para comenzar a agregar torres.</p>
                    </div>
                </div>
            ) : (
                <div className="accordion d-flex flex-column gap-3">
                    {Object.entries(grouped).map(([condoId, list], i) => {
                        const condo = condominios.find(c => c.id === parseInt(condoId));
                        const condoName = condo ? condo.nombre : "Otros";
                        return (
                            <div className="accordion-item border-0 shadow-sm rounded-4 overflow-hidden" key={condoId}>
                                <h2 className="accordion-header">
                                    <button className="accordion-button px-4 py-3 fw-bold fs-5" data-bs-toggle="collapse" data-bs-target={`#c-${i}`}>
                                        <i className="bi bi-building-fill text-brand me-3"></i>
                                        {condoName}
                                        <span className="badge bg-theme-body text-muted ms-3 fw-normal">{list.length} Torres</span>
                                    </button>
                                </h2>
                                <div id={`c-${i}`} className="accordion-collapse collapse show">
                                    <div className="accordion-body p-4">
                                        <div className="row g-4">
                                            {list.map(t => (
                                                <div className="col-md-6 col-lg-4" key={t.id}>
                                                    <TorreCard torre={t} onManage={torre => { setForm({ ...torre }); setDrawer({ open: true, edit: true }); }} />
                                                </div>
                                            ))}
                                            <div className="col-md-6 col-lg-4">
                                                <TorreAgregarCard onAgregar={() => handleAdd(parseInt(condoId))} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <TorreModal
                drawer={drawer}
                form={form}
                setForm={setForm}
                setDrawer={setDrawer}
                save={save}
                condominios={condominios}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default TorresPage;
