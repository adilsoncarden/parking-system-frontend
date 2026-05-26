import React, { useState, useEffect } from 'react';
import { carritoService } from "../../services/carritoService";
import { prestamoService } from "../../services/prestamoService";
import { apartamentoService } from "../../services/apartamentoService";
import { entradaService } from "../../services/entradaService";

const TIEMPO_LIMITE = 15;

const CarritosPage = () => {
    const [carritos, setCarritos] = useState([]);
    const [prestamos, setPrestamos] = useState([]);
    const [apartamentos, setApartamentos] = useState([]);
    const [entradas, setEntradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [carritoSeleccionado, setCarritoSeleccionado] = useState(null);
    const [form, setForm] = useState({ idApartamento: '', idEntradaSalida: '' });
    const [error, setError] = useState('');
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Sincroniza préstamos con localStorage para CondominiosPage
    useEffect(() => {
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
        window.dispatchEvent(new Event("prestamos-updated"));
    }, [prestamos]);

    const cargarDatos = async () => {
        setLoading(true);
        const [carritosData, prestamosData, apartamentosData, entradasData] = await Promise.all([
            carritoService.getAll(),
            prestamoService.getActivos(),
            apartamentoService.getAll(),
            entradaService.getAll(),
        ]);
        setCarritos(carritosData);
        setPrestamos(prestamosData);
        setApartamentos(apartamentosData);
        setEntradas(entradasData);
        setLoading(false);
    };

    const carritoOcupado = (idCarrito) =>
        prestamos.find(p => p.idCarrito === idCarrito && p.estado === 'activo');

    const abrirModal = (carrito) => {
        setCarritoSeleccionado(carrito);
        setForm({ idApartamento: '', idEntradaSalida: carrito.idEntradaSalida || '' });
        setError('');
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setError('');
    };

    const handlePrestar = async () => {
        if (!form.idApartamento || !form.idEntradaSalida) {
            setError('Completa todos los campos.');
            return;
        }
        try {
            await prestamoService.create({
                idCarrito: carritoSeleccionado.id,
                idApartamento: parseInt(form.idApartamento),
                idEntradaSalida: parseInt(form.idEntradaSalida),
            });
            await cargarDatos();
            cerrarModal();
        } catch (e) {
            setError('Error al registrar el préstamo.');
        }
    };

    const handleDevolver = async (idPrestamo) => {
        if (window.confirm('¿Confirmar devolución del carrito?')) {
            await prestamoService.devolver(idPrestamo);
            await cargarDatos();
        }
    };

    const handleAplicarMulta = async (idPrestamo) => {
        if (window.confirm('¿Aplicar multa de S/ 5.00 a este préstamo?')) {
            await prestamoService.aplicarMulta(idPrestamo);
            await cargarDatos();
        }
    };

    const calcularTiempo = (horaInicio) => {
        const inicio = new Date(horaInicio);
        const diffMs = now - inicio;
        const minutos = Math.floor(diffMs / 60000);
        const segundos = Math.floor((diffMs % 60000) / 1000);
        const restante = TIEMPO_LIMITE - minutos - (segundos / 60);
        if (restante <= 0) return 'Tiempo excedido ⚠️';
        return `${Math.floor(restante)}:${segundos.toString().padStart(2, '0')}`;
    };

    const estaVencido = (horaInicio) => {
        const diff = (now - new Date(horaInicio)) / 60000;
        return diff >= TIEMPO_LIMITE;
    };

    const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
    const historial = prestamos.filter(p => p.estado !== 'activo');

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
                        <h3>Gestión de Carritos de Carga</h3>
                        <p className="text-subtitle text-muted">
                            Préstamos, devoluciones y multas
                        </p>
                    </div>
                </div>
            </div>

            {/* TARJETAS DE CARRITOS */}
            <section className="section">
                <div className="row">
                    {carritos.map(carrito => {
                        const ocupado = carritoOcupado(carrito.id);
                        return (
                            <div className="col-12 col-sm-6 col-lg-3 mb-4" key={carrito.id}>
                                <div className={`card h-100 shadow-sm border-0 border-start border-4 ${ocupado ? 'border-danger' : 'border-success'}`}>
                                    <div className="card-body text-center py-4">
                                        <div className="position-relative d-inline-block mb-3">
                                            <i className={`bi bi-cart-fill fs-1 ${ocupado ? 'text-danger' : 'text-success'}`}></i>
                                            <span className={`badge position-absolute top-0 start-100 translate-middle ${ocupado ? 'bg-danger' : 'bg-success'}`}>
                                                {ocupado ? 'Ocupado' : 'Disponible'}
                                            </span>
                                        </div>
                                        <h5 className="fw-bold">{carrito.nombre}</h5>
                                        <p className="text-muted small mb-1">
                                            <i className="bi bi-door-open me-1"></i>
                                            {carrito.nombreEntrada || 'Sin entrada asignada'}
                                        </p>
                                        <p className="text-muted small mb-3">
                                            {ocupado
                                                ? `En uso: Depa ${ocupado.numeroApartamento}`
                                                : 'Listo para ser asignado.'}
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
                    <div className="card-header d-flex justify-content-between align-items-center">
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
                                        <th>ENTRADA</th>
                                        <th>APARTAMENTO</th>
                                        <th>PROPIETARIO</th>
                                        <th>TIEMPO</th>
                                        <th>MULTA</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prestamosActivos.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">
                                                No hay préstamos activos
                                            </td>
                                        </tr>
                                    ) : (
                                        prestamosActivos.map(p => (
                                            <tr key={p.id} className={estaVencido(p.horaInicio) ? 'table-danger' : ''}>
                                                <td><i className="bi bi-cart-fill text-primary me-1"></i>{p.nombreCarrito}</td>
                                                <td><i className="bi bi-door-open me-1 text-secondary"></i>{p.nombreEntrada}</td>
                                                <td>Depa {p.numeroApartamento}</td>
                                                <td>{p.propietario}</td>
                                                <td>
                                                    <span className={`badge ${estaVencido(p.horaInicio) ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                        {calcularTiempo(p.horaInicio)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {p.multado
                                                        ? <span className="badge bg-danger">S/ {p.montoMulta}</span>
                                                        : estaVencido(p.horaInicio)
                                                            ? <button className="btn btn-sm btn-danger" onClick={() => handleAplicarMulta(p.id)}>
                                                                <i className="bi bi-exclamation-triangle me-1"></i>Multar
                                                              </button>
                                                            : <span className="text-muted small">—</span>
                                                    }
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
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
                                            <th>ENTRADA</th>
                                            <th>APARTAMENTO</th>
                                            <th>PROPIETARIO</th>
                                            <th>MULTA</th>
                                            <th>ESTADO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historial.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.nombreCarrito}</td>
                                                <td>{p.nombreEntrada}</td>
                                                <td>Depa {p.numeroApartamento}</td>
                                                <td>{p.propietario}</td>
                                                <td>
                                                    {p.multado
                                                        ? <span className="badge bg-danger">S/ {p.montoMulta}</span>
                                                        : <span className="text-muted small">Sin multa</span>
                                                    }
                                                </td>
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
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Entrada / Salida</label>
                                    <select
                                        className="form-select"
                                        value={form.idEntradaSalida}
                                        onChange={e => setForm({ ...form, idEntradaSalida: e.target.value })}
                                    >
                                        <option value="">-- Seleccionar entrada --</option>
                                        {entradas.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.nombre} — {e.nombreCondominio}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Apartamento</label>
                                    <select
                                        className="form-select"
                                        value={form.idApartamento}
                                        onChange={e => setForm({ ...form, idApartamento: e.target.value })}
                                    >
                                        <option value="">-- Seleccionar apartamento --</option>
                                        {apartamentos.map(a => (
                                            <option key={a.id} value={a.id}>
                                                Depa {a.numeroApartamento} — {a.propietario}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="alert alert-warning py-2 small">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Penalización de S/ 5.00 si supera los {TIEMPO_LIMITE} minutos.
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