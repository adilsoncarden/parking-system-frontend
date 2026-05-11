import React, { useState } from "react";

const TorreAgregarCard = ({ onAgregar }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center torre-card"
            style={{
                border: `2px dashed ${hovered ? "var(--bs-primary)" : "var(--bs-border-color)"}`,
                borderRadius: "16px",
                minHeight: "220px",
                cursor: "pointer",
                background: hovered ? "rgba(var(--bs-primary-rgb), 0.05)" : "transparent",
                transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onAgregar && onAgregar()}
        >
            <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "50px", height: "50px", backgroundColor: "rgba(var(--bs-primary-rgb), 0.1)" }}
            >
                <i className="bi bi-plus-lg text-primary fs-4"></i>
            </div>
            <h6 className="fw-bold mb-1">Nueva Torre</h6>
            <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                Añadir torre a este condominio
            </p>
        </div>
    );
};

export default TorreAgregarCard;
