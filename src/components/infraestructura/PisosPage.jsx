import { useState, useEffect, useMemo, useRef } from "react";
import { pisoService } from "../../services/pisoService";
import { torreService } from "../../services/torreService";
import { getApiErrorMessage } from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/swalHelpers";
import CrudPageLayout from "./crud/CrudPageLayout";
import CrudTableCard from "./crud/CrudTableCard";
import CrudModal from "./crud/CrudModal";
import FormField from "./crud/FormField";
import RowActions from "./crud/RowActions";
import { usePagination } from "../../hooks/usePagination";
import { useModulePermissions } from "../../hooks/useModulePermissions";

const EMPTY_FORM = { numero: "", torreId: "" };

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "numero", label: "Número" },
    { key: "torre", label: "Torre" },
    { key: "condominio", label: "Condominio" },
    { key: "actions", label: "Acciones" },
];

const torreLabel = (torre) =>
    `${torre.nombre}${torre.condominioNombre ? ` — ${torre.condominioNombre}` : ""}`;

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
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery(selected?.nombre || "");
        }
    }, [open, selected?.nombre, value]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => (o.nombre || "").toLowerCase().includes(q));
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
                    } else if (!allowEmpty && selected && next !== selected.nombre) {
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
                    style={{ zIndex: 1060, maxHeight: "220px", overflowY: "auto" }}
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
                        <li className="list-group-item text-muted small py-2">Sin resultados</li>
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

const PisosPage = () => {
    const { canCreate, canEdit, canDelete } = useModulePermissions("PISOS");
    const [items, setItems] = useState([]);
    const [torres, setTorres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [filtroCondominioId, setFiltroCondominioId] = useState("");
    const [filtroTorreId, setFiltroTorreId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");
    const [createFormKey, setCreateFormKey] = useState(0);

    const busy = saving || deletingId != null;

    const torreSelectOptions = useMemo(
        () => torres.map((t) => ({ ...t, nombre: torreLabel(t) })),
        [torres],
    );

    // Condominios únicos (derivados de las torres) para el filtro en cascada.
    const condominioOptions = useMemo(() => {
        const map = new Map();
        torres.forEach((t) => {
            if (t.condominioId != null && !map.has(t.condominioId)) {
                map.set(t.condominioId, {
                    id: t.condominioId,
                    nombre: t.condominioNombre || `Condominio ${t.condominioId}`,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [torres]);

    // Torres del condominio seleccionado (cascada).
    const torreFilterOptions = useMemo(() => {
        const base = filtroCondominioId
            ? torres.filter((t) => String(t.condominioId) === String(filtroCondominioId))
            : torres;
        return base.map((t) => ({ ...t, nombre: torreLabel(t) }));
    }, [torres, filtroCondominioId]);

    const loadTorres = async () => {
        const data = await torreService.getAll();
        setTorres(data);
        return data;
    };

    const loadItems = async () => {
        const data = await pisoService.getAll();
        setItems(data);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await loadTorres();
                await loadItems();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar pisos"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const getTorreNombre = (item) =>
        item.torreNombre || torres.find((t) => t.id === item.torreId)?.nombre || "—";

    const getCondominioNombre = (item) => {
        const torre = torres.find((t) => t.id === item.torreId);
        return torre?.condominioNombre || "—";
    };

    const filteredItems = useMemo(() => {
        let list = items;
        if (filtroCondominioId) {
            list = list.filter((item) => String(item.condominioId) === String(filtroCondominioId));
        }
        if (filtroTorreId) {
            list = list.filter((item) => String(item.torreId) === String(filtroTorreId));
        }
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((item) => {
            const torre = getTorreNombre(item).toLowerCase();
            const condo = getCondominioNombre(item).toLowerCase();
            const numero = String(item.numero ?? "").toLowerCase();
            return (
                numero.includes(q) ||
                torre.includes(q) ||
                condo.includes(q) ||
                `piso ${numero}`.includes(q)
            );
        });
    }, [items, search, filtroCondominioId, filtroTorreId, torres]);

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
            numero: item.numero ?? "",
            torreId: item.torreId || "",
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
        if (form.numero === "" || form.numero == null) {
            setModalError("El número de piso es obligatorio.");
            return;
        }
        if (!form.torreId) {
            setModalError("Seleccione una torre.");
            return;
        }
        if (Number(form.numero) <= 0) {
            setModalError("El número de piso debe ser mayor a 0.");
            return;
        }
        setSaving(true);
        setModalError("");
        const payload = {
            numero: form.numero,
            torreId: form.torreId,
        };
        try {
            if (editMode) {
                const updated = await pisoService.update(selected.id, payload);
                setItems((prev) =>
                    prev.map((item) => (item.id === selected.id ? updated : item)),
                );
                await showSuccess("Piso actualizado correctamente.");
            } else {
                const created = await pisoService.create(payload);
                setItems((prev) => [...prev, created]);
                await showSuccess("Piso creado correctamente.");
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
            title: "¿Deseas eliminar este piso?",
            text: item.numero != null ? `Piso ${item.numero}` : "",
            confirmText: "Sí, eliminar",
            icon: "warning",
        });
        if (!ok) return;

        setDeletingId(item.id);
        setPageError("");
        try {
            await pisoService.delete(item.id);
            setItems((prev) => prev.filter((row) => row.id !== item.id));
            await showSuccess("Piso eliminado correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al eliminar el piso");
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
                placeholder="Buscar por piso, torre o condominio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    options={condominioOptions}
                    value={filtroCondominioId}
                    onChange={(id) => {
                        setFiltroCondominioId(id);
                        setFiltroTorreId("");
                    }}
                    disabled={loading}
                    placeholder="Filtrar condominio..."
                    allowEmpty
                    emptyLabel="Todos los condominios"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    key={`torre-filter-${filtroCondominioId}`}
                    options={torreFilterOptions}
                    value={filtroTorreId}
                    onChange={setFiltroTorreId}
                    disabled={loading}
                    placeholder={filtroCondominioId ? "Filtrar torre..." : "Filtrar torre (elige condominio)..."}
                    allowEmpty
                    emptyLabel="Todas las torres"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
        </div>
    );

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="px-4 py-3">
                <span className="badge bg-primary rounded-pill">Piso {item.numero}</span>
            </td>
            <td className="px-4 py-3">{getTorreNombre(item)}</td>
            <td className="px-4 py-3">{getCondominioNombre(item)}</td>
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
            title="Gestión de Pisos"
            subtitle="Administra los pisos de cada torre del condominio"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <CrudTableCard
                title="Listado de Pisos"
                filter={tableFilter}
                onAdd={openCreate}
                canAdd={canCreate}
                addLabel="Agregar Piso"
                saving={busy}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage={
                    search.trim() || filtroTorreId || filtroCondominioId
                        ? "No hay resultados para la búsqueda"
                        : "No hay pisos registrados"
                }
                rows={rows}
                pagination={pagination}
            />

            <CrudModal
                show={showModal}
                title={editMode ? "Editar Piso" : "Agregar Piso"}
                error={modalError}
                saving={saving}
                onClose={closeModal}
                onSave={handleSave}
                editMode={editMode}
            >
                <FormField label="Torre" required>
                    <SearchableSelect
                        key={editMode ? `edit-${selected?.id}` : `create-${createFormKey}`}
                        options={torreSelectOptions}
                        value={form.torreId}
                        onChange={(id) => setForm({ ...form, torreId: id })}
                        disabled={saving}
                        placeholder="Seleccione una torre"
                        inputClassName="form-control"
                    />
                </FormField>
                <FormField label="Número de piso" required>
                    <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={form.numero}
                        onChange={(e) => setForm({ ...form, numero: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default PisosPage;
