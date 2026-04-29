import React, { useState } from "react";

const CondominioCard = ({ condominio, carritosActivos, carritosMantenimiento }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="card border-0 shadow-sm h-100"
            style={{
                borderRadius: "16px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
            }}
        >
            {/* Imagen */}
            <div style={{
                height: "180px",
                overflow: "hidden",
                position: "relative",
                borderRadius: "16px 16px 0 0"
            }}>
                {!imgError ? (
                    <img
                        src={condominio.imagen}
                        alt={condominio.nombre}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "var(--bs-tertiary-bg)" }}
                    >
                        <i className="bi bi-building text-primary" style={{ fontSize: "3rem" }}></i>
                    </div>
                )}
                {/* Gradiente oscuro sobre imagen */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)"
                }} />
                {/* Badge */}
                <span
                    className="position-absolute text-white fw-bold"
                    style={{
                        bottom: "12px", left: "14px",
                        background: condominio.badgeColor,
                        fontSize: "10px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        padding: "3px 10px",
                        borderRadius: "999px",
                    }}
                >
                    {condominio.badge}
                </span>
            </div>

            {/* Body */}
            <div className="card-body p-3">
                <h6 className="fw-bold mb-1">{condominio.nombre}</h6>
                <p className="text-muted mb-3" style={{ fontSize: "12px" }}>
                    <i className="bi bi-geo-alt me-1"></i>
                    {condominio.direccion}
                </p>

                {/* Stats */}
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <div
                            className="p-2 rounded-3 text-center"
                            style={{ backgroundColor: "var(--bs-tertiary-bg)" }}
                        >
                            <p className="mb-1 fw-bold text-uppercase"
                                style={{ fontSize: "9px", letterSpacing: "0.8px", color: "var(--bs-secondary-color)" }}>
                                Carritos Activos
                            </p>
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                <span className="fw-bold text-primary fs-5">{carritosActivos}</span>
                                <i className="bi bi-cart text-primary" style={{ fontSize: "14px" }}></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div
                            className="p-2 rounded-3 text-center"
                            style={{ backgroundColor: "var(--bs-tertiary-bg)" }}
                        >
                            <p className="mb-1 fw-bold text-uppercase"
                                style={{ fontSize: "9px", letterSpacing: "0.8px", color: "var(--bs-secondary-color)" }}>
                                Mantenimiento
                            </p>
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                <span className="fw-bold fs-5" style={{ color: "#7f2500" }}>
                                    {String(carritosMantenimiento).padStart(2, "0")}
                                </span>
                                <i className="bi bi-tools" style={{ color: "#7f2500", fontSize: "14px" }}></i>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: "10px", fontWeight: 700, fontSize: "13px" }}
                >
                    Ver Detalles
                    <i className="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

export default CondominioCard;