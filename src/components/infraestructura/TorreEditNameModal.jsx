import { useState, useEffect } from "react";
import { torreService } from "../../services/torreService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";

const TorreEditNameModal = ({ show, torre, onClose, onSaved }) => {
    const [nombre, setNombre] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show && torre) {
            setNombre(torre.nombre || "");
            setError("");
        }
    }, [show, torre]);

    const handleSave = async () => {
        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                nombre,
                condominioId: torre.condominioId,
            };
            const result = await torreService.update(torre.id, payload);
            await showSuccess("Nombre de torre actualizado correctamente.");
            onSaved?.(result);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al actualizar la torre");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title="Editar Nombre"
            error={error}
            saving={saving}
            onClose={onClose}
            onSave={handleSave}
            saveText="Guardar Nombre"
        >
            <FormField label="Nombre" required>
                <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={saving}
                    autoFocus
                />
            </FormField>
        </CrudModal>
    );
};

export default TorreEditNameModal;
