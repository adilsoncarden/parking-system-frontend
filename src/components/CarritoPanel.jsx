import React, { useState } from "react";
import CarritoCard from "./CarritoCard";
import PrestamosActivos from "./PrestamosActivos";

const CarritoPanel = ({ nombreResidencia = "Residencial Las Palmeras" }) => {
    // Estado inicial de los carritos
    const [carritos, setCarritos] = useState([
        { id: 1, numero: "1", estado: "Disponible", usuario: "", apartamento: "", startTime: null },
        { id: 2, numero: "2", estado: "Disponible", usuario: "", apartamento: "", startTime: null },
        { id: 3, numero: "3", estado: "Disponible", usuario: "", apartamento: "", startTime: null },
        { id: 4, numero: "4", estado: "Disponible", usuario: "", apartamento: "", startTime: null },
    ]);

    // Función para prestar un carrito
    const handlePrestar = (numero, datos) => {
        setCarritos(prev => prev.map(c => 
            c.numero === numero 
                ? { ...c, estado: "Prestado", usuario: datos.propietario, apartamento: datos.apartamento, startTime: Date.now() } 
                : c
        ));
    };

    // Función para devolver un carrito
    const handleDevolver = (id) => {
        setCarritos(prev => prev.map(c => 
            (c.id === id || c.numero === id)
                ? { ...c, estado: "Disponible", usuario: "", apartamento: "", startTime: null } 
                : c
        ));
    };

    // Filtrar los carritos que están prestados para la tabla de abajo
    const prestamosActivos = carritos.filter(c => c.estado === "Prestado").map(c => ({
        id: c.id,
        numero: c.numero,
        apartamento: c.apartamento,
        propietario: c.usuario,
        startTime: c.startTime
    }));

    return (
        <div className="container-fluid pb-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Gestión de Carritos</h2>
                <p className="text-muted small">
                    <span className="text-primary fw-bold">
                        {nombreResidencia}
                    </span>{" "}
                    • Préstamos y devoluciones
                </p>
            </div>

            {/* Grid de Carritos */}
            <div className="row g-4">
                {carritos.map((carrito) => (
                    <div className="col-12 col-md-6 col-lg-3" key={carrito.id}>
                        <CarritoCard
                            numero={carrito.numero}
                            estado={carrito.estado}
                            usuario={carrito.usuario}
                            apartamento={carrito.apartamento}
                            startTime={carrito.startTime}
                            onPrestar={handlePrestar}
                            onDevolver={() => handleDevolver(carrito.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Tabla de Préstamos Activos */}
            <div className="mt-2">
                <PrestamosActivos 
                    prestamos={prestamosActivos} 
                    onDevolver={handleDevolver} 
                />
            </div>
        </div>
    );
};

export default CarritoPanel;
