import React, { useState, useEffect, useMemo } from 'react';
import { apartamentoService } from "../../services/apartamentoService";
import { pisoService } from "../../services/pisoService";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";

const ApartamentosPage = () => {
    const [apartamentos, setApartamentos] = useState([]);
    const [pisos, setPisos] = useState([]);
    const [torres, setTorres] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState('');

    const [filtroPiso, setFiltroPiso] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [apartamentoSeleccionado, setApartamentoSeleccionado] = useState(null);
    const [form, setForm] = useState({
        numero_apartamento: '',
        id_condominio: '',
        id_torre: '',
        id_piso: '',
        estado: 'DISPONIBLE',
    });
    const [error, setError] = useState('');

    const cargarCatalogos = async () => {
        const [pisosData, torresData, condosData] = await Promise.all([
            pisoService.getAll(),
            torreService.getAll(),
            condominioService.getAll(),
        ]);
        setPisos(pisosData);
        setTorres(torresData);
        setCondominios(condosData);
    };

    const cargarApartamentos = async (pisoId = filtroPiso) => {
        const data = await apartamentoService.getAll(pisoId || undefined);
        setApartamentos(data);
    };

    useEffect(() => {
        const init = async () => {
            try {
                setPageError('');
                await Promise.all([cargarCatalogos(), cargarApartamentos()]);
            } catch (err) {
                setPageError(err.forbidden ? err.message : 'Error al cargar apartamentos');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (loading) return;
        const filtrar = async () => {
            try {
                await cargarApartamentos(filtroPiso);
            } catch (err) {
                setPageError(err.forbidden ? err.message : 'Error al filtrar apartamentos');
            }
        };
        filtrar();
    }, [filtroPiso]);

    const torresFiltradasForm = useMemo(() => {
        if (!form.id_condominio) return torres;
        return torres.filter(t => t.id_condominio === parseInt(form.id_condominio, 10));
    }, [torres, form.id_condominio]);

    const pisosFiltradosForm = useMemo(() => {
        if (!form.id_torre) return [];
        return pisos.filter(p => p.id_torre === parseInt(form.id_torre, 10));
    }, [pisos, form.id_torre]);

    const getPisoInfo = (id_piso) => {
        const piso = pisos.find(p => p.id === id_piso);
        if (!piso) return { numero: '-', torre: '-', condominio: '-' };
        const torre = torres.find(t => t.id === piso.id_torre);
        const condo = torre ? condominios.find(c => c.id === torre.id_condominio) : null;
        return {
            numero: piso.numero_piso,
            torre: torre ? torre.nombre : '-',
            condominio: condo ? condo.nombre : '-',
        };
    };

    const abrirModalAgregar = () => {
        setModoEdicion(false);
        setForm({
            numero_apartamento: '',
            id_condominio: '',
            id_torre: '',
            id_piso: '',
            estado: 'DISPONIBLE',
        });
        setError('');
        setShowModal(true);
    };

    const abrirModalEditar = (apto) => {
        const piso = pisos.find(p => p.id === apto.id_piso);
        const torre = piso ? torres.find(t => t.id === piso.id_torre) : null;
        setModoEdicion(true);
        setApartamentoSeleccionado(apto);
        setForm({
            numero_apartamento: apto.numero_apartamento,
            id_condominio: torre?.id_condominio || '',
            id_torre: piso?.id_torre || '',
            id_piso: apto.id_piso,
            estado: apto.estado || 'DISPONIBLE',
        });
        setError('');
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setError('');
    };

    const handleCondominioChange = (id_condominio) => {
        setForm(prev => ({
            ...prev,
            id_condominio,
            id_torre: '',
            id_piso: '',
        }));
    };

    const handleTorreChange = (id_torre) => {
        setForm(prev => ({
            ...prev,
            id_torre,
            id_piso: '',
        }));
    };

    const handleGuardar = async () => {
        if (!form.numero_apartamento?.trim() || !form.id_piso) {
            setError('Por favor completa todos los campos.');
            return;
        }

        const payload = {
            numero_apartamento: form.numero_apartamento.trim(),
            id_piso: parseInt(form.id_piso, 10),
            estado: form.estado,
        };

        setSaving(true);
        setError('');
        try {
            if (modoEdicion) {
                await apartamentoService.update(apartamentoSeleccionado.id, payload);
            } else {
                await apartamentoService.create(payload);
            }
            await cargarApartamentos();
            cerrarModal();
        } catch (err) {
            setError(err.forbidden ? err.message : 'Error al guardar el apartamento');
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este apartamento?')) return;
        setSaving(true);
        try {
            await apartamentoService.delete(id);
            await cargarApartamentos();
        } catch (err) {
            setPageError(err.forbidden ? err.message : 'Error al eliminar el apartamento');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-heading">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Gestión de Apartamentos</h3>
                        <p className="text-subtitle text-muted">
                            Administra las unidades residenciales de cada piso
                        </p>
                    </div>
                </div>
            </div>

            {pageError && <div className="alert alert-danger">{pageError}</div>}

            <section className="section">
                <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0">Listado de Unidades</h5>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: '220px' }}
                                value={filtroPiso}
                                onChange={e => setFiltroPiso(e.target.value)}
                            >
                                <option value="">Todos los pisos</option>
                                {pisos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        Piso {p.numero_piso} - {p.torreNombre || torres.find(t => t.id === p.id_torre)?.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={abrirModalAgregar}>
                            <i className="bi bi-plus-lg me-1"></i> Agregar Apartamento
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Apartamento</th>
                                        <th>Piso</th>
                                        <th>Torre</th>
                                        <th>Condominio</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apartamentos.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">
                                                No hay apartamentos registrados en este criterio
                                            </td>
                                        </tr>
                                    ) : (
                                        apartamentos.map((apto, index) => {
                                            const info = getPisoInfo(apto.id_piso);
                                            return (
                                                <tr key={apto.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <span className="fw-bold text-primary">
                                                            <i className="bi bi-door-open-fill me-1"></i>
                                                            Depa {apto.numero_apartamento}
                                                        </span>
                                                    </td>
                                                    <td>Piso {apto.pisoNumero ?? info.numero}</td>
                                                    <td>{apto.torreNombre || info.torre}</td>
                                                    <td>{info.condominio}</td>
                                                    <td>
                                                        <span className={`badge ${
                                                            apto.estado === 'DISPONIBLE' ? 'bg-success' :
                                                            apto.estado === 'OCUPADO' ? 'bg-warning text-dark' : 'bg-secondary'
                                                        }`}>
                                                            {apto.estado}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-warning me-2"
                                                            onClick={() => abrirModalEditar(apto)}
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleEliminar(apto.id)}
                                                            disabled={saving}
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    {modoEdicion ? 'Editar Apartamento' : 'Nuevo Apartamento'}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={cerrarModal} disabled={saving}></button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Condominio</label>
                                    <select
                                        className="form-select"
                                        value={form.id_condominio}
                                        onChange={e => handleCondominioChange(e.target.value)}
                                        disabled={saving}
                                    >
                                        <option value="">Selecciona condominio</option>
                                        {condominios.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Torre</label>
                                    <select
                                        className="form-select"
                                        value={form.id_torre}
                                        onChange={e => handleTorreChange(e.target.value)}
                                        disabled={saving || !form.id_condominio}
                                    >
                                        <option value="">Selecciona torre</option>
                                        {torresFiltradasForm.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Piso</label>
                                    <select
                                        className="form-select"
                                        value={form.id_piso}
                                        onChange={e => setForm({ ...form, id_piso: e.target.value })}
                                        disabled={saving || !form.id_torre}
                                    >
                                        <option value="">Selecciona el piso</option>
                                        {pisosFiltradosForm.map(p => (
                                            <option key={p.id} value={p.id}>
                                                Piso {p.numero_piso}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Número de Apartamento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: 201"
                                        value={form.numero_apartamento}
                                        onChange={e => setForm({ ...form, numero_apartamento: e.target.value })}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Estado</label>
                                    <select
                                        className="form-select"
                                        value={form.estado}
                                        onChange={e => setForm({ ...form, estado: e.target.value })}
                                        disabled={saving}
                                    >
                                        <option value="DISPONIBLE">Disponible</option>
                                        <option value="OCUPADO">Ocupado</option>
                                        <option value="INACTIVO">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={cerrarModal} disabled={saving}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleGuardar} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Guardando...
                                        </>
                                    ) : (
                                        modoEdicion ? 'Actualizar' : 'Registrar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApartamentosPage;
