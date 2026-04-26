import React, { useState, useEffect } from "react";
import PanelPrestarCarrito from "./PanelPrestarCarrito";

const CarritoCard = ({ numero, estado, usuario = "", apartamento = "", startTime, onPrestar, onDevolver }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
    const isDisponible = estado === "Disponible";

    useEffect(() => {
        if (!isDisponible && startTime) {
            const calcularTiempo = () => {
                const ahora = Date.now();
                const diferencia = Math.floor((ahora - startTime) / 1000);
                setTiempoTranscurrido(diferencia > 0 ? diferencia : 0);
            };

            calcularTiempo();
            const interval = setInterval(calcularTiempo, 1000);
            return () => clearInterval(interval);
        } else {
            setTiempoTranscurrido(0);
        }
    }, [isDisponible, startTime]);

    const formatearTiempo = (segundos) => {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const excedeLimite = tiempoTranscurrido > 15 * 60;

    const handleOpenModal = () => {
        if (isDisponible) {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirm = (datos) => {
        onPrestar(numero, datos);
        handleCloseModal();
    };

    return (
        <>
            <div className={`card h-100 border-0 shadow-sm position-relative ${!isDisponible ? (excedeLimite ? 'border-danger' : 'border-warning') : ''} ${!isDisponible ? 'border-start border-4' : ''}`}>
                <div className="card-body text-center p-4">
                    {/* Icono de Carrito */}
                    <div
                        className={`display-4 mb-2 ${isDisponible ? "text-success" : (excedeLimite ? "text-danger" : "text-warning")}`}
                        style={{ opacity: isDisponible ? 1 : 0.8 }}
                    >
                        <i className={`bi ${isDisponible ? "bi-cart-fill" : "bi-cart-check-fill"}`}></i>
                    </div>

                    {/* Badge de Estado superior derecho */}
                    <div className="position-absolute top-0 end-0 p-3">
                        <span
                            className={`badge rounded-pill ${isDisponible ? "bg-success-subtle text-success" : (excedeLimite ? "bg-danger text-white" : "bg-warning-subtle text-warning")}`}
                            style={{ fontSize: '0.7rem' }}
                        >
                            {isDisponible ? "Disponible" : (excedeLimite ? "Excedido" : "En Uso")}
                        </span>
                    </div>

                    <h5 className="card-title fw-bold mt-2">Carrito #{numero}</h5>

                    {/* Información adicional */}
                    <div className="mb-4 mt-3" style={{ minHeight: '80px' }}>
                        {isDisponible ? (
                            <p className="card-text text-muted small px-2 py-3">
                                Listo para ser asignado a un residente.
                            </p>
                        ) : (
                            <div className={`text-start p-3 rounded-3 border-0 ${excedeLimite ? "bg-danger-subtle text-danger" : "bg-light"}`}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className={`bi bi-person small ${excedeLimite ? "text-danger" : "text-primary"}`}></i>
                                    <span className="small fw-bold text-dark text-truncate">{usuario}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="bi bi-geo-alt text-muted small"></i>
                                    <span className="small text-muted">{apartamento}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <i className={`bi bi-clock small ${excedeLimite ? "text-danger" : "text-warning"}`}></i>
                                    <span className={`small fw-bold ${excedeLimite ? "text-danger" : "text-warning"}`}>
                                        {formatearTiempo(tiempoTranscurrido)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botón de Acción */}
                    <div className="d-grid">
                        <button
                            className={`btn fw-bold py-2 rounded-3 shadow-sm`}
                            style={{ 
                                backgroundColor: excedeLimite ? "#dc3545" : "#2563EB", 
                                border: "none",
                                color: "white"
                            }}
                            onClick={isDisponible ? handleOpenModal : () => onDevolver(numero)}
                        >
                            {isDisponible ? "Prestar Carrito" : "Devolver"}
                        </button>
                    </div>
                </div>
            </div>

            <PanelPrestarCarrito 
                show={isModalOpen} 
                onClose={handleCloseModal} 
                numero={numero} 
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default CarritoCard;
