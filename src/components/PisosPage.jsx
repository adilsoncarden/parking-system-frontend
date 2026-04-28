import React, { useState } from 'react';

// Datos mock basados en las tablas
const condominiosMock = [
    { id: 1, nombre: 'Condominio Los Álamos', direccion: 'Av. Primavera 123' }
];

const torresMock = [
    { id: 1, nombre: 'Torre A', id_condominio: 1 },
    { id: 2, nombre: 'Torre B', id_condominio: 1 },
    { id: 3, nombre: 'Torre C', id_condominio: 1 }
];

const pisosMock = [
    { id: 1, numero_piso: 1, id_torre: 1 },
    { id: 2, numero_piso: 2, id_torre: 1 },
    { id: 3, numero_piso: 3, id_torre: 1 },
    { id: 4, numero_piso: 1, id_torre: 2 },
    { id: 5, numero_piso: 2, id_torre: 2 }
];

const PisosPage = () => {
    const [pisos, setPisos] = useState(pisosMock);
    const [filtroTorre, setFiltroTorre] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
    const [form, setForm] = useState({ numero_piso: '', id_torre: '' });
    const [error, setError] = useState('');

    const getTorreNombre = (id_torre) => {
        const torre = torresMock.find(t => t.id === id_torre);
        return torre ? torre.nombre : '-';
    };

    const getCondominioNombre = (id_torre) => {
        const torre = torresMock.find(t => t.id === id_torre);
        if (!torre) return '-';
        const condo = condominiosMock.find(c => c.id === torre.id_condominio);
        return condo ? condo.nombre : '-';
    };

    const pisosFiltrados = filtroTorre
        ? pisos.filter(p => p.id_torre === parseInt(filtroTorre))
        : pisos;

    const abrirModalAgregar = () => {
        setModoEdicion(false);
        setForm({ numero_piso: '', id_torre: '' });
        setError('');
        setShowModal(true);
    };

    const abrirModalEditar = (piso) => {
        setModoEdicion(true);
        setPisoSeleccionado(piso);
        setForm({ numero_piso: piso.numero_piso, id_torre: piso.id_torre });
        setError('');
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setError('');
    };

    const handleGuardar = () => {
        if (!form.numero_piso || !form.id_torre) {
            setError('Por favor completa todos los campos.');
            return;
        }
        if (isNaN(form.numero_piso) || parseInt(form.numero_piso) <= 0) {
            setError('El número de piso debe ser un número positivo.');
            return;
        }

        if (modoEdicion) {
            setPisos(pisos.map(p =>
                p.id === pisoSeleccionado.id
                    ? { ...p, numero_piso: parseInt(form.numero_piso), id_torre: parseInt(form.id_torre) }
                    : p
            ));
        } else {
            const nuevoId = Math.max(...pisos.map(p => p.id)) + 1;
            setPisos([...pisos, {
                id: nuevoId,
                numero_piso: parseInt(form.numero_piso),
                id_torre: parseInt(form.id_torre)
            }]);
        }
        cerrarModal();
    };

    const handleEliminar = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este piso?')) {
            setPisos(pisos.filter(p => p.id !== id));
        }
    };

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
                                {torresMock.map(t => (
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
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pisosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                No hay pisos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        pisosFiltrados.map((piso, index) => (
                                            <tr key={piso.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className="badge bg-primary rounded-pill">
                                                        Piso {piso.numero_piso}
                                                    </span>
                                                </td>
                                                <td>
                                                    <i className="bi bi-building-fill me-1 text-secondary"></i>
                                                    {getTorreNombre(piso.id_torre)}
                                                </td>
                                                <td>
                                                    <i className="bi bi-buildings me-1 text-secondary"></i>
                                                    {getCondominioNombre(piso.id_torre)}
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
                        <div className="mt-2 text-muted small">
                            Mostrando {pisosFiltrados.length} de {pisos.length} pisos
                        </div>
                    </div>
                </div>
            </section>

            {/* MODAL */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modoEdicion ? 'Editar Piso' : 'Agregar Piso'}
                                </h5>
                                <button className="btn-close" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Número de Piso</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Ej: 1"
                                        min="1"
                                        value={form.numero_piso}
                                        onChange={e => setForm({ ...form, numero_piso: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Torre</label>
                                    <select
                                        className="form-select"
                                        value={form.id_torre}
                                        onChange={e => setForm({ ...form, id_torre: e.target.value })}
                                    >
                                        <option value="">Selecciona una torre</option>
                                        {torresMock.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleGuardar}>
                                    {modoEdicion ? 'Guardar Cambios' : 'Agregar'}
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