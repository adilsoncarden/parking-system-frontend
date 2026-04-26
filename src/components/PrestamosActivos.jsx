import React, { useState, useEffect } from "react";

// Sub-componente para manejar el cronómetro de cada fila
const FilaPrestamo = ({ prestamo, onDevolver }) => {
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
    const limiteTiempo = 1 * 60; // 15 minutos en segundos

    useEffect(() => {
        const calcularTiempo = () => {
            const ahora = Date.now();
            const diferencia = Math.floor((ahora - prestamo.startTime) / 1000);
            setTiempoTranscurrido(diferencia > 0 ? diferencia : 0);
        };

        calcularTiempo();
        const interval = setInterval(calcularTiempo, 1000);

        return () => clearInterval(interval);
    }, [prestamo.startTime]);

    const formatearTiempo = (segundos) => {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const excedeLimite = tiempoTranscurrido > limiteTiempo;

    return (
        <tr className={excedeLimite ? "blink-red" : ""}>
            <td className="px-4 fw-bold">Carrito #{prestamo.numero}</td>
            <td>{prestamo.apartamento}</td>
            <td>{prestamo.propietario}</td>
            <td className="text-center">
                <span className={`fw-bold ${excedeLimite ? "text-danger" : "text-warning"}`}>
                    {formatearTiempo(tiempoTranscurrido)}
                </span>
            </td>
            <td className="text-center">
                <span className={`badge rounded-pill px-3 ${excedeLimite ? "bg-danger text-white" : "bg-warning-subtle text-warning"}`}>
                    {excedeLimite ? "Tiempo excedido" : "En uso"}
                </span>
            </td>
            <td className="text-end px-4">
                <button
                    className="btn btn-primary btn-sm px-3 rounded-2 fw-semibold"
                    onClick={() => onDevolver(prestamo.id)}
                    style={{ backgroundColor: "#2563EB", border: "none" }}
                >
                    Devolver
                </button>
            </td>
        </tr>
    );
};

const PrestamosActivos = ({ prestamos, onDevolver }) => {
    return (
        <>
            <style>
                {`
                @keyframes blink-bg {
                    0% { background-color: transparent; }
                    50% { background-color: rgba(220, 53, 69, 0.12); }
                    100% { background-color: transparent; }
                }
                .blink-red {
                    animation: blink-bg 1.5s infinite;
                }
                .blink-red td {
                    color: #dc3545;
                }
                `}
            </style>
            <div className="card border-0 shadow-sm mt-5 overflow-hidden">
                <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-clock text-warning fs-5"></i>
                        <h5 className="mb-0 fw-bold">Préstamos Activos</h5>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="px-4 py-3 border-0">Carrito</th>
                                <th className="py-3 border-0">Apartamento</th>
                                <th className="py-3 border-0">Propietario</th>
                                <th className="py-3 border-0 text-center">Tiempo</th>
                                <th className="py-3 border-0 text-center">Estado</th>
                                <th className="py-3 border-0 text-end px-4">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="border-0">
                            {prestamos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <i className="bi bi-inbox fs-2 opacity-25"></i>
                                            <span>No hay préstamos activos en este momento.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                prestamos.map((prestamo) => (
                                    <FilaPrestamo
                                        key={prestamo.id}
                                        prestamo={prestamo}
                                        onDevolver={onDevolver}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default PrestamosActivos;
