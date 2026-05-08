import React, { useState } from "react";

// ═══════════════════════════════════════════════════════════
// Solo la tarjeta visual "Agregar Condominio".
// El modal de registrar/editar vive en CondominioModal.jsx
// y se controla desde CondominiosPage.jsx
// ═══════════════════════════════════════════════════════════
const CondominioAgregarCard = ({ onAgregar }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center"
            style={{
                border: `2px dashed ${hovered ? "#4e6ef2" : "var(--bs-border-color)"}`,
                borderRadius: "16px",
                minHeight: "320px",
                cursor: "pointer",
                background: hovered ? "var(--bs-tertiary-bg)" : "transparent",
                transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onAgregar && onAgregar()}
        >
            <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "64px", height: "64px", backgroundColor: "var(--bs-tertiary-bg)" }}
            >
                <i className="bi bi-building-add text-primary fs-3"></i>
            </div>
            <h6 className="fw-bold mb-2">Agregar Condominio</h6>
            <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Registra una nueva propiedad en tu portafolio.
            </p>
            <span className="text-primary fw-bold d-flex align-items-center gap-1" style={{ fontSize: "13px" }}>
                Comenzar <i className="bi bi-arrow-up-right"></i>
            </span>
        </div>
    );
};

export default CondominioAgregarCard;