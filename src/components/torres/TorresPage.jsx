import React, { useState, useEffect, useMemo } from "react";
import TorreCard from "./TorreCard";
import TorreModal from "./TorreModal";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";

const TorresPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [drawer, setDrawer] = useState({ open: false, edit: false });
    const [torres, setTorres] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [selectedCondoId, setSelectedCondoId] = useState(null);
    const [form, setForm] = useState({ id: null, nombre: "", id_condominio: "", estado: "ACTIVO" });

    const loadTorres = async (condominioId = null) => {
        const t = await torreService.getAll(condominioId || undefined);
        setTorres(t);
    };

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const c = await condominioService.getAll();
                setCondominios(c);
                await loadTorres();
            } catch (err) {
                setError(err.forbidden ? err.message : "Error al cargar torres");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (loading) return;
        const reload = async () => {
            try {
                await loadTorres(selectedCondoId);
            } catch (err) {
                setError(err.forbidden ? err.message : "Error al filtrar torres");
            }
        };
        reload();
    }, [selectedCondoId]);

    const filtered = useMemo(() => {
        return torres.filter(t => {
            const condo = condominios.find(c => c.id === t.id_condominio);
            const condoName = condo ? condo.nombre : (t.condominioNombre || "");
            return t.nombre.toLowerCase().includes(search.toLowerCase()) ||
                   condoName.toLowerCase().includes(search.toLowerCase());
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
            estado: "ACTIVO",
        });
        setDrawer({ open: true, edit: false });
    };

    const save = async (e) => {
        e.preventDefault();
        if (!form.nombre?.trim() || !form.id_condominio) return;

        setSaving(true);
        setError("");
        try {
            if (drawer.edit) {
                await torreService.update(form.id, form);
            } else {
                await torreService.create(form);
            }
            await loadTorres(selectedCondoId);
            setDrawer({ open: false, edit: false });
        } catch (err) {
            setError(err.forbidden ? err.message : "Error al guardar la torre");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta torre?")) return;
        setSaving(true);
        setError("");
        try {
            await torreService.delete(id);
            await loadTorres(selectedCondoId);
            setDrawer({ open: false, edit: false });
        } catch (err) {
            setError(err.forbidden ? err.message : "Error al eliminar la torre");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid py-4 torre-container">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-0">Gestión de Torres</h2>
                    <p className="text-muted mb-0">Administra las torres y bloques de tus condominios</p>
                </div>
                <div className="dropdown">
                    <button
                        className="btn btn-theme-body border-theme rounded-pill px-4 fw-bold dropdown-toggle shadow-sm transition-all d-flex align-items-center justify-content-between"
                        type="button"
                        data-bs-toggle="dropdown"
                        style={{ minWidth: '240px' }}
                    >
                        <div className="d-flex align-items-center">
                            <div className="bg-brand bg-opacity-10 text-brand rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                <i className="bi bi-building-fill fs-6 lh-1"></i>
                            </div>
                            <span>{selectedCondoId ? condominios.find(c => c.id === selectedCondoId)?.nombre : 'Todos los Condominios'}</span>
                        </div>
                    </button>
                    <ul className="dropdown-menu shadow-lg border-0 rounded-4 p-2 mt-2 animate slideIn">
                        <li>
                            <button
                                className={`dropdown-item rounded-3 fw-bold mb-1 d-flex align-items-center ${selectedCondoId === null ? 'active bg-brand text-white' : ''}`}
                                onClick={() => setSelectedCondoId(null)}
                            >
                                <i className="bi bi-grid-fill me-2"></i>Todos los Condominios
                            </button>
                        </li>
                        <li><hr className="dropdown-divider opacity-50" /></li>
                        {condominios.map(c => (
                            <li key={c.id}>
                                <button
                                    className={`dropdown-item rounded-3 mb-1 fw-bold d-flex align-items-center ${selectedCondoId === c.id ? 'active bg-brand text-white' : ''}`}
                                    onClick={() => setSelectedCondoId(c.id)}
                                >
                                    <i className="bi bi-building me-2"></i>{c.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card border-0 shadow-sm mb-5 torre-card p-4 rounded-4">
                <div className="row g-3 align-items-center">
                    <div className="col-md-9">
                        <div className="input-group bg-theme-body border-theme rounded-pill overflow-hidden px-2 py-1">
                            <span className="input-group-text bg-transparent border-0 pe-2 d-flex align-items-center">
                                <i className="bi bi-search text-brand fs-5 lh-1"></i>
                            </span>
                            <input className="form-control border-0 bg-transparent fs-6 py-2" placeholder="Buscar torre por nombre o condominio..." onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3 text-end">
                        <button className="btn btn-brand rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center" onClick={() => handleAdd(selectedCondoId)}>
                            <i className="bi bi-plus-lg me-2 lh-1"></i>
                            <span>Nueva Torre</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : torres.length === 0 ? (
                <div className="text-center py-5 card border-0 shadow-sm rounded-4">
                    <div className="py-5">
                        <i className="bi bi-buildings text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-muted">No hay torres para mostrar en este momento.</h5>
                        <p className="text-muted small">Haz clic en el botón "Nueva Torre" para comenzar a agregar torres.</p>
                    </div>
                </div>
            ) : (
                <div className="accordion d-flex flex-column gap-3">
                    {Object.entries(grouped).map(([condoId, list], i) => {
                        const condo = condominios.find(c => c.id === parseInt(condoId, 10));
                        const condoName = condo ? condo.nombre : (list[0]?.condominioNombre || "Otros");
                        return (
                            <div className="accordion-item border-0 shadow-sm rounded-4 overflow-hidden" key={condoId}>
                                <h2 className="accordion-header">
                                    <button className="accordion-button px-4 py-3 fw-bold fs-5 shadow-none bg-theme-body border-bottom border-theme" data-bs-toggle="collapse" data-bs-target={`#c-${i}`}>
                                        <div className="bg-brand bg-opacity-20 text-brand rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                            <i className="bi bi-building-fill fs-5"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="text-theme">{condoName}</span>
                                                <span className="badge bg-theme-body border border-theme text-muted fw-normal fs-6 me-4">{list.length} Torres</span>
                                            </div>
                                        </div>
                                    </button>
                                </h2>
                                <div id={`c-${i}`} className="accordion-collapse collapse show">
                                    <div className="accordion-body p-4">
                                        <div className="row g-4">
                                            {list.map(t => (
                                                <div className="col-md-6 col-lg-4" key={t.id}>
                                                    <TorreCard torre={t} onManage={torre => { setForm({ ...torre, estado: torre.estado || 'ACTIVO' }); setDrawer({ open: true, edit: true }); }} />
                                                </div>
                                            ))}
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
                saving={saving}
            />
        </div>
    );
};

export default TorresPage;
