import { useState } from "react";
import { usuarioService } from "../../services/usuarioService";
import FormField from "./crud/FormField";
import { showSuccess, showError } from "../../utils/swalHelpers";

const ResidenteTemporalFormModal = ({ show, apartamento, condominioId, existingResidentes, onClose, onSaved }) => {
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [dias, setDias] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const nameTrimmed = nombreCompleto.trim();
        if (!nameTrimmed) {
            setError("El nombre del visitante es obligatorio");
            return;
        }

        const diasNum = parseInt(dias, 10);
        if (isNaN(diasNum) || diasNum < 1 || diasNum > 30) {
            setError("la cantidad de días debe ser entre 1 a 30");
            return;
        }

        const nameParts = nameTrimmed.split(" ");
        const nombres = nameParts[0];
        const apellidos = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // Check for duplicates
        const exists = existingResidentes.some(
            (r) => 
                (r.nombres?.toLowerCase() === nombres.toLowerCase() && 
                 r.apellidos?.toLowerCase() === apellidos.toLowerCase())
        );

        if (exists) {
            setError("Ya existe un residente o visitante con este nombre en este apartamento");
            return;
        }

        setSaving(true);
        try {
            // Calculate expiration timestamp
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + diasNum);
            const expirationTimestamp = expirationDate.getTime();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const emailHack = `visitante_${expirationTimestamp}_${randomSuffix}@temporal.com`;

            const payload = {
                nombres,
                apellidos,
                email: emailHack, // Store expiration data and ensure uniqueness
                estado: "ACTIVO",
                rolId: 3, // Hardcoded role ID for Residente
                tipoOcupante: "VISITANTE", // Use backend allowed enum
                telefono: null,
                password: "password123", // Default password
                condominioId,
                apartamentoId: apartamento.id
            };

            await usuarioService.create(payload);
            showSuccess("Visitante agregado correctamente");
            onSaved();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Error al agregar visitante";
            setError(msg);
            showError("No se pudo agregar", msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title fw-semibold">Agregar Visitante</h5>
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
                        <form onSubmit={handleSubmit} id="residenteTemporalForm">
                            <FormField label="Apartamento" required>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={apartamento.numero}
                                    disabled
                                    readOnly
                                />
                            </FormField>
                            
                            <FormField label="Visitante" required>
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

                            <FormField label="Tiempo de Residencia (En Días)" required>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={dias}
                                    onChange={(e) => setDias(e.target.value)}
                                    placeholder="Mínimo 1 día / Máximo 30 días"
                                    disabled={saving}
                                    min="1"
                                    max="30"
                                />
                            </FormField>
                        </form>
                    </div>
                    <div className="modal-footer border-top-0 pt-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" form="residenteTemporalForm" className="btn btn-success" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Guardando...
                                </>
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

export default ResidenteTemporalFormModal;
