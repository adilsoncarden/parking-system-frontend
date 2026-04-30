import React, { useState, useEffect } from 'react';
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

    const [filtroPiso, setFiltroPiso] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [apartamentoSeleccionado, setApartamentoSeleccionado] = useState(null);
    const [form, setForm] = useState({ numero_apartamento: '', id_piso: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            const [apartamentosData, pisosData, torresData, condosData] = await Promise.all([
                apartamentoService.getAll(),
                pisoService.getAll(),
                torreService.getAll(),
                condominioService.getAll(),
            ]);
            setApartamentos(apartamentosData);
            setPisos(pisosData);
            setTorres(torresData);
            setCondominios(condosData);
            setLoading(false);
        };
        cargarDatos();
    }, []);

    const getPisoInfo = (id_piso) => {
        const piso = pisos.find(p => p.id === id_piso);
        if (!piso) return { numero: '-', torre: '-', condominio: '-' };
        const torre = torres.find(t => t.id === piso.id_torre);
        const condo = torre ? condominios.find(c => c.id === torre.id_condominio) : null;
        return {
            numero: piso.numero_piso,
            torre: torre ? torre.nombre : '-',
            condominio: condo ? condo.nombre : '-'
        };
    };

    const apartamentosFiltrados = filtroPiso
        ? apartamentos.filter(a => a.id_piso === parseInt(filtroPiso))
        : apartamentos;

    const abrirModalAgregar = () => {
        setModoEdicion(false);
        setForm({ numero_apartamento: '', id_piso: '' });
        setError('');
        setShowModal(true);
    };

    const abrirModalEditar = (apto) => {
        setModoEdicion(true);
        setApartamentoSeleccionado(apto);
        setForm({ numero_apartamento: apto.numero_apartamento, id_piso: apto.id_piso });
        setError('');
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setError('');
    };

    const handleGuardar = async () => {
        if (!form.numero_apartamento || !form.id_piso) {
            setError('Por favor completa todos los campos.');
            return;
        }

        const payload = {
            numero_apartamento: form.numero_apartamento,
            id_piso: parseInt(form.id_piso),
        };

        if (modoEdicion) {
            await apartamentoService.update(apartamentoSeleccionado.id, payload);
        } else {
            await apartamentoService.create(payload);
        }

        const actualizado = await apartamentoService.getAll();
        setApartamentos(actualizado);
        cerrarModal();
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este apartamento?')) {
            await apartamentoService.delete(id);
            const actualizado = await apartamentoService.getAll();
            setApartamentos(actualizado);
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

            <section className="section">
                <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0">Listado de Unidades</h5>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: '200px' }}
                                value={filtroPiso}
                                onChange={e => setFiltroPiso(e.target.value)}
                            >
                                <option value="">Todos los pisos</option>
                                {pisos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        Piso {p.numero_piso} - {torres.find(t => t.id === p.id_torre)?.nombre}
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
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apartamentosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                No hay apartamentos registrados en este criterio
                                            </td>
                                        </tr>
                                    ) : (
                                        apartamentosFiltrados.map((apto, index) => {
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
                                                    <td>Piso {info.numero}</td>
                                                    <td>{info.torre}</td>
                                                    <td>{info.condominio}</td>
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
                        <div className="mt-2 text-muted small">
                            Mostrando {apartamentosFiltrados.length} de {apartamentos.length} apartamentos
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
                                <button className="btn-close btn-close-white" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Número de Apartamento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: 201"
                                        value={form.numero_apartamento}
                                        onChange={e => setForm({ ...form, numero_apartamento: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Piso Correspondiente</label>
                                    <select
                                        className="form-select"
                                        value={form.id_piso}
                                        onChange={e => setForm({ ...form, id_piso: e.target.value })}
                                    >
                                        <option value="">Selecciona el piso</option>
                                        {pisos.map(p => (
                                            <option key={p.id} value={p.id}>
                                                Piso {p.numero_piso} ({torres.find(t => t.id === p.id_torre)?.nombre})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleGuardar}>
                                    {modoEdicion ? 'Actualizar' : 'Registrar'}
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