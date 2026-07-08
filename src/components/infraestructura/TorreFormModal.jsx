import { useState, useEffect } from "react";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import SearchableSelect from "./crud/SearchableSelect";

const EMPTY = { nombre: "", condominioId: "" };

const TorreFormModal = ({ show, editMode = false, target = null, fixedCondominioId = null, onClose, onSaved }) => {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [condominios, setCondominios] = useState([]);
    const [loadingCondos, setLoadingCondos] = useState(false);

    useEffect(() => {
        const loadCondominios = async () => {
            setLoadingCondos(true);
            try {
                const data = await condominioService.getAll();
                setCondominios(data);
            } catch (err) {
                console.error("Error loading condominios", err);
            } finally {
                setLoadingCondos(false);
            }
        };
        if (show) {
            loadCondominios();
        }
    }, [show]);

    useEffect(() => {
        if (!show) return;
        if (editMode && target) {
            setForm({
                nombre: target.nombre || "",
                condominioId: target.condominioId || fixedCondominioId || "",
            });
        } else {
            setForm({
                ...EMPTY,
                condominioId: fixedCondominioId || "",
            });
        }
        setError("");
    }, [show, editMode, target, fixedCondominioId]);

    const validate = () => {
        if (!form.nombre.trim()) return "El nombre es obligatorio.";
        if (!form.condominioId) return "Seleccione un condominio.";
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
            const payload = { ...form };
            const result = editMode
                ? await torreService.update(target.id, payload)
                : await torreService.create(payload);
            await showSuccess(editMode ? "Torre actualizada correctamente." : "Torre agregada correctamente.");
            onSaved?.(result, editMode);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar la torre");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title={editMode ? "Editar Torre" : "Agregar Torre"}
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
                />
            </FormField>
            <FormField label="Condominio" required>
                <SearchableSelect
                    options={condominios}
                    value={form.condominioId}
                    onChange={(id) => setForm({ ...form, condominioId: id })}
                    disabled={saving || !!fixedCondominioId || loadingCondos}
                    placeholder={loadingCondos ? "Cargando..." : "Seleccione un condominio"}
                    inputClassName="form-control"
                />
            </FormField>
        </CrudModal>
    );
};

export default TorreFormModal;
