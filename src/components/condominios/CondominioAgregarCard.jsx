import React, { useState } from "react";

const CondominioAgregarCard = () => {
    const [hovered, setHovered] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ nombre: "", direccion: "" });
    const [torres, setTorres] = useState(1);
    const [error, setError] = useState("");

    const handleGuardar = () => {
        if (!form.nombre || !form.direccion) {
            setError("Por favor completa todos los campos.");
            return;
        }
        alert(`Condominio "${form.nombre}" registrado.\nPróximamente conectado al backend.`);
        setShowModal(false);
        setForm({ nombre: "", direccion: "" });
        setTorres(1);
        setError("");
    };

    const handleCerrar = () => {
        setShowModal(false);
        setForm({ nombre: "", direccion: "" });
        setTorres(1);
        setError("");
    };

    return (
        <>
            {/* Tarjeta punteada */}
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
                onClick={() => setShowModal(true)}
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

            {/* Modal */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
                    onClick={handleCerrar}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-content" style={{ borderRadius: "16px" }}>

                            {/* Header */}
                            <div className="modal-header">
                                <div>
                                    <h5 className="modal-title fw-bold mb-0">
                                        Registrar Nuevo Condominio
                                    </h5>
                                    <p className="text-muted small mb-0">
                                        Ingresa los detalles de la nueva propiedad.
                                    </p>
                                </div>
                                <button className="btn-close" onClick={handleCerrar}></button>
                            </div>

                            {/* Body */}
                            <div className="modal-body p-4">
                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}

                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold"
                                            style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                                            Nombre del Condominio
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="ej. Torre Lumina Este"
                                            style={{ borderRadius: "10px" }}
                                            value={form.nombre}
                                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold"
                                            style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                                            Dirección
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text" style={{ borderRadius: "10px 0 0 10px" }}>
                                                <i className="bi bi-geo-alt text-primary"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ingresa la dirección"
                                                style={{ borderRadius: "0 10px 10px 0" }}
                                                value={form.direccion}
                                                onChange={e => setForm({ ...form, direccion: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Torres counter */}
                                <div>
                                    <label className="form-label fw-bold"
                                        style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                                        Total Torres
                                    </label>
                                    <div
                                        className="d-flex align-items-center gap-3 p-3 rounded-3"
                                        style={{ backgroundColor: "var(--bs-tertiary-bg)", width: "fit-content" }}
                                    >
                                        <button
                                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: "32px", height: "32px" }}
                                            onClick={() => setTorres(Math.max(1, torres - 1))}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <span className="fw-bold fs-4 text-primary">
                                            {String(torres).padStart(2, "0")}
                                        </span>
                                        <button
                                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: "32px", height: "32px" }}
                                            onClick={() => setTorres(torres + 1)}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="modal-footer" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                <button
                                    className="btn btn-link text-primary fw-bold text-decoration-none"
                                    onClick={handleCerrar}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
                                    style={{ borderRadius: "10px" }}
                                    onClick={handleGuardar}
                                >
                                    Registrar Propiedad
                                    <i className="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CondominioAgregarCard;