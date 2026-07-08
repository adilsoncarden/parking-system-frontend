import { useState, useEffect } from "react";
import { carritoService } from "../../services/carritoService";
import { condominioService } from "../../services/condominioService";
import { entradaService } from "../../services/entradaService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import SearchableSelect from "./crud/SearchableSelect";

const EMPTY = { codigo: "", descripcion: "", estado: "DISPONIBLE", condominioId: "", entradaId: "" };

const CarritoFormModal = ({ show, editMode = false, target = null, fixedCondominioId = null, onClose, onSaved }) => {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    
    const [condominios, setCondominios] = useState([]);
    const [entradas, setEntradas] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const loadCondominios = async () => {
            setLoadingData(true);
            try {
                const data = await condominioService.getAll();
                setCondominios(data);
            } catch (err) {
                console.error("Error loading condominios", err);
            } finally {
                setLoadingData(false);
            }
        };
        if (show) {
            loadCondominios();
        }
    }, [show]);

    useEffect(() => {
        const loadEntradas = async () => {
            if (!form.condominioId) {
                setEntradas([]);
                return;
            }
            try {
                const data = await entradaService.getAll(form.condominioId);
                setEntradas(data);
            } catch (err) {
                console.error("Error loading entradas", err);
            }
        };
        loadEntradas();
    }, [form.condominioId]);

    useEffect(() => {
        if (!show) return;
        if (editMode && target) {
            setForm({
                codigo: target.codigo || "",
                descripcion: target.descripcion || "",
                estado: target.estado || "DISPONIBLE",
                condominioId: target.condominioId || fixedCondominioId || "",
                entradaId: target.entradaId || "",
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
        if (!form.codigo.trim()) return "El código es obligatorio.";
        if (!form.condominioId) return "Seleccione un condominio.";
        if (!editMode && !form.entradaId) return "Selecciona la entrada (puerta) a la que queda fijo el carrito.";
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
                ? await carritoService.update(target.id, payload)
                : await carritoService.create(payload);
            await showSuccess(editMode ? "Carrito actualizado correctamente." : "Carrito agregado correctamente.");
            onSaved?.(result, editMode);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar el carrito");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title={editMode ? "Editar Carrito" : "Agregar Carrito"}
            error={error}
            saving={saving}
            onClose={onClose}
            onSave={handleSave}
            editMode={editMode}
        >
            <FormField label="Código" required>
                <input
                    type="text"
                    className="form-control"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    disabled={saving}
                />
            </FormField>
            <FormField label="Descripción">
                <input
                    type="text"
                    className="form-control"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    disabled={saving}
                />
            </FormField>
            <FormField label="Condominio" required>
                <SearchableSelect
                    options={condominios}
                    value={form.condominioId}
                    onChange={(id) => setForm({ ...form, condominioId: id, entradaId: "" })}
                    disabled={saving || editMode || !!fixedCondominioId || loadingData}
                    placeholder={loadingData ? "Cargando..." : "Seleccione un condominio"}
                    inputClassName="form-control"
                />
            </FormField>
            <FormField label="Entrada (puerta)" required={!editMode}>
                <SearchableSelect
                    options={entradas}
                    value={form.entradaId}
                    onChange={(id) => setForm({ ...form, entradaId: id })}
                    disabled={saving || editMode || !form.condominioId}
                    placeholder={
                        editMode
                            ? "La entrada no se cambia"
                            : !form.condominioId
                              ? "Primero elige el condominio"
                              : "¿En qué entrada queda fijo el carrito?"
                    }
                    inputClassName="form-control"
                />
            </FormField>
            <FormField label="Estado" required>
                <select
                    className="form-select"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    disabled={saving}
                >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="PRESTADO">Prestado</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INACTIVO">Inactivo</option>
                </select>
            </FormField>
        </CrudModal>
    );
};

export default CarritoFormModal;
