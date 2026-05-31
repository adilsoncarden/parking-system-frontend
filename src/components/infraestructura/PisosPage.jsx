import React, { useState, useEffect, useMemo } from 'react';
import { pisoService } from "../../services/pisoService";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";

const PisosPage = () => {
    const [pisos, setPisos] = useState([]);
    const [torres, setTorres] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState('');

    const [filtroTorre, setFiltroTorre] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
    const [form, setForm] = useState({
        numero_piso: '',
        id_condominio: '',
        id_torre: '',
        estado: 'ACTIVO',
    });
    const [error, setError] = useState('');

    const cargarDatos = async (torreIdFiltro = filtroTorre) => {
        const [pisosData, torresData, condosData] = await Promise.all([
            pisoService.getAll(torreIdFiltro || undefined),
            torreService.getAll(),
            condominioService.getAll(),
        ]);
        setPisos(pisosData);
        setTorres(torresData);
        setCondominios(condosData);
    };

    useEffect(() => {
        const init = async () => {
            try {
                setPageError('');
                await cargarDatos();
            } catch (err) {
                setPageError(err.forbidden ? err.message : 'Error al cargar pisos');
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
                const data = await pisoService.getAll(filtroTorre || undefined);
                setPisos(data);
            } catch (err) {
                setPageError(err.forbidden ? err.message : 'Error al filtrar pisos');
            }
        };
        filtrar();
    }, [filtroTorre]);

    const torresFiltradasForm = useMemo(() => {
        if (!form.id_condominio) return torres;
        return torres.filter(t => t.id_condominio === parseInt(form.id_condominio, 10));
    }, [torres, form.id_condominio]);

    const getTorreNombre = (id_torre) => {
        const torre = torres.find(t => t.id === id_torre);
        return torre ? torre.nombre : '-';
    };

    const getCondominioNombre = (id_torre) => {
        const torre = torres.find(t => t.id === id_torre);
        if (!torre) return '-';
        const condo = condominios.find(c => c.id === torre.id_condominio);
        return condo ? condo.nombre : '-';
    };

    const abrirModalAgregar = () => {
        setModoEdicion(false);
        setForm({ numero_piso: '', id_condominio: '', id_torre: '', estado: 'ACTIVO' });
        setError('');
        setShowModal(true);
    };

    const abrirModalEditar = (piso) => {
        const torre = torres.find(t => t.id === piso.id_torre);
        setModoEdicion(true);
        setPisoSeleccionado(piso);
        setForm({
            numero_piso: piso.numero_piso,
            id_condominio: torre?.id_condominio || '',
            id_torre: piso.id_torre,
            estado: piso.estado || 'ACTIVO',
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
        }));
    };

    const handleGuardar = async () => {
        if (!form.numero_piso || !form.id_torre) {
            setError('Por favor completa todos los campos.');
            return;
        }
        if (isNaN(form.numero_piso) || parseInt(form.numero_piso, 10) <= 0) {
            setError('El número de piso debe ser un número positivo.');
            return;
        }

        const payload = {
            numero_piso: parseInt(form.numero_piso, 10),
            id_torre: parseInt(form.id_torre, 10),
            estado: form.estado,
        };

        setSaving(true);
        setError('');
        try {
            if (modoEdicion) {
                await pisoService.update(pisoSeleccionado.id, payload);
            } else {
                await pisoService.create(payload);
            }
            await cargarDatos();
            cerrarModal();
        } catch (err) {
            setError(err.forbidden ? err.message : 'Error al guardar el piso');
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este piso?')) return;
        setSaving(true);
        try {
            await pisoService.delete(id);
            await cargarDatos();
        } catch (err) {
            setPageError(err.forbidden ? err.message : 'Error al eliminar el piso');
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
                        <h3>Gestión de Pisos</h3>
                        <p className="text-subtitle text-muted">
                            Administra los pisos de cada torre del condominio
                        </p>
                    </div>
                </div>
            </div>

            {pageError && <div className="alert alert-danger">{pageError}</div>}

            <section className="section">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0">Listado de Pisos</h5>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: '180px' }}
                                value={filtroTorre}
                                onChange={e => setFiltroTorre(e.target.value)}
                            >
                                <option value="">Todas las torres</option>
                                {torres.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={abrirModalAgregar}>
                            <i className="bi bi-plus-lg me-1"></i> Agregar Piso
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Número de Piso</th>
                                        <th>Torre</th>
                                        <th>Condominio</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pisos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                No hay pisos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        pisos.map((piso, index) => (
                                            <tr key={piso.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className="badge bg-primary rounded-pill">
                                                        Piso {piso.numero_piso}
                                                    </span>
                                                </td>
                                                <td>
                                                    <i className="bi bi-building-fill me-1 text-secondary"></i>
                                                    {piso.torreNombre || getTorreNombre(piso.id_torre)}
                                                </td>
                                                <td>
                                                    <i className="bi bi-buildings me-1 text-secondary"></i>
                                                    {getCondominioNombre(piso.id_torre)}
                                                </td>
                                                <td>
                                                    <span className={`badge ${piso.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                                        {piso.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-warning me-2"
                                                        onClick={() => abrirModalEditar(piso)}
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleEliminar(piso.id)}
                                                        disabled={saving}
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
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
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modoEdicion ? 'Editar Piso' : 'Agregar Piso'}
                                </h5>
                                <button className="btn-close" onClick={cerrarModal} disabled={saving}></button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Condominio</label>
                                    <select
                                        className="form-select"
                                        value={form.id_condominio}
                                        onChange={e => handleCondominioChange(e.target.value)}
                                        disabled={saving}
                                    >
                                        <option value="">Selecciona un condominio</option>
                                        {condominios.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Torre</label>
                                    <select
                                        className="form-select"
                                        value={form.id_torre}
                                        onChange={e => setForm({ ...form, id_torre: e.target.value })}
                                        disabled={saving || !form.id_condominio}
                                    >
                                        <option value="">Selecciona una torre</option>
                                        {torresFiltradasForm.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Número de Piso</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Ej: 1"
                                        min="1"
                                        value={form.numero_piso}
                                        onChange={e => setForm({ ...form, numero_piso: e.target.value })}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Estado</label>
                                    <select
                                        className="form-select"
                                        value={form.estado}
                                        onChange={e => setForm({ ...form, estado: e.target.value })}
                                        disabled={saving}
                                    >
                                        <option value="ACTIVO">Activo</option>
                                        <option value="INACTIVO">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={cerrarModal} disabled={saving}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleGuardar} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Guardando...
                                        </>
                                    ) : (
                                        modoEdicion ? 'Guardar Cambios' : 'Agregar'
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

export default PisosPage;
