import { useState, useEffect } from "react";
import { condominioResumenService } from "../../services/condominioResumenService";
import { getApiErrorMessage } from "../../services/api";
import FormField from "./crud/FormField";
import ApartamentoPisoFormModal from "./ApartamentoPisoFormModal";
import ApartamentoDetailModal from "./ApartamentoDetailModal";

const PisoDetailModal = ({ show, piso, condominioId, torre, onClose, onUpdated }) => {
    const [apartamentos, setApartamentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showAddApartamento, setShowAddApartamento] = useState(false);
    
    const [showApartamentoDetail, setShowApartamentoDetail] = useState(false);
    const [selectedApartamento, setSelectedApartamento] = useState(null);

    const loadApartamentos = async (force = false) => {
        if (!piso?.id) return;
        setLoading(true);
        setError("");
        try {
            // Wait 500ms for visual effect
            await new Promise(resolve => setTimeout(resolve, 500));
            const raw = await condominioResumenService.getRaw(force);

            const filteredAptos = raw.apartamentos.filter(a => String(a.pisoId) === String(piso.id));
            
            const aptosWithCounts = filteredAptos.map(a => ({
                ...a,
                nResidentes: raw.usuarios.filter(u => String(u.apartamentoId) === String(a.id)).length
            }));

            // Descending sort so highest number is at the top, bottom is X01
            aptosWithCounts.sort((a, b) => {
                const numA = parseInt(a.numero, 10);
                const numB = parseInt(b.numero, 10);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numB - numA;
                }
                return String(b.numero).localeCompare(String(a.numero));
            });
            setApartamentos(aptosWithCounts);
        } catch (err) {
            setError(getApiErrorMessage(err, "Error al cargar apartamentos del piso"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            loadApartamentos();
        } else {
            setApartamentos([]);
            setError("");
        }
    }, [show, piso]);

    if (!show || !piso) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-semibold">Detalles del Piso</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
                        </div>
                        <div className="modal-body pt-3">
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            
                            <FormField label="Piso">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={`Piso ${piso.numero}`}
                                    readOnly
                                    disabled
                                />
                            </FormField>

                            <div className="mt-4">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle cond-table mb-0">
                                        <thead>
                                            <tr>
                                                <th className="ps-4">Apartamentos</th>
                                                <th className="text-center">Residentes</th>
                                                <th className="pe-4 text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-muted">
                                                        Cargando apartamentos...
                                                    </td>
                                                </tr>
                                            ) : apartamentos.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-muted">
                                                        <i className="bi bi-door-closed d-block fs-4 mb-2"></i>
                                                        Sin apartamentos registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                apartamentos.map((a) => (
                                                    <tr key={a.id}>
                                                        <td className="ps-4">Apt {a.numero}</td>
                                                        <td className="text-center">{a.nResidentes || 0}</td>
                                                        <td className="pe-4 text-end">
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => {
                                                                    setSelectedApartamento(a);
                                                                    setShowApartamentoDetail(true);
                                                                }}
                                                            >
                                                                <i className="bi bi-eye me-1" /> Ver Apartamento
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
                                <button type="button" className="btn btn-primary" onClick={() => setShowAddApartamento(true)}>
                                    Agregar Apartamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddApartamento && (
                <ApartamentoPisoFormModal
                    show={showAddApartamento}
                    piso={piso}
                    torre={torre}
                    existingApartamentos={apartamentos}
                    onClose={() => setShowAddApartamento(false)}
                    onSaved={() => {
                        setShowAddApartamento(false);
                        loadApartamentos(true);
                        onUpdated();
                    }}
                />
            )}

            {showApartamentoDetail && selectedApartamento && (
                <ApartamentoDetailModal
                    show={showApartamentoDetail}
                    apartamento={selectedApartamento}
                    piso={piso}
                    torre={torre}
                    condominioId={condominioId}
                    onClose={() => {
                        setShowApartamentoDetail(false);
                        setSelectedApartamento(null);
                    }}
                    onUpdated={() => {
                        loadApartamentos(true);
                        onUpdated();
                    }}
                />
            )}
        </>
    );
};

export default PisoDetailModal;
