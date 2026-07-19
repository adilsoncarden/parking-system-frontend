import { useState, useEffect } from "react";
import { condominioResumenService } from "../../services/condominioResumenService";
import { getApiErrorMessage } from "../../services/api";
import FormField from "./crud/FormField";
import TorreEditNameModal from "./TorreEditNameModal";
import PisoTorreFormModal from "./PisoTorreFormModal";
import PisoDetailModal from "./PisoDetailModal";

const TorreDetailModal = ({ show, torre, condominioId, onClose, onUpdated }) => {
    const [pisos, setPisos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showEditName, setShowEditName] = useState(false);
    const [showAddPiso, setShowAddPiso] = useState(false);

    const [showPisoDetail, setShowPisoDetail] = useState(false);
    const [selectedPiso, setSelectedPiso] = useState(null);

    const loadPisos = async (force = false) => {
        if (!torre?.id) return;
        setLoading(true);
        setError("");
        try {
            // Wait 500ms for visual effect
            await new Promise(resolve => setTimeout(resolve, 500));
            const raw = await condominioResumenService.getRaw(force);
            
            const filteredPisos = raw.pisos.filter(p => String(p.torreId) === String(torre.id));
            
            const pisosWithCounts = filteredPisos.map(p => ({
                ...p,
                nApartamentos: raw.apartamentos.filter(a => String(a.pisoId) === String(p.id)).length
            }));

            // Sort ascending from bottom to top (which means descending order visually)
            pisosWithCounts.sort((a, b) => b.numero - a.numero);
            setPisos(pisosWithCounts);
        } catch (err) {
            setError(getApiErrorMessage(err, "Error al cargar pisos de la torre"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            loadPisos();
        } else {
            setPisos([]);
            setError("");
        }
    }, [show, torre]);

    if (!show || !torre) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-semibold">Detalles de la Torre</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
                        </div>
                        <div className="modal-body pt-3">
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            
                            <FormField label="Nombre">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={torre.nombre}
                                    readOnly
                                    disabled
                                />
                            </FormField>

                            <div className="mt-4">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle cond-table mb-0">
                                        <thead>
                                            <tr>
                                                <th className="ps-4">Pisos</th>
                                                <th className="text-center">Apartamentos</th>
                                                <th className="pe-4 text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-muted">
                                                        Cargando pisos...
                                                    </td>
                                                </tr>
                                            ) : pisos.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-muted">
                                                        <i className="bi bi-layers d-block fs-4 mb-2"></i>
                                                        Sin pisos registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                pisos.map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="ps-4">Piso {p.numero}</td>
                                                        <td className="text-center">{p.nApartamentos || 0}</td>
                                                        <td className="pe-4 text-end">
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => {
                                                                    setSelectedPiso(p);
                                                                    setShowPisoDetail(true);
                                                                }}
                                                            >
                                                                <i className="bi bi-eye me-1" /> Ver Piso
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
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
                            <div className="ms-auto">
                                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowEditName(true)}>
                                    Editar Nombre
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => setShowAddPiso(true)}>
                                    Agregar Piso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showEditName && (
                <TorreEditNameModal
                    show={showEditName}
                    torre={torre}
                    onClose={() => setShowEditName(false)}
                    onSaved={() => {
                        setShowEditName(false);
                        onUpdated();
                    }}
                />
            )}

            {showAddPiso && (
                <PisoTorreFormModal
                    show={showAddPiso}
                    torre={torre}
                    existingPisos={pisos}
                    onClose={() => setShowAddPiso(false)}
                    onSaved={() => {
                        setShowAddPiso(false);
                        loadPisos(true);
                        onUpdated();
                    }}
                />
            )}

            {showPisoDetail && selectedPiso && (
                <PisoDetailModal
                    show={showPisoDetail}
                    piso={selectedPiso}
                    torre={torre}
                    condominioId={condominioId}
                    onClose={() => {
                        setShowPisoDetail(false);
                        setSelectedPiso(null);
                    }}
                    onUpdated={() => {
                        loadPisos(true);
                        onUpdated();
                    }}
                />
            )}
        </>
    );
};

export default TorreDetailModal;
