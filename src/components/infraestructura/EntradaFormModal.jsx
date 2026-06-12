import { useState, useEffect } from "react";
import { entradaService } from "../../services/entradaService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";

const EMPTY = { nombre: "", capacidadCarritos: "" };

const EntradaFormModal = ({ show, editMode = false, target = null, condominioId, onClose, onSaved }) => {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) return;
        if (editMode && target) {
            setForm({
                nombre: target.nombre || "",
                capacidadCarritos: target.capacidadCarritos ?? "",
            });
        } else {
            setForm(EMPTY);
        }
        setError("");
    }, [show, editMode, target]);

    const validate = () => {
        if (!form.nombre.trim()) return "El nombre de la entrada es obligatorio.";
        if (form.capacidadCarritos !== "" && Number(form.capacidadCarritos) < 0) {
            return "La capacidad no puede ser negativa.";
        }
        return "";
    };

    const handleSave = async () => {
        const validation = validate();
        if (validation) {
            setError(validation);
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = { ...form, condominioId };
            const result = editMode
                ? await entradaService.update(target.id, payload)
                : await entradaService.create(payload);
            await showSuccess(editMode ? "Entrada actualizada correctamente." : "Entrada creada correctamente.");
            onSaved?.(result, editMode);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar la entrada");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title={editMode ? "Editar Entrada" : "Agregar Entrada"}
            error={error}
            saving={saving}
            onClose={onClose}
            onSave={handleSave}
            editMode={editMode}
        >
            <FormField label="Nombre" required>
                <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    disabled={saving}
                    placeholder="Ej: Entrada Principal"
                />
            </FormField>
            <FormField label="Capacidad del puesto de carritos">
                <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.capacidadCarritos}
                    onChange={(e) => setForm({ ...form, capacidadCarritos: e.target.value })}
                    disabled={saving}
                    placeholder="N° de carritos que caben en el puesto"
                />
            </FormField>
        </CrudModal>
    );
};

export default EntradaFormModal;
