import { useState, useEffect } from "react";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";
import { getApiErrorMessage } from "../../services/api";
import CrudPageLayout from "./crud/CrudPageLayout";
import CrudTableCard from "./crud/CrudTableCard";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import EstadoBadge from "./crud/EstadoBadge";
import RowActions from "./crud/RowActions";
import { usePagination } from "../../hooks/usePagination";

const EMPTY_FORM = { nombre: "", condominioId: "", estado: "ACTIVO" };

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "nombre", label: "Nombre" },
    { key: "condominio", label: "Condominio" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones", className: "text-end" },
];

const TorresPage = () => {
    const [items, setItems] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");
    const [success, setSuccess] = useState("");
    const [filtroCondominioId, setFiltroCondominioId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");

    const loadCondominios = async () => {
        const data = await condominioService.getAll();
        setCondominios(data);
        return data;
    };

    const loadItems = async (condominioId = filtroCondominioId) => {
        const data = await torreService.getAll(condominioId || undefined);
        setItems(data);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await loadCondominios();
                await loadItems();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar torres"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (loading) return;
        (async () => {
            setFiltering(true);
            try {
                await loadItems(filtroCondominioId);
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al filtrar torres"));
            } finally {
                setFiltering(false);
            }
        })();
    }, [filtroCondominioId]);

    const openCreate = () => {
        setEditMode(false);
        setSelected(null);
        setForm({
            ...EMPTY_FORM,
            condominioId: filtroCondominioId || condominios[0]?.id || "",
        });
        setModalError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditMode(true);
        setSelected(item);
        setForm({
            nombre: item.nombre || "",
            condominioId: item.condominioId || "",
            estado: item.estado || "ACTIVO",
        });
        setModalError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalError("");
    };

    const handleSave = async () => {
        if (!form.nombre.trim() || !form.condominioId) {
            setModalError("Nombre y condominio son obligatorios.");
            return;
        }
        setSaving(true);
        setModalError("");
        setSuccess("");
        try {
            if (editMode) {
                await torreService.update(selected.id, form);
                setSuccess("Torre actualizada correctamente.");
            } else {
                await torreService.create(form);
                setSuccess("Torre creada correctamente.");
            }
            await loadItems(filtroCondominioId);
            closeModal();
        } catch (err) {
            setModalError(getApiErrorMessage(err, "Error al guardar"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Eliminar la torre "${item.nombre}"?`)) return;
        setSaving(true);
        setSuccess("");
        try {
            await torreService.delete(item.id);
            await loadItems(filtroCondominioId);
            setSuccess("Torre eliminada correctamente.");
        } catch (err) {
            setPageError(getApiErrorMessage(err, "Error al eliminar"));
        } finally {
            setSaving(false);
        }
    };

    const getCondominioNombre = (condominioId) =>
        condominios.find((c) => c.id === condominioId)?.nombre || "—";

    const filter = (
        <select
            className="form-select form-select-sm"
            style={{ width: "200px" }}
            value={filtroCondominioId}
            onChange={(e) => setFiltroCondominioId(e.target.value)}
        >
            <option value="">Todos los condominios</option>
            {condominios.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.nombre}
                </option>
            ))}
        </select>
    );

    const pagination = usePagination(items);

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.nombre}</td>
            <td className="px-4 py-3">{item.condominioNombre || getCondominioNombre(item.condominioId)}</td>
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
            title="Gestión de Torres"
            subtitle="Administra las torres de cada condominio"
            pageError={pageError}
            success={success}
            onDismissError={() => setPageError("")}
            onDismissSuccess={() => setSuccess("")}
        >
            <CrudTableCard
                title="Listado de Torres"
                filter={filter}
                onAdd={openCreate}
                addLabel="Agregar Torre"
                filtering={filtering}
                saving={saving}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage="No hay torres registradas"
                rows={rows}
                pagination={pagination}
            />

            <CrudModal
                show={showModal}
                title={editMode ? "Editar Torre" : "Agregar Torre"}
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
                <FormField label="Condominio" required>
                    <select
                        className="form-select"
                        value={form.condominioId}
                        onChange={(e) => setForm({ ...form, condominioId: e.target.value })}
                        disabled={saving}
                    >
                        <option value="">Selecciona un condominio</option>
                        {condominios.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
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

export default TorresPage;
