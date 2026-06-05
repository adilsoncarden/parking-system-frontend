import { useState, useEffect, useMemo, useRef } from "react";
import { torreService } from "../../services/torreService";
import { condominioService } from "../../services/condominioService";
import { getApiErrorMessage } from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/swalHelpers";
import CrudPageLayout from "./crud/CrudPageLayout";
import CrudTableCard from "./crud/CrudTableCard";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import RowActions from "./crud/RowActions";
import { usePagination } from "../../hooks/usePagination";
import { useModulePermissions } from "../../hooks/useModulePermissions";

const EMPTY_FORM = { nombre: "", condominioId: "" };

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "nombre", label: "Nombre" },
    { key: "condominio", label: "Condominio" },
    { key: "actions", label: "Acciones" },
];

const SearchableSelect = ({
    options,
    value,
    onChange,
    disabled,
    placeholder = "Buscar...",
    allowEmpty = false,
    emptyLabel = "—",
    inputClassName = "form-control",
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);

    const selected = options.find((o) => String(o.id) === String(value));

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery(selected?.nombre || "");
        }
    }, [open, selected?.nombre, value]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) =>
            (o.nombre || "").toLowerCase().includes(q),
        );
    }, [options, query]);

    const pick = (id, nombre) => {
        onChange(id === "" ? "" : id);
        setQuery(nombre || "");
        setOpen(false);
    };

    return (
        <div className="position-relative" ref={containerRef}>
            <input
                type="text"
                className={inputClassName}
                value={query}
                onChange={(e) => {
                    const next = e.target.value;
                    setQuery(next);
                    setOpen(true);
                    if (!next.trim() && allowEmpty) {
                        onChange("");
                    } else if (
                        !allowEmpty &&
                        selected &&
                        next !== selected.nombre
                    ) {
                        onChange("");
                    }
                }}
                onFocus={() => !disabled && setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
            />
            {open && !disabled && (
                <ul
                    className="list-group position-absolute w-100 shadow-sm border rounded-bottom"
                    style={{
                        zIndex: 1060,
                        maxHeight: "220px",
                        overflowY: "auto",
                    }}
                >
                    {allowEmpty && (
                        <li>
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action py-2 ${!value ? "active" : ""}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pick("", emptyLabel)}
                            >
                                {emptyLabel}
                            </button>
                        </li>
                    )}
                    {filtered.length === 0 ? (
                        <li className="list-group-item text-muted small py-2">
                            Sin resultados
                        </li>
                    ) : (
                        filtered.map((o) => (
                            <li key={o.id}>
                                <button
                                    type="button"
                                    className={`list-group-item list-group-item-action py-2 ${String(o.id) === String(value) ? "active" : ""}`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => pick(o.id, o.nombre)}
                                >
                                    {o.nombre}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

const TorresPage = () => {
    const { canCreate, canEdit, canDelete } = useModulePermissions("TORRES");
    const [items, setItems] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [filtroCondominioId, setFiltroCondominioId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");
    const [createFormKey, setCreateFormKey] = useState(0);

    const busy = saving || deletingId != null;

    const loadCondominios = async () => {
        const data = await condominioService.getAll();
        setCondominios(data);
        return data;
    };

    const loadItems = async () => {
        const data = await torreService.getAll();
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

    const getCondominioNombre = (condominioId) =>
        condominios.find((c) => c.id === condominioId)?.nombre || "";

    const filteredItems = useMemo(() => {
        let list = items;
        if (filtroCondominioId) {
            list = list.filter(
                (item) =>
                    String(item.condominioId) === String(filtroCondominioId),
            );
        }
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((item) => {
            const condo =
                item.condominioNombre || getCondominioNombre(item.condominioId);
            return (
                (item.nombre || "").toLowerCase().includes(q) ||
                condo.toLowerCase().includes(q)
            );
        });
    }, [items, search, filtroCondominioId, condominios]);

    const pagination = usePagination(filteredItems);

    const openCreate = () => {
        setEditMode(false);
        setSelected(null);
        setForm(EMPTY_FORM);
        setCreateFormKey((k) => k + 1);
        setModalError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditMode(true);
        setSelected(item);
        setForm({
            nombre: item.nombre || "",
            condominioId: item.condominioId || "",
        });
        setModalError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (busy) return;
        setShowModal(false);
        setModalError("");
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            setModalError("El nombre es obligatorio.");
            return;
        }
        if (!form.condominioId) {
            setModalError("Seleccione un condominio.");
            return;
        }
        setSaving(true);
        setModalError("");
        try {
            if (editMode) {
                const updated = await torreService.update(selected.id, form);
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === selected.id ? updated : item,
                    ),
                );
                await showSuccess("Torre actualizada correctamente.");
            } else {
                const created = await torreService.create(form);
                setItems((prev) => [...prev, created]);
                await showSuccess("Torre creada correctamente.");
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
            title: "¿Deseas eliminar esta torre?",
            text: item.nombre ? `"${item.nombre}"` : "",
            confirmText: "Sí, eliminar",
            icon: "warning",
        });
        if (!ok) return;

        setDeletingId(item.id);
        setPageError("");
        try {
            await torreService.delete(item.id);
            setItems((prev) => prev.filter((row) => row.id !== item.id));
            await showSuccess("Torre eliminada correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al eliminar la torre");
            setPageError(msg);
            await showError(msg);
        } finally {
            setDeletingId(null);
        }
    };

    const tableFilter = (
        <div className="d-flex flex-wrap gap-2 align-items-center">
            <input
                type="search"
                className="form-control form-control-sm"
                style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}
                placeholder="Buscar por torre o condominio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    options={condominios}
                    value={filtroCondominioId}
                    onChange={setFiltroCondominioId}
                    disabled={loading}
                    placeholder="Filtrar condominio..."
                    allowEmpty
                    emptyLabel="Todos los condominios"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
        </div>
    );

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.nombre}</td>
            <td className="px-4 py-3">
                {item.condominioNombre ||
                    getCondominioNombre(item.condominioId) ||
                    "—"}
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
            title="Gestión de Torres"
            subtitle="Administra las torres de cada condominio"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <CrudTableCard
                title="Listado de Torres"
                filter={tableFilter}
                onAdd={openCreate}
                canAdd={canCreate}
                addLabel="Agregar Torre"
                saving={busy}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage={
                    search.trim() || filtroCondominioId
                        ? "No hay resultados para la búsqueda"
                        : "No hay torres registradas"
                }
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
                        onChange={(e) =>
                            setForm({ ...form, nombre: e.target.value })
                        }
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Condominio" required>
                    <SearchableSelect
                        key={
                            editMode
                                ? `edit-${selected?.id}`
                                : `create-${createFormKey}`
                        }
                        options={condominios}
                        value={form.condominioId}
                        onChange={(id) =>
                            setForm({ ...form, condominioId: id })
                        }
                        disabled={saving}
                        placeholder="Seleccione un condominio"
                        inputClassName="form-control"
                    />
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default TorresPage;
