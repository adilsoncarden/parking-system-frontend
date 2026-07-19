import { useState, useEffect } from "react";
import { apartamentoService } from "../../services/apartamentoService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";

const ApartamentoPisoFormModal = ({ show, piso, torre, existingApartamentos, onClose, onSaved }) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [nextApto, setNextApto] = useState("");

    useEffect(() => {
        if (show && piso) {
            setError("");
            if (existingApartamentos && existingApartamentos.length > 0) {
                const maxApto = Math.max(...existingApartamentos.map(a => Number(a.numero) || 0));
                setNextApto(maxApto + 1);
            } else {
                // Format: X01 where X is piso.numero
                setNextApto(`${piso.numero}01`);
            }
        }
    }, [show, piso, existingApartamentos]);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const payload = {
                numero: nextApto,
                pisoId: piso.id,
            };
            const result = await apartamentoService.create(payload);
            await showSuccess("Apartamento agregado correctamente.");
            onSaved?.(result);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al agregar el apartamento");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title="Agregar Apartamento"
            error={error}
            saving={saving}
            onClose={onClose}
            onSave={handleSave}
            saveLabel="Agregar"
            zIndex={1070}
        >
            <FormField label="Piso" required>
                <input
                    type="text"
                    className="form-control"
                    value={`Piso ${piso?.numero || ""}`}
                    disabled
                    readOnly
                />
            </FormField>

            <FormField label="Nuevo apartamento" required>
                <input
                    type="text"
                    className="form-control"
                    value={nextApto}
                    disabled
                    readOnly
                />
            </FormField>
        </CrudModal>
    );
};

export default ApartamentoPisoFormModal;
