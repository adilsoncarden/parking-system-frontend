import { useState, useEffect } from "react";
import { condominioService } from "../../services/condominioService";
import { getApiErrorMessage } from "../../services/api";
import CrudPageLayout from "./crud/CrudPageLayout";
import CrudTableCard from "./crud/CrudTableCard";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import EstadoBadge from "./crud/EstadoBadge";
import RowActions from "./crud/RowActions";
import { usePagination } from "../../hooks/usePagination";

const EMPTY_FORM = { nombre: "", direccion: "", telefono: "", email: "", estado: "ACTIVO" };

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "nombre", label: "Nombre" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones", className: "text-end" },
];

const CondominiosPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");

    const load = async () => {
        const data = await condominioService.getAll();
        setItems(data);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await load();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar condominios"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const openCreate = () => {
        setEditMode(false);
        setSelected(null);
        setForm(EMPTY_FORM);
        setModalError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditMode(true);
        setSelected(item);
        setForm({
            nombre: item.nombre || "",
            direccion: item.direccion || "",
            telefono: item.telefono || "",
            email: item.email || "",
            estado: item.estado || "ACTIVO",
        });
        setModalError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalError("");
    };

    const validate = () => {
        if (!form.nombre.trim() || !form.direccion.trim()) {
            return "Nombre y dirección son obligatorios.";
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            return "El email no es válido.";
        }
        return "";
    };

    const handleSave = async () => {
        const validation = validate();
        if (validation) {
            setModalError(validation);
            return;
        }
        setSaving(true);
        setModalError("");
        setSuccess("");
        try {
            if (editMode) {
                await condominioService.update(selected.id, form);
                setSuccess("Condominio actualizado correctamente.");
            } else {
                await condominioService.create(form);
                setSuccess("Condominio creado correctamente.");
            }
            await load();
            closeModal();
        } catch (err) {
            setModalError(getApiErrorMessage(err, "Error al guardar"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Eliminar el condominio "${item.nombre}"?`)) return;
        setSaving(true);
        setSuccess("");
        try {
            await condominioService.delete(item.id);
            await load();
            setSuccess("Condominio eliminado correctamente.");
        } catch (err) {
            setPageError(getApiErrorMessage(err, "Error al eliminar"));
        } finally {
            setSaving(false);
        }
    };

    const pagination = usePagination(items);

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.nombre}</td>
            <td className="px-4 py-3">{item.direccion}</td>
            <td className="px-4 py-3">{item.telefono || "—"}</td>
            <td className="px-4 py-3">{item.email || "—"}</td>
            <td className="px-4 py-3"><EstadoBadge estado={item.estado} /></td>
            <RowActions
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
                saving={saving}
            />
        </tr>
    ));

    return (
        <CrudPageLayout
            loading={loading}
            title="Gestión de Condominios"
            subtitle="Administra los condominios registrados en el sistema"
            pageError={pageError}
            success={success}
            onDismissError={() => setPageError("")}
            onDismissSuccess={() => setSuccess("")}
        >
            <CrudTableCard
                title="Listado de Condominios"
                onAdd={openCreate}
                addLabel="Agregar Condominio"
                saving={saving}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage="No hay condominios registrados"
                rows={rows}
                pagination={pagination}
            />

            <CrudModal
                show={showModal}
                title={editMode ? "Editar Condominio" : "Agregar Condominio"}
                error={modalError}
                saving={saving}
                onClose={closeModal}
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
                <FormField label="Dirección" required>
                    <input
                        type="text"
                        className="form-control"
                        value={form.direccion}
                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Teléfono">
                    <input
                        type="text"
                        className="form-control"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Email">
                    <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Estado" required>
                    <select
                        className="form-select"
                        value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                        disabled={saving}
                    >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default CondominiosPage;
