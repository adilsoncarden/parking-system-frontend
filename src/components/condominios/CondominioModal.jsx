import { useState } from "react";
import MapaUbicacion from "../shared/MapaUbicacion";
import ImageUploader from "../shared/ImageUploader";
import TipoSelector from "../shared/TipoSelector";

const FORM_VACIO = {
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    estado: "ACTIVO",
    tipo: "residencial",
    imagen: null,
    lat: null,
    lng: null,
};

const CondominioModal = ({ show, onClose, onSave, onDelete, condominioEditar, saving }) => {
    if (!show) return null;
    const editarId = condominioEditar ? condominioEditar.id : "__new__";
    return (
        <CondominioModalInner
            key={editarId}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
            condominioEditar={condominioEditar}
            saving={saving}
        />
    );
};

const CondominioModalInner = ({ onClose, onSave, onDelete, condominioEditar, saving }) => {
    const modoEdicion = !!condominioEditar;

    const [form, setForm] = useState(() => {
        if (condominioEditar) {
            return {
                nombre: condominioEditar.nombre || "",
                direccion: condominioEditar.direccion || "",
                telefono: condominioEditar.telefono || "",
                email: condominioEditar.email || "",
                estado: condominioEditar.estado || "ACTIVO",
                tipo: condominioEditar.tipo || "residencial",
                imagen: condominioEditar.imagen || null,
                lat: condominioEditar.lat || null,
                lng: condominioEditar.lng || null,
            };
        }
        return FORM_VACIO;
    });
    const [direccionConfirmada, setDireccionConfirmada] = useState(!!condominioEditar?.direccion);
    const [error, setError] = useState("");
    const [triggerBuscar, setTriggerBuscar] = useState(0);

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
        setTriggerBuscar((prev) => prev + 1);
        setDireccionConfirmada(true);
        setError("");
    };

    const handleGuardar = () => {
        if (!form.nombre?.trim() || !form.direccion?.trim()) {
            setError("Por favor completa nombre y dirección.");
            return;
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError("El correo electrónico no es válido.");
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
                        <button className="btn-close" onClick={onClose} disabled={saving}></button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger py-2 small">{error}</div>
                        )}

                        <div className="row g-3">
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
                                    disabled={saving}
                                />
                            </div>

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
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleConfirmarDireccion();
                                            }
                                        }}
                                        disabled={saving}
                                    />
                                    <button
                                        type="button"
                                        className={`btn ${direccionConfirmada ? "btn-success" : "btn-outline-success"}`}
                                        onClick={handleConfirmarDireccion}
                                        disabled={saving}
                                    >
                                        <i className="bi bi-check-lg"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold small text-uppercase">Teléfono</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Opcional"
                                    value={form.telefono}
                                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                    disabled={saving}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold small text-uppercase">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="contacto@condominio.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    disabled={saving}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold small text-uppercase">Estado</label>
                                <select
                                    className="form-select"
                                    value={form.estado}
                                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                    disabled={saving}
                                >
                                    <option value="ACTIVO">Activo</option>
                                    <option value="INACTIVO">Inactivo</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold small text-uppercase">
                                    Ubicación en el mapa
                                </label>
                                <MapaUbicacion
                                    direccion={form.direccion}
                                    onUbicacionChange={handleUbicacionChange}
                                    latInicial={form.lat}
                                    lngInicial={form.lng}
                                    triggerBuscar={triggerBuscar}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold small text-uppercase">
                                    Tipo de Condominio
                                </label>
                                <TipoSelector
                                    tipoSeleccionado={form.tipo}
                                    onChange={(tipo) => setForm({ ...form, tipo })}
                                />
                            </div>

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
                        {modoEdicion && onDelete && (
                            <button
                                type="button"
                                className="btn btn-outline-danger me-auto"
                                onClick={onDelete}
                                disabled={saving}
                            >
                                Eliminar
                            </button>
                        )}
                        <button className="btn btn-link text-muted" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary px-4" onClick={handleGuardar} disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    {modoEdicion ? "Guardar Cambios" : "Registrar Propiedad"}
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CondominioModal;
