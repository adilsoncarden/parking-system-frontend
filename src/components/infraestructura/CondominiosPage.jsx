import { useState, useEffect, useMemo } from "react";
import { condominioService } from "../../services/condominioService";
import { getApiErrorMessage } from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/swalHelpers";
import CrudPageLayout from "./crud/CrudPageLayout";
import CrudTableCard from "./crud/CrudTableCard";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import EstadoBadge from "./crud/EstadoBadge";
import RowActions from "./crud/RowActions";
import { usePagination } from "../../hooks/usePagination";
import { useModulePermissions } from "../../hooks/useModulePermissions";

const EMPTY_FORM = {
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    estado: "ACTIVO",
};
const MAX_TELEFONO = 9;

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "nombre", label: "Nombre" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

const limitTelefono = (value) =>
    value.replace(/\D/g, "").slice(0, MAX_TELEFONO);

const CondominiosPage = () => {
    const { canCreate, canEdit, canDelete } = useModulePermissions("CONDOMINIOS");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");

    const busy = saving || deletingId != null;

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
                setPageError(
                    getApiErrorMessage(err, "Error al cargar condominios"),
                );
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (item) =>
                (item.nombre || "").toLowerCase().includes(q) ||
                (item.direccion || "").toLowerCase().includes(q),
        );
    }, [items, search]);

    const pagination = usePagination(filteredItems);

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
            telefono: limitTelefono(item.telefono || ""),
            email: item.email || "",
            estado: item.estado || "ACTIVO",
        });
        setModalError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (busy) return;
        setShowModal(false);
        setModalError("");
    };

    const handleTelefonoChange = (e) => {
        setForm({ ...form, telefono: limitTelefono(e.target.value) });
    };

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
            setModalError(validation);
            return;
        }
        setSaving(true);
        setModalError("");
        try {
            if (editMode) {
                const updated = await condominioService.update(
                    selected.id,
                    form,
                );
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === selected.id ? updated : item,
                    ),
                );
                await showSuccess("Condominio actualizado correctamente.");
            } else {
                const created = await condominioService.create(form);
                setItems((prev) => [...prev, created]);
                await showSuccess("Condominio creado correctamente.");
            }
            setShowModal(false);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar");
            setModalError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        const ok = await confirmAction({
            title: "¿Deseas eliminar este condominio?",
            text: item.nombre ? `"${item.nombre}"` : "",
            confirmText: "Sí, eliminar",
            icon: "warning",
        });
        if (!ok) return;

        setDeletingId(item.id);
        setPageError("");
        try {
            await condominioService.delete(item.id);
            setItems((prev) => prev.filter((row) => row.id !== item.id));
            await showSuccess("Condominio eliminado correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                "Error al eliminar el condominio",
            );
            setPageError(msg);
            await showError(msg);
        } finally {
            setDeletingId(null);
        }
    };

    const searchFilter = (
        <input
            type="search"
            className="form-control form-control-sm"
            style={{ width: "240px" }}
            placeholder="Buscar por nombre o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
        />
    );

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.nombre}</td>
            <td className="px-4 py-3">{item.direccion}</td>
            <td className="px-4 py-3">{item.telefono || "—"}</td>
            <td className="px-4 py-3">{item.email || "—"}</td>
            <td className="px-4 py-3">
                <EstadoBadge estado={item.estado} />
            </td>
            <RowActions
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
                saving={busy || deletingId === item.id}
                canEdit={canEdit}
                canDelete={canDelete}
            />
        </tr>
    ));

    return (
        <CrudPageLayout
            loading={loading}
            title="Gestión de Condominios"
            subtitle="Administra los condominios registrados en el sistema"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <CrudTableCard
                title="Listado de Condominios"
                filter={searchFilter}
                onAdd={openCreate}
                canAdd={canCreate}
                addLabel="Agregar Condominio"
                saving={busy}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage={
                    search.trim()
                        ? "No hay resultados para la búsqueda"
                        : "No hay condominios registrados"
                }
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
                        onChange={(e) =>
                            setForm({ ...form, nombre: e.target.value })
                        }
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Dirección" required>
                    <input
                        type="text"
                        className="form-control"
                        value={form.direccion}
                        onChange={(e) =>
                            setForm({ ...form, direccion: e.target.value })
                        }
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Teléfono">
                    <input
                        type="tel"
                        className="form-control"
                        value={form.telefono}
                        onChange={handleTelefonoChange}
                        maxLength={MAX_TELEFONO}
                        inputMode="numeric"
                        disabled={saving}
                        placeholder="Máx. 9 dígitos"
                    />
                </FormField>
                <FormField label="Email">
                    <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Estado" required>
                    <select
                        className="form-select"
                        value={form.estado}
                        onChange={(e) =>
                            setForm({ ...form, estado: e.target.value })
                        }
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
