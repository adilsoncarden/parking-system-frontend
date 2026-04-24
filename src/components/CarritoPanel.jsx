import React from "react";

const CarritoPanel = ({ nombreResidencia = "Residencial Las Palmeras" }) => {
    return (
        <div className="container-fluid">
            {/* Cabecera dinámica */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Gestión de Carritos</h2>
                <p className="text-muted small">
                    <span className="fw-bold text-primary">
                        {nombreResidencia}
                    </span>{" "}
                    - Préstamos y devoluciones de carritos en tiempo real
                </p>
            </div>

            {/* Espacio para el Grid de Tarjetas (Fase siguiente) */}
            <div className="row g-4" id="carritos-grid">
                {/* Aquí se inyectarán las tarjetas de los carritos */}
            </div>
        </div>
    );
};

export default CarritoPanel;
