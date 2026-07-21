import { useState, useEffect } from "react";
import { pisoService } from "../../services/pisoService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";

const PisoTorreFormModal = ({ show, torre, existingPisos, onClose, onSaved }) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [nextPiso, setNextPiso] = useState("");

    useEffect(() => {
        if (show && torre) {
            setError("");
            if (existingPisos && existingPisos.length > 0) {
                const maxPiso = Math.max(...existingPisos.map(p => Number(p.numero) || 0));
                setNextPiso(maxPiso + 1);
            } else {
                setNextPiso(1);
            }
        }
    }, [show, torre, existingPisos]);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const payload = {
                numero: nextPiso,
                torreId: torre.id,
            };
            const result = await pisoService.create(payload);
            await showSuccess("Piso agregado correctamente.");
            onSaved?.(result);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al agregar el piso");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title="Agregar Piso"
            error={error}
            saving={saving}
            onClose={onClose}
            onSave={handleSave}
            saveText="Agregar"
        >
            <FormField label="Torre" required>
                <input
                    type="text"
                    className="form-control"
                    value={torre?.nombre || ""}
                    disabled
                    readOnly
                />
            </FormField>

            <FormField label="Nuevo número de piso" required>
                <input
                    type="text"
                    className="form-control"
                    value={nextPiso}
                    disabled
                    readOnly
                />
            </FormField>
        </CrudModal>
    );
};

export default PisoTorreFormModal;
