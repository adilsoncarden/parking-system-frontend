import React, { useState } from "react";

const PanelPrestarCarrito = ({ show, onClose, numero, onConfirm }) => {
    const [busqueda, setBusqueda] = useState("");

    if (!show) return null;

    const handleConfirm = () => {
        // Simulamos la selección de un residente basado en la búsqueda
        onConfirm({
            apartamento: "Torre A-101",
            propietario: "Carlos Mendoza Ríos"
        });
        setBusqueda("");
    };

    return (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
            style={{ 
                backgroundColor: "rgba(0, 0, 0, 0.4)", 
                zIndex: 1050,
                backdropFilter: "blur(4px)"
            }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-4 shadow-lg p-4" 
                style={{ maxWidth: "500px", width: "95%" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 text-center">
                    <h4 className="fw-bold mb-1">Prestar Carrito #{numero}</h4>
                    <p className="text-muted small">Busque el apartamento que lo solicitó</p>
                </div>

                <div className="mb-4">
                    <div className="input-group border rounded-3 p-1 shadow-sm bg-light">
                        <span className="input-group-text bg-transparent border-0 text-muted">
                            <i className="bi bi-search"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-0 shadow-none bg-transparent" 
                            placeholder="Torre A-101 - Carlos Mendoza Ríos"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                <div 
                    className="alert d-flex align-items-center gap-3 border-0 rounded-3 mb-4" 
                    style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
                >
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div className="small fw-medium">
                        Penalización de S/ 5.00 si supera los 15 minutos de préstamo.
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <button 
                        className="btn btn-light w-100 py-2 fw-semibold rounded-3 border" 
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm"
                        style={{ backgroundColor: "#2563EB", border: "none" }}
                        onClick={handleConfirm}
                    >
                        Confirmar Préstamo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanelPrestarCarrito;
