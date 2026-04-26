import React, { useState } from "react";
import PanelPrestarCarrito from "./PanelPrestarCarrito";

const CarritoCard = ({ numero, estado, usuario = "" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isDisponible = estado === "Disponible";

    const handleOpenModal = () => {
        if (isDisponible) {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                    {/* Icono de Carrito */}
                    <div
                        className={`display-4 mb-3 ${isDisponible ? "text-success" : "text-warning"}`}
                    >
                        <i className="bi bi-cart-fill"></i>
                    </div>

                    <h5 className="card-title fw-bold">Carrito #{numero}</h5>

                    {/* Badge de Estado */}
                    <span
                        className={`badge rounded-pill mb-3 ${isDisponible ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                    >
                        {estado}
                    </span>

                    {/* Información adicional */}
                    <p className="card-text text-muted small mb-4">
                        {isDisponible
                            ? "Listo para ser asignado a un residente."
                            : `Asignado actualmente a: ${usuario}`}
                    </p>

                    {/* Botón de Acción */}
                    <div className="d-grid">
                        <button
                            className={`btn ${isDisponible ? "btn-outline-primary" : "btn-primary"} fw-bold`}
                            onClick={handleOpenModal}
                        >
                            {isDisponible
                                ? "Prestar Carrito"
                                : "Gestionar Devolución"}
                        </button>
                    </div>
                </div>
            </div>

            <PanelPrestarCarrito
                show={isModalOpen}
                onClose={handleCloseModal}
                numero={numero}
            />
        </>
    );
};

export default CarritoCard;

