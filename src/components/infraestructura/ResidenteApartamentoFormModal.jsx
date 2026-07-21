import { useState, useEffect } from "react";
import { usuarioService } from "../../services/usuarioService";
import FormField from "./crud/FormField";
import { showSuccess, showError } from "../../utils/swalHelpers";

const ResidenteApartamentoFormModal = ({ show, residenteEdit, apartamento, condominioId, existingResidentes, onClose, onSaved }) => {
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show && residenteEdit) {
            setNombreCompleto(`${residenteEdit.nombres || ""} ${residenteEdit.apellidos || ""}`.trim());
            setEmail(residenteEdit.email || "");
        } else if (show) {
            setNombreCompleto("");
            setEmail("");
        }
    }, [show, residenteEdit]);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const nameTrimmed = nombreCompleto.trim();
        if (!nameTrimmed) {
            setError("El nombre del residente es obligatorio");
            return;
        }

        const nameParts = nameTrimmed.split(" ");
        const nombres = nameParts[0];
        const apellidos = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // Check for duplicates (ignoring self if editing)
        const exists = existingResidentes.some(
            (r) => 
                r.id !== residenteEdit?.id &&
                ((r.nombres?.toLowerCase() === nombres.toLowerCase() && 
                 r.apellidos?.toLowerCase() === apellidos.toLowerCase()) ||
                (email && r.email?.toLowerCase() === email.trim().toLowerCase()))
        );

        if (exists) {
            setError("Ya existe un residente con este nombre o email en este apartamento");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                nombres,
                apellidos,
                email: email.trim() || undefined,
                estado: residenteEdit ? residenteEdit.estado : "ACTIVO",
                rolId: 3, // Hardcoded role ID for Residente
                tipoOcupante: residenteEdit ? residenteEdit.tipoOcupante : "PROPIETARIO",
                password: "password123", // Default password
                condominioId,
                apartamentoId: apartamento.id
            };

            if (residenteEdit) {
                await usuarioService.update(residenteEdit.id, payload);
                showSuccess("Residente actualizado correctamente");
            } else {
                await usuarioService.create(payload);
                showSuccess("Residente agregado correctamente");
            }
            onSaved();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Error al guardar residente";
            setError(msg);
            showError("No se pudo guardar", msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title fw-semibold">
                            {residenteEdit ? "Editar residente" : "Agregar Residente"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Cerrar"
                        />
                    </div>
                    <div className="modal-body pt-3">
                        {error && <div className="alert alert-danger py-2">{error}</div>}
                        <form onSubmit={handleSubmit} id="residenteForm">
                            <FormField label="Apartamento" required>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={apartamento.numero}
                                    disabled
                                    readOnly
                                />
                            </FormField>
                            
                            <FormField label={residenteEdit ? "Residente" : "Nuevo residente"} required>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={nombreCompleto}
                                    onChange={(e) => setNombreCompleto(e.target.value)}
                                    placeholder="Nombre y Apellido"
                                    disabled={saving}
                                    autoFocus
                                />
                            </FormField>

                            <FormField label="Email">
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Opcional"
                                    disabled={saving}
                                />
                            </FormField>
                        </form>
                    </div>
                    <div className="modal-footer border-top-0 pt-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" form="residenteForm" className="btn btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Guardando...
                                </>
                            ) : residenteEdit ? (
                                "Guardar"
                            ) : (
                                "Agregar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidenteApartamentoFormModal;
