import { useState, useEffect } from "react";
import { condominioResumenService } from "../../services/condominioResumenService";
import { getApiErrorMessage } from "../../services/api";
import { usuarioService } from "../../services/usuarioService";
import { confirmAction, showSuccess, showError } from "../../utils/swalHelpers";
import FormField from "./crud/FormField";
import ResidenteApartamentoFormModal from "./ResidenteApartamentoFormModal";
import ResidenteTemporalFormModal from "./ResidenteTemporalFormModal";

const ApartamentoDetailModal = ({ show, apartamento, piso, torre, condominioId, onClose, onUpdated }) => {
    const [residentes, setResidentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showAddResidente, setShowAddResidente] = useState(false);
    const [showAddResidenteTemporal, setShowAddResidenteTemporal] = useState(false);
    const [residenteEdit, setResidenteEdit] = useState(null);

    const loadResidentes = async (force = false) => {
        if (!apartamento?.id) return;
        setLoading(true);
        setError("");
        try {
            // Wait 500ms for visual effect
            await new Promise(resolve => setTimeout(resolve, 500));
            const raw = await condominioResumenService.getRaw(force);

            const filteredResidentes = raw.usuarios.filter(u => String(u.apartamentoId) === String(apartamento.id));
            
            // Sort: VISITANTE first, then alphabetically by name
            filteredResidentes.sort((a, b) => {
                if (a.tipoOcupante === "VISITANTE" && b.tipoOcupante !== "VISITANTE") return -1;
                if (b.tipoOcupante === "VISITANTE" && a.tipoOcupante !== "VISITANTE") return 1;
                
                const nameA = `${a.nombres || ""} ${a.apellidos || ""}`.trim().toLowerCase();
                const nameB = `${b.nombres || ""} ${b.apellidos || ""}`.trim().toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            setResidentes(filteredResidentes);
        } catch (err) {
            setError(getApiErrorMessage(err, "Error al cargar residentes del apartamento"));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResidente = async (residente) => {
        const nombreCompleto = `${residente.nombres || ""} ${residente.apellidos || ""}`.trim();
        const confirmed = await confirmAction({
            title: "¿Deseas eliminar este residente?",
            text: `"${nombreCompleto}"`,
            confirmText: "Sí, eliminar",
            cancelText: "Cancelar",
        });

        if (!confirmed) return;

        try {
            await usuarioService.delete(residente.id);
            showSuccess("Residente eliminado correctamente");
            loadResidentes(true);
            onUpdated();
        } catch (err) {
            showError("No se pudo eliminar", getApiErrorMessage(err));
        }
    };

    const handleEditResidente = (residente) => {
        setResidenteEdit(residente);
        setShowAddResidente(true);
    };

    useEffect(() => {
        if (show) {
            loadResidentes();
        } else {
            setResidentes([]);
            setError("");
        }
    }, [show, apartamento]);

    if (!show || !apartamento) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-semibold">Detalles del Apartamento</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
                        </div>
                        <div className="modal-body pt-3">
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            
                            <FormField label="Apartamento">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={apartamento.numero}
                                    readOnly
                                    disabled
                                />
                            </FormField>

                            <div className="mt-4">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle cond-table mb-0">
                                        <thead>
                                            <tr>
                                                <th className="ps-4">Residentes</th>
                                                <th>Email</th>
                                                <th className="pe-4 text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-muted">
                                                        Cargando residentes...
                                                    </td>
                                                </tr>
                                            ) : residentes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-muted">
                                                        <i className="bi bi-person-x d-block fs-4 mb-2"></i>
                                                        Sin residentes registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                residentes.map((r) => {
                                                    const isTemporal = r.tipoOcupante === "VISITANTE";
                                                    let diasRestantes = null;
                                                    if (isTemporal && r.email && r.email.includes("@temporal.com")) {
                                                        const match = r.email.match(/visitante_(\d+)_/);
                                                        if (match && match[1]) {
                                                            const timestamp = parseInt(match[1], 10);
                                                            diasRestantes = Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
                                                        }
                                                    }

                                                    return (
                                                        <tr key={r.id}>
                                                            <td className="ps-4">
                                                                {`${r.nombres || ""} ${r.apellidos || ""}`.trim()}
                                                                {isTemporal && (
                                                                    <span 
                                                                        className="badge bg-success ms-2 rounded-circle px-2"
                                                                        title={diasRestantes !== null ? `Le quedan ${diasRestantes} días` : "Visitante"}
                                                                    >
                                                                        <i className="bi bi-clock"></i>
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {r.email && !isTemporal ? (
                                                                    <span className="text-muted">{r.email}</span>
                                                                ) : (
                                                                    <span className="text-muted">—</span>
                                                                )}
                                                            </td>
                                                            <td className="pe-4 text-end">
                                                                {!isTemporal && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-primary me-2 border-0"
                                                                        style={{ backgroundColor: "rgba(67, 94, 190, 0.1)" }}
                                                                        title="Editar"
                                                                        onClick={() => handleEditResidente(r)}
                                                                    >
                                                                        <i className="bi bi-pencil" />
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger border-0"
                                                                    style={{ backgroundColor: "rgba(220, 53, 69, 0.1)" }}
                                                                    title="Eliminar"
                                                                    onClick={() => handleDeleteResidente(r)}
                                                                >
                                                                    <i className="bi bi-trash" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cerrar
                            </button>
                            <div className="ms-auto d-flex gap-2">
                                <button type="button" className="btn btn-success" onClick={() => setShowAddResidenteTemporal(true)}>
                                    Agregar Visitante
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    setResidenteEdit(null);
                                    setShowAddResidente(true);
                                }}>
                                    Agregar Residente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddResidente && (
                <ResidenteApartamentoFormModal
                    show={showAddResidente}
                    residenteEdit={residenteEdit}
                    apartamento={apartamento}
                    piso={piso}
                    torre={torre}
                    condominioId={condominioId}
                    existingResidentes={residentes}
                    onClose={() => setShowAddResidente(false)}
                    onSaved={() => {
                        setShowAddResidente(false);
                        loadResidentes(true);
                        onUpdated();
                    }}
                />
            )}

            {showAddResidenteTemporal && (
                <ResidenteTemporalFormModal
                    show={showAddResidenteTemporal}
                    apartamento={apartamento}
                    condominioId={condominioId}
                    existingResidentes={residentes}
                    onClose={() => setShowAddResidenteTemporal(false)}
                    onSaved={() => {
                        setShowAddResidenteTemporal(false);
                        loadResidentes(true);
                        onUpdated();
                    }}
                />
            )}
        </>
    );
};

export default ApartamentoDetailModal;
