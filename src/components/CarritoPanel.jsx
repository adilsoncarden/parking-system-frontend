import React from "react";
import CarritoCard from "./CarritoCard"; // Importante importar

const CarritoPanel = ({ nombreResidencia = "Residencial Las Palmeras" }) => {
    // Datos de prueba para ver los cuadros
    const carritosEjemplo = [
        { id: 1, numero: "001", estado: "Disponible" },
        { id: 2, numero: "002", estado: "Prestado", usuario: "Apto 402" },
        { id: 3, numero: "003", estado: "Disponible" },
    ];

    return (
        <div className="container-fluid">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Gestión de Carritos</h2>
                <p className="text-muted small">
                    <span className="text-primary fw-bold">
                        {nombreResidencia}
                    </span>{" "}
                    - Préstamos y devoluciones en tiempo real
                </p>
            </div>

            {/* Grid donde se muestran los cuadros */}
            <div className="row g-4">
                {carritosEjemplo.map((carrito) => (
                    <div className="col-12 col-md-6 col-lg-4" key={carrito.id}>
                        <CarritoCard
                            numero={carrito.numero}
                            estado={carrito.estado}
                            usuario={carrito.usuario}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarritoPanel;
