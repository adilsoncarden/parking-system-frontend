import { useState, useEffect, useMemo, useRef } from "react";
import { apartamentoService } from "../../services/apartamentoService";
import { pisoService } from "../../services/pisoService";
import { torreService } from "../../services/torreService";
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

const EMPTY_FORM = { numero: "", area: "", pisoId: "", estado: "DISPONIBLE" };

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "numero", label: "Apartamento" },
    { key: "area", label: "Área (m²)" },
    { key: "piso", label: "Piso" },
    { key: "torre", label: "Torre" },
    { key: "condominio", label: "Condominio" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones", className: "text-end" },
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

const ApartamentosPage = () => {
    const { canCreate, canEdit, canDelete } = useModulePermissions("APARTAMENTOS");
    const [items, setItems] = useState([]);
    const [pisos, setPisos] = useState([]);
    const [torres, setTorres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [filtroPisoId, setFiltroPisoId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");
    const [createFormKey, setCreateFormKey] = useState(0);

    const busy = saving || deletingId != null;

    const torreById = useMemo(
        () => Object.fromEntries(torres.map((t) => [t.id, t])),
        [torres],
    );

    const pisoLabel = (piso) => {
        const torre =
            piso.torreNombre || torreById[piso.torreId]?.nombre || "—";
        const condo =
            torreById[piso.torreId]?.condominioNombre || "—";
        return `Piso ${piso.numero} — ${torre} — ${condo}`;
    };

    const pisoSelectOptions = useMemo(
        () => pisos.map((p) => ({ ...p, nombre: pisoLabel(p) })),
        [pisos, torreById],
    );

    const loadCatalogos = async () => {
        const [pisosData, torresData] = await Promise.all([
            pisoService.getAll(),
            torreService.getAll(),
        ]);
        setPisos(pisosData);
        setTorres(torresData);
    };

    const loadItems = async () => {
        const data = await apartamentoService.getAll();
        setItems(data);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await loadCatalogos();
                await loadItems();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar apartamentos"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const getPisoNumero = (item) =>
        item.pisoNumero ?? pisos.find((p) => p.id === item.pisoId)?.numero ?? "—";

    const getTorreNombre = (item) =>
        item.torreNombre ||
        torreById[pisos.find((p) => p.id === item.pisoId)?.torreId]?.nombre ||
        "—";

    const getCondominioNombre = (item) => {
        if (item.torreId && torreById[item.torreId]) {
            return torreById[item.torreId].condominioNombre || "—";
        }
        const piso = pisos.find((p) => p.id === item.pisoId);
        return (piso && torreById[piso.torreId]?.condominioNombre) || "—";
    };

    const filteredItems = useMemo(() => {
        let list = items;
        if (filtroPisoId) {
            list = list.filter((item) => String(item.pisoId) === String(filtroPisoId));
        }
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((item) => {
            const numero = (item.numero || "").toLowerCase();
            const piso = `piso ${getPisoNumero(item)}`.toLowerCase();
            const torre = getTorreNombre(item).toLowerCase();
            const condo = getCondominioNombre(item).toLowerCase();
            const area = item.area != null ? String(item.area) : "";
            return (
                numero.includes(q) ||
                piso.includes(q) ||
                torre.includes(q) ||
                condo.includes(q) ||
                area.includes(q)
            );
        });
    }, [items, search, filtroPisoId, pisos, torres]);

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
            numero: item.numero || "",
            area: item.area ?? "",
            pisoId: item.pisoId || "",
            estado: item.estado || "DISPONIBLE",
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
        if (!form.numero.trim()) {
            setModalError("El número de apartamento es obligatorio.");
            return;
        }
        if (!form.pisoId) {
            setModalError("Seleccione un piso.");
            return;
        }
        if (form.area !== "" && (Number.isNaN(Number(form.area)) || Number(form.area) <= 0)) {
            setModalError("El área debe ser un número positivo.");
            return;
        }
        setSaving(true);
        setModalError("");
        const payload = {
            numero: form.numero.trim(),
            pisoId: form.pisoId,
            area: form.area,
            estado: form.estado,
        };
        try {
            if (editMode) {
                const updated = await apartamentoService.update(selected.id, payload);
                setItems((prev) =>
                    prev.map((item) => (item.id === selected.id ? updated : item)),
                );
                await showSuccess("Apartamento actualizado correctamente.");
            } else {
                const created = await apartamentoService.create(payload);
                setItems((prev) => [...prev, created]);
                await showSuccess("Apartamento creado correctamente.");
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
            title: "¿Deseas eliminar este apartamento?",
            text: item.numero ? `"${item.numero}"` : "",
            confirmText: "Sí, eliminar",
            icon: "warning",
        });
        if (!ok) return;

        setDeletingId(item.id);
        setPageError("");
        try {
            await apartamentoService.delete(item.id);
            setItems((prev) => prev.filter((row) => row.id !== item.id));
            await showSuccess("Apartamento eliminado correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al eliminar el apartamento");
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
                placeholder="Buscar por apartamento, piso o torre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    options={pisoSelectOptions}
                    value={filtroPisoId}
                    onChange={setFiltroPisoId}
                    disabled={loading}
                    placeholder="Filtrar piso..."
                    allowEmpty
                    emptyLabel="Todos los pisos"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
        </div>
    );

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.numero}</td>
            <td className="px-4 py-3">{item.area != null ? item.area : "—"}</td>
            <td className="px-4 py-3">Piso {getPisoNumero(item)}</td>
            <td className="px-4 py-3">{getTorreNombre(item)}</td>
            <td className="px-4 py-3">{getCondominioNombre(item)}</td>
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
            title="Gestión de Apartamentos"
            subtitle="Administra las unidades residenciales de cada piso"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <CrudTableCard
                title="Listado de Apartamentos"
                filter={tableFilter}
                onAdd={openCreate}
                canAdd={canCreate}
                addLabel="Agregar Apartamento"
                saving={busy}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage={
                    search.trim() || filtroPisoId
                        ? "No hay resultados para la búsqueda"
                        : "No hay apartamentos registrados"
                }
                rows={rows}
                pagination={pagination}
            />

            <CrudModal
                show={showModal}
                title={editMode ? "Editar Apartamento" : "Agregar Apartamento"}
                error={modalError}
                saving={saving}
                onClose={closeModal}
                onSave={handleSave}
                editMode={editMode}
            >
                <FormField label="Piso" required>
                    <SearchableSelect
                        key={editMode ? `edit-${selected?.id}` : `create-${createFormKey}`}
                        options={pisoSelectOptions}
                        value={form.pisoId}
                        onChange={(id) => setForm({ ...form, pisoId: id })}
                        disabled={saving}
                        placeholder="Buscar piso..."
                        inputClassName="form-control"
                    />
                </FormField>
                <FormField label="Número" required>
                    <input
                        type="text"
                        className="form-control"
                        value={form.numero}
                        onChange={(e) => setForm({ ...form, numero: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Área (m²)">
                    <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        placeholder="Opcional"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
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
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="OCUPADO">Ocupado</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default ApartamentosPage;
