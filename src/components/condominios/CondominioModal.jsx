import { useState } from "react";
import MapaUbicacion from "../shared/MapaUbicacion";
import ImageUploader from "../shared/ImageUploader";
import TipoSelector from "../shared/TipoSelector";

// Estado inicial vacío reusable
const FORM_VACIO = {
    nombre: "",
    direccion: "",
    tipo: "residencial",
    imagen: null,
    lat: null,
    lng: null,
};

// ═══════════════════════════════════════════════════════════
// Wrapper externo: decide si mostrar el modal y qué key usar
// El key obliga a React a recrear el componente cuando cambia
// el item a editar (sin necesidad de useEffect)
// ═══════════════════════════════════════════════════════════
const CondominioModal = ({ show, onClose, onSave, condominioEditar }) => {
    if (!show) return null;
    const editarId = condominioEditar ? condominioEditar.id : "__new__";
    return (
        <CondominioModalInner
            key={editarId}
            onClose={onClose}
            onSave={onSave}
            condominioEditar={condominioEditar}
        />
    );
};

// ═══════════════════════════════════════════════════════════
// Modal real con estado interno
// ═══════════════════════════════════════════════════════════
const CondominioModalInner = ({ onClose, onSave, condominioEditar }) => {
    const modoEdicion = !!condominioEditar;

    // Estado inicial calculado SIN useEffect
    const [form, setForm] = useState(() => {
        if (condominioEditar) {
            return {
                nombre:    condominioEditar.nombre    || "",
                direccion: condominioEditar.direccion || "",
                tipo:      condominioEditar.tipo      || "residencial",
                imagen:    condominioEditar.imagen    || null,
                lat:       condominioEditar.lat       || null,
                lng:       condominioEditar.lng       || null,
            };
        }
        return FORM_VACIO;
    });
    const [direccionConfirmada, setDireccionConfirmada] = useState(!!condominioEditar?.direccion);
    const [error, setError] = useState("");

    const handleUbicacionChange = ({ lat, lng, direccionFormateada }) => {
        setForm((prev) => ({
            ...prev,
            lat,
            lng,
            direccion: direccionFormateada || prev.direccion,
        }));
        setDireccionConfirmada(true);
    };

    const handleConfirmarDireccion = () => {
        if (!form.direccion || form.direccion.trim() === "") {
            setError("Escribe primero una dirección o selecciónala en el mapa.");
            return;
        }
        setDireccionConfirmada(true);
        setError("");
    };

    const handleGuardar = () => {
        if (!form.nombre || !form.direccion || !form.tipo) {
            setError("Por favor completa todos los campos.");
            return;
        }
        onSave({ ...form });
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title fw-bold">
                                {modoEdicion ? "Editar Condominio" : "Registrar Nuevo Condominio"}
                            </h5>
                            <small className="text-muted">
                                {modoEdicion
                                    ? "Modifica los detalles de la propiedad."
                                    : "Ingresa los detalles de la nueva propiedad."}
                            </small>
                        </div>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger py-2 small">{error}</div>
                        )}

                        <div className="row g-3">
                            {/* Nombre */}
                            <div className="col-12 col-md-6">
                                <label htmlFor="condo-nombre" className="form-label fw-bold small text-uppercase">
                                    Nombre del Condominio
                                </label>
                                <input
                                    id="condo-nombre"
                                    type="text"
                                    className="form-control"
                                    placeholder="ej. Torre Lumina Este"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                />
                            </div>

                            {/* Dirección con botón check */}
                            <div className="col-12 col-md-6">
                                <label htmlFor="condo-direccion" className="form-label fw-bold small text-uppercase">
                                    Dirección
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-geo-alt text-primary"></i>
                                    </span>
                                    <input
                                        id="condo-direccion"
                                        type="text"
                                        className="form-control"
                                        placeholder="Ingresa la dirección"
                                        value={form.direccion}
                                        onChange={(e) => {
                                            setForm({ ...form, direccion: e.target.value });
                                            setDireccionConfirmada(false);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className={`btn ${direccionConfirmada ? "btn-success" : "btn-outline-success"}`}
                                        onClick={handleConfirmarDireccion}
                                        title="Confirmar dirección"
                                    >
                                        <i className="bi bi-check-lg"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Mapa */}
                            <div className="col-12">
                                <label className="form-label fw-bold small text-uppercase">
                                    Ubicación en el mapa
                                </label>
                                <MapaUbicacion
                                    direccion={form.direccion}
                                    onUbicacionChange={handleUbicacionChange}
                                    latInicial={form.lat}
                                    lngInicial={form.lng}
                                />
                            </div>

                            {/* Tipo de condominio */}
                            <div className="col-12">
                                <label className="form-label fw-bold small text-uppercase">
                                    Tipo de Condominio
                                </label>
                                <TipoSelector
                                    tipoSeleccionado={form.tipo}
                                    onChange={(tipo) => setForm({ ...form, tipo })}
                                />
                            </div>

                            {/* Imagen */}
                            <div className="col-12">
                                <label className="form-label fw-bold small text-uppercase">
                                    Imagen del Condominio
                                </label>
                                <ImageUploader
                                    imagenInicial={form.imagen}
                                    onImagenChange={(imagen) => setForm({ ...form, imagen })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-link text-muted" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary px-4" onClick={handleGuardar}>
                            {modoEdicion ? "Guardar Cambios" : "Registrar Propiedad"}
                            <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CondominioModal;