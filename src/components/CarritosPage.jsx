import React, { useState } from 'react';

const apartamentosMock = [
    { id: 1, numero_apartamento: '101', id_piso: 1, propietario: 'Juan Pérez' },
    { id: 2, numero_apartamento: '102', id_piso: 1, propietario: 'María López' },
    { id: 3, numero_apartamento: '201', id_piso: 2, propietario: 'Carlos Ruiz' },
    { id: 4, numero_apartamento: '202', id_piso: 2, propietario: 'Ana Torres' },
    { id: 5, numero_apartamento: '301', id_piso: 3, propietario: 'Luis Mora' },
];

const carritosMock = [
    { id: 1, nombre: 'Carrito #1' },
    { id: 2, nombre: 'Carrito #2' },
    { id: 3, nombre: 'Carrito #3' },
    { id: 4, nombre: 'Carrito #4' },
];

const CarritosPage = () => {
    const [prestamos, setPrestamos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [carritoSeleccionado, setCarritoSeleccionado] = useState(null);
    const [form, setForm] = useState({ id_apartamento: '' });
    const [error, setError] = useState('');

    const carritoOcupado = (id_carrito) =>
        prestamos.find(p => p.id_carrito === id_carrito && p.estado === 'activo');

    const abrirModal = (carrito) => {
        setCarritoSeleccionado(carrito);
        setForm({ id_apartamento: '' });
        setError('');
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setError('');
    };

    const handlePrestar = () => {
        if (!form.id_apartamento) {
            setError('Selecciona un apartamento.');
            return;
        }
        const apto = apartamentosMock.find(a => a.id === parseInt(form.id_apartamento));
        const nuevoPrestamo = {
            id: Date.now(),
            id_carrito: carritoSeleccionado.id,
            nombre_carrito: carritoSeleccionado.nombre,
            id_apartamento: apto.id,
            numero_apartamento: apto.numero_apartamento,
            propietario: apto.propietario,
            hora_inicio: new Date(),
            estado: 'activo',
        };
        setPrestamos([...prestamos, nuevoPrestamo]);
        cerrarModal();
    };

    const handleDevolver = (id_prestamo) => {
        if (window.confirm('¿Confirmar devolución del carrito?')) {
            setPrestamos(prestamos.map(p =>
                p.id === id_prestamo ? { ...p, estado: 'devuelto', hora_fin: new Date() } : p
            ));
        }
    };

    const calcularTiempo = (hora_inicio) => {
        const diff = Math.floor((new Date() - new Date(hora_inicio)) / 60000);
        if (diff < 1) return 'Recién prestado';
        return `${diff} min`;
    };

    const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
    const historial = prestamos.filter(p => p.estado === 'devuelto');

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Gestión de Carritos</h3>
                        <p className="text-subtitle text-muted">
                            Condominio Los Álamos · Préstamos y devoluciones
                        </p>
                    </div>
                </div>
            </div>

            {/* TARJETAS DE CARRITOS */}
            <section className="section">
                <div className="row">
                    {carritosMock.map(carrito => {
                        const ocupado = carritoOcupado(carrito.id);
                        return (
                            <div className="col-12 col-sm-6 col-lg-3 mb-4" key={carrito.id}>
                                <div className={`card h-100 shadow-sm border-0 ${ocupado ? 'border-start border-danger border-4' : 'border-start border-success border-4'}`}>
                                    <div className="card-body text-center py-4">
                                        <div className="position-relative d-inline-block mb-3">
                                            <i className={`bi bi-cart-fill fs-1 ${ocupado ? 'text-danger' : 'text-success'}`}></i>
                                            <span className={`badge position-absolute top-0 start-100 translate-middle ${ocupado ? 'bg-danger' : 'bg-success'}`}>
                                                {ocupado ? 'Ocupado' : 'Disponible'}
                                            </span>
                                        </div>
                                        <h5 className="fw-bold">{carrito.nombre}</h5>
                                        <p className="text-muted small mb-3">
                                            {ocupado
                                                ? `En uso: Depa ${ocupado.numero_apartamento}`
                                                : 'Listo para ser asignado a un residente.'}
                                        </p>
                                        <button
                                            className={`btn w-100 ${ocupado ? 'btn-outline-danger' : 'btn-primary'}`}
                                            onClick={() => !ocupado && abrirModal(carrito)}
                                            disabled={!!ocupado}
                                        >
                                            {ocupado ? 'No disponible' : 'Prestar Carrito'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* PRÉSTAMOS ACTIVOS */}
            <section className="section">
                <div className="card shadow-sm">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-clock-history text-warning me-2"></i>
                            Préstamos Activos
                            {prestamosActivos.length > 0 && (
                                <span className="badge bg-warning text-dark ms-2">{prestamosActivos.length}</span>
                            )}
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>CARRITO</th>
                                        <th>APARTAMENTO</th>
                                        <th>PROPIETARIO</th>
                                        <th>TIEMPO</th>
                                        <th>ESTADO</th>
                                        <th>ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prestamosActivos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                No hay préstamos activos
                                            </td>
                                        </tr>
                                    ) : (
                                        prestamosActivos.map(p => (
                                            <tr key={p.id}>
                                                <td><i className="bi bi-cart-fill text-primary me-1"></i>{p.nombre_carrito}</td>
                                                <td>Depa {p.numero_apartamento}</td>
                                                <td>{p.propietario}</td>
                                                <td><span className="badge bg-warning text-dark">{calcularTiempo(p.hora_inicio)}</span></td>
                                                <td><span className="badge bg-success">Activo</span></td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDevolver(p.id)}
                                                    >
                                                        <i className="bi bi-arrow-return-left me-1"></i>Devolver
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

            {/* HISTORIAL */}
            {historial.length > 0 && (
                <section className="section">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-journal-check text-secondary me-2"></i>
                                Historial de Devoluciones
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>CARRITO</th>
                                            <th>APARTAMENTO</th>
                                            <th>PROPIETARIO</th>
                                            <th>ESTADO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historial.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.nombre_carrito}</td>
                                                <td>Depa {p.numero_apartamento}</td>
                                                <td>{p.propietario}</td>
                                                <td><span className="badge bg-secondary">Devuelto</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* MODAL PRESTAR */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-cart-plus me-2"></i>
                                    Prestar {carritoSeleccionado?.nombre}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}
                                <p className="text-muted small">Selecciona el apartamento que solicita el carrito.</p>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Apartamento</label>
                                    <select
                                        className="form-select"
                                        value={form.id_apartamento}
                                        onChange={e => setForm({ ...form, id_apartamento: e.target.value })}
                                    >
                                        <option value="">-- Seleccionar apartamento --</option>
                                        {apartamentosMock.map(a => (
                                            <option key={a.id} value={a.id}>
                                                Depa {a.numero_apartamento} — {a.propietario}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={cerrarModal}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handlePrestar}>
                                    Confirmar Préstamo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarritosPage;