import { useState, useEffect } from "react";
import { condominioService } from "../../services/condominioService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess, showError } from "../../utils/swalHelpers";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import MapAddressPicker from "./MapAddressPicker";

const MAX_TELEFONO = 9;
const EMPTY = { nombre: "", direccion: "", telefono: "", email: "" };

const limitTelefono = (value) => value.replace(/\D/g, "").slice(0, MAX_TELEFONO);

// Formulario reutilizable de condominio. Lo usan tanto el listado (crear) como
// la página de detalle (editar), para no duplicar validación ni llamadas.
const CondominioFormModal = ({ show, editMode = false, target = null, onClose, onSaved }) => {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) return;
        if (editMode && target) {
            setForm({
                nombre: target.nombre || "",
                direccion: target.direccion || "",
                telefono: limitTelefono(target.telefono || ""),
                email: target.email || "",
            });
        } else {
            setForm(EMPTY);
        }
        setError("");
    }, [show, editMode, target]);

    const validate = () => {
        if (!form.nombre.trim() || !form.direccion.trim()) {
            return "Nombre y dirección son obligatorios.";
        }
        if (form.telefono && form.telefono.length > MAX_TELEFONO) {
            return "El teléfono debe tener máximo 9 dígitos.";
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            return "El email no es válido.";
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
            const result = editMode
                ? await condominioService.update(target.id, form)
                : await condominioService.create(form);
            await showSuccess(
                editMode
                    ? "Condominio actualizado correctamente."
                    : "Condominio creado correctamente.",
            );
            onSaved?.(result, editMode);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar");
            setError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <CrudModal
            show={show}
            title={editMode ? "Editar Condominio" : "Agregar Condominio"}
            error={error}
            saving={saving}
            onClose={onClose}
            onSave={handleSave}
            editMode={editMode}
            size="lg"
        >
            <div className="row g-3">
                <div className="col-md-6">
                    <FormField label="Nombre" required>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-building" /></span>
                            <input
                                type="text"
                                className="form-control"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                disabled={saving}
                                placeholder="Nombre del condominio"
                            />
                        </div>
                    </FormField>
                    <FormField label="Teléfono">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-telephone" /></span>
                            <input
                                type="tel"
                                className="form-control"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: limitTelefono(e.target.value) })}
                                maxLength={MAX_TELEFONO}
                                inputMode="numeric"
                                disabled={saving}
                                placeholder="Teléfono del gerente (máx. 9 dígitos)"
                            />
                        </div>
                    </FormField>
                    <FormField label="Email">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-envelope" /></span>
                            <input
                                type="email"
                                className="form-control"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                disabled={saving}
                                placeholder="correo@condominio.com"
                            />
                        </div>
                    </FormField>
                </div>

                <div className="col-md-6">
                    <FormField label="Dirección" required>
                        <div className="input-group mb-2">
                            <span className="input-group-text"><i className="bi bi-geo-alt" /></span>
                            <input
                                type="text"
                                className="form-control bg-light"
                                value={form.direccion}
                                readOnly
                                placeholder="Se completa con el mapa de abajo"
                                title="Este campo se fija buscando o haciendo clic en el mapa"
                            />
                        </div>
                        <MapAddressPicker
                            disabled={saving}
                            onChange={(direccion) => setForm((prev) => ({ ...prev, direccion }))}
                        />
                        <small className="text-muted d-block mt-1">
                            <i className="bi bi-lock me-1" />
                            La dirección no se escribe a mano: se fija con el buscador o los clics en el mapa.
                        </small>
                    </FormField>
                </div>
            </div>
        </CrudModal>
    );
};

export default CondominioFormModal;
