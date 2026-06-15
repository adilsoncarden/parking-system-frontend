import { useState, useEffect, useMemo, useRef } from "react";
import { usuarioService } from "../../services/usuarioService";
import { rolService } from "../../services/rolService";
import { apartamentoService } from "../../services/apartamentoService";
import { condominioService } from "../../services/condominioService";
import { entradaService } from "../../services/entradaService";
import { getApiErrorMessage } from "../../services/api";
import { confirmDelete, showSuccess, showError } from "../../utils/swalHelpers";
import CrudPageLayout from "../infraestructura/crud/CrudPageLayout";
import CrudTableCard from "../infraestructura/crud/CrudTableCard";
import CrudModal from "../infraestructura/crud/CrudModal";
import FormField from "../infraestructura/crud/FormField";
import RowActions from "../infraestructura/crud/RowActions";
import { usePagination } from "../../hooks/usePagination";
import { useModulePermissions } from "../../hooks/useModulePermissions";
import { permisoService } from "../../services/permisoService";
import { PERMISSION_GROUPS } from "../../constants/permissions";
import { hasPermission, isAdmin } from "../../utils/permissions";
import { PERM } from "../../constants/permissions";

const EMPTY_FORM = {
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    tipoOcupante: "PROPIETARIO",
    estado: "ACTIVO",
    rolId: "",
    apartamentoId: "",
    condominioId: "",
    entradaId: "",
    turno: "",
};

const MAX_TELEFONO = 9;

// La gestión de Usuarios es solo para el PERSONAL (staff) del sistema.
// Los residentes (3000+) son datos de parking y se ven en el Directorio de Residentes,
// no acá. Así la lista queda limpia con solo las cuentas de acceso.
const STAFF_ROLES = new Set(["ADMIN", "ADMIN_CONDOMINIO", "SUBADMIN", "PORTERO"]);

// Íconos por módulo para el panel de "Permisos por rol".
const MODULE_ICONS = {
    Dashboard: "bi-speedometer2",
    Condominios: "bi-buildings",
    Torres: "bi-building",
    Pisos: "bi-layers",
    Apartamentos: "bi-door-closed",
    Entradas: "bi-door-open",
    Carritos: "bi-cart",
    Préstamos: "bi-arrow-left-right",
    Configuración: "bi-gear",
    Parking: "bi-p-square",
    Vehículos: "bi-car-front",
    Estacionamientos: "bi-p-circle",
    Zonas: "bi-grid-3x3",
    Plazas: "bi-grid",
    Pases: "bi-ticket-perforated",
    Accesos: "bi-shield-check",
};

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "rol", label: "Rol" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

const ESTADO_STYLE = {
    ACTIVO: "bg-success",
    INACTIVO: "bg-secondary",
    BLOQUEADO: "bg-danger",
};

const limitTelefono = (value) => value.replace(/\D/g, "").slice(0, MAX_TELEFONO);

const apartamentoLabel = (a) =>
    `Apto ${a.numero} — Piso ${a.pisoNumero ?? "—"} — ${a.torreNombre || "—"}`;

const rolLabel = (r) =>
    r.descripcion ? `${r.nombre} — ${r.descripcion}` : r.nombre;

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

const RolPermisosPanel = ({ roles, saving, setSaving }) => {
    const [selectedRolId, setSelectedRolId] = useState("");
    const [permisosCatalog, setPermisosCatalog] = useState([]);
    const [selectedPermisoIds, setSelectedPermisoIds] = useState([]);
    const [panelError, setPanelError] = useState("");
    const [loadingPerms, setLoadingPerms] = useState(false);

    const rolOptions = roles.map((r) => ({ ...r, nombre: rolLabel(r) }));
    const selectedRol = roles.find((r) => String(r.id) === String(selectedRolId));
    const isAdminRol = selectedRol?.nombre?.toUpperCase() === "ADMIN";

    useEffect(() => {
        (async () => {
            try {
                const data = await permisoService.getAll();
                setPermisosCatalog(data);
            } catch {
                setPanelError("Error al cargar permisos");
            }
        })();
    }, []);

    useEffect(() => {
        if (!selectedRolId) {
            setSelectedPermisoIds([]);
            return;
        }
        (async () => {
            setLoadingPerms(true);
            setPanelError("");
            try {
                const data = await permisoService.getPermisosByRol(selectedRolId);
                setSelectedPermisoIds(data.permisoIds || []);
            } catch (err) {
                setPanelError(getApiErrorMessage(err, "Error al cargar permisos del rol"));
            } finally {
                setLoadingPerms(false);
            }
        })();
    }, [selectedRolId]);

    const togglePermiso = (permisoId) => {
        setSelectedPermisoIds((prev) =>
            prev.includes(permisoId)
                ? prev.filter((id) => id !== permisoId)
                : [...prev, permisoId],
        );
    };

    const savePermisos = async () => {
        if (!selectedRolId) {
            setPanelError("Seleccione un rol.");
            return;
        }
        if (isAdminRol) return;
        setSaving(true);
        setPanelError("");
        try {
            await permisoService.assignPermisosToRol(selectedRolId, selectedPermisoIds);
            await showSuccess("Permisos guardados correctamente.");
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar permisos");
            setPanelError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const permisoIdByNombre = Object.fromEntries(
        permisosCatalog.map((p) => [p.nombre, p.id]),
    );

    // IDs de permisos existentes de un módulo (solo los que están en el catálogo).
    const moduleIds = (group) =>
        group.items.map((i) => permisoIdByNombre[i.key]).filter(Boolean);

    const moduleAllChecked = (group) => {
        const ids = moduleIds(group);
        return ids.length > 0 && ids.every((id) => selectedPermisoIds.includes(id));
    };

    const toggleModule = (group) => {
        const ids = moduleIds(group);
        const all = ids.every((id) => selectedPermisoIds.includes(id));
        setSelectedPermisoIds((prev) =>
            all
                ? prev.filter((id) => !ids.includes(id))
                : [...new Set([...prev, ...ids])],
        );
    };

    const totalSeleccionados = PERMISSION_GROUPS.reduce(
        (acc, g) => acc + moduleIds(g).filter((id) => selectedPermisoIds.includes(id)).length,
        0,
    );

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary"
                    style={{ width: "2.25rem", height: "2.25rem" }}>
                    <i className="bi bi-shield-lock-fill" />
                </span>
                <div>
                    <h5 className="mb-0 fw-semibold">Permisos por rol</h5>
                    <small className="text-muted">Activa o desactiva lo que puede hacer cada rol</small>
                </div>
            </div>
            <div className="card-body px-4 pb-4">
                {panelError && (
                    <div className="alert alert-danger py-2 small">{panelError}</div>
                )}
                <FormField label="Rol">
                    <SearchableSelect
                        options={rolOptions}
                        value={selectedRolId}
                        onChange={setSelectedRolId}
                        disabled={saving}
                        placeholder="Seleccione un rol..."
                        inputClassName="form-control"
                    />
                </FormField>

                {!selectedRolId && (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-hand-index-thumb fs-1 d-block mb-2 opacity-50" />
                        Elige un rol para configurar sus permisos.
                    </div>
                )}

                {isAdminRol && (
                    <div className="alert alert-info d-flex align-items-center gap-2 py-2 small mb-0">
                        <i className="bi bi-stars" />
                        El rol <strong>ADMIN</strong> tiene todos los permisos automáticamente.
                    </div>
                )}

                {selectedRolId && !isAdminRol && (
                    <>
                        {loadingPerms ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status" />
                            </div>
                        ) : (
                            <div className="row g-3">
                                {PERMISSION_GROUPS.map((group) => {
                                    const ids = moduleIds(group);
                                    if (ids.length === 0) return null;
                                    const checkedCount = ids.filter((id) =>
                                        selectedPermisoIds.includes(id),
                                    ).length;
                                    const allOn = moduleAllChecked(group);
                                    return (
                                        <div key={group.module} className="col-md-6 col-xl-4">
                                            <div className={`border rounded-3 h-100 overflow-hidden ${allOn ? "border-primary" : ""}`}>
                                                <div className={`d-flex align-items-center justify-content-between px-3 py-2 ${allOn ? "bg-primary bg-opacity-10" : "bg-light"}`}>
                                                    <span className="fw-semibold d-flex align-items-center gap-2">
                                                        <i className={`bi ${MODULE_ICONS[group.module] || "bi-folder"} text-primary`} />
                                                        {group.module}
                                                        <span className="badge bg-secondary bg-opacity-50 fw-normal">
                                                            {checkedCount}/{ids.length}
                                                        </span>
                                                    </span>
                                                    <div className="form-check form-switch m-0" title="Marcar todos">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={allOn}
                                                            onChange={() => toggleModule(group)}
                                                            disabled={saving}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="px-3 py-2">
                                                    {group.items.map((item) => {
                                                        const permisoId = permisoIdByNombre[item.key];
                                                        if (!permisoId) return null;
                                                        const on = selectedPermisoIds.includes(permisoId);
                                                        return (
                                                            <label
                                                                key={item.key}
                                                                className={`d-flex align-items-center justify-content-between gap-2 py-1 px-1 rounded ${on ? "text-primary fw-medium" : "text-body"}`}
                                                                style={{ cursor: saving ? "default" : "pointer" }}
                                                            >
                                                                <span className="small">{item.label}</span>
                                                                <div className="form-check form-switch m-0">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        checked={on}
                                                                        onChange={() => togglePermiso(permisoId)}
                                                                        disabled={saving}
                                                                    />
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="mt-3 d-flex align-items-center justify-content-between">
                            <span className="text-muted small">
                                <i className="bi bi-check2-circle me-1" />
                                {totalSeleccionados} permisos activos
                            </span>
                            <button
                                type="button"
                                className="btn btn-primary px-4"
                                onClick={savePermisos}
                                disabled={saving || loadingPerms}
                            >
                                <i className="bi bi-save me-1" />
                                Guardar permisos
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const ConfiguracionPage = () => {
    const { canCreate, canEdit, canDelete } = useModulePermissions("CONFIGURACION");
    const canManagePermisos = hasPermission(PERM.GESTIONAR_PERMISOS) || isAdmin();

    const [activeTab, setActiveTab] = useState("usuarios");
    const [items, setItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [apartamentos, setApartamentos] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [entradas, setEntradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [filtroRolId, setFiltroRolId] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");
    const [createFormKey, setCreateFormKey] = useState(0);

    const busy = saving || deletingId != null;

    // Solo roles de personal (sin RESIDENTE) para los selects de gestión.
    const staffRoles = useMemo(
        () => roles.filter((r) => STAFF_ROLES.has((r.nombre || "").toUpperCase())),
        [roles],
    );

    const rolOptions = useMemo(
        () => staffRoles.map((r) => ({ ...r, nombre: rolLabel(r) })),
        [staffRoles],
    );

    const apartamentoOptions = useMemo(
        () => apartamentos.map((a) => ({ ...a, nombre: apartamentoLabel(a) })),
        [apartamentos],
    );

    const condominioOptions = useMemo(
        () => condominios.map((c) => ({ ...c, nombre: c.nombre })),
        [condominios],
    );

    // Rol seleccionado en el formulario: si es PORTERO se piden entrada + turno.
    const selectedRolNombre = useMemo(
        () => roles.find((r) => String(r.id) === String(form.rolId))?.nombre || "",
        [roles, form.rolId],
    );
    const esPortero = selectedRolNombre === "PORTERO";

    const entradasDeCondominio = useMemo(
        () =>
            entradas
                .filter((e) => String(e.condominioId) === String(form.condominioId))
                .map((e) => ({ ...e, nombre: e.nombre })),
        [entradas, form.condominioId],
    );

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                const [usuariosRes, rolesRes, aptosRes, condosRes, entradasRes] = await Promise.allSettled([
                    usuarioService.getAll(),
                    rolService.getAll(),
                    apartamentoService.getAll(),
                    condominioService.getAll(),
                    entradaService.getAll(),
                ]);

                if (usuariosRes.status === "fulfilled") {
                    setItems(usuariosRes.value);
                } else {
                    throw usuariosRes.reason;
                }
                if (rolesRes.status === "fulfilled") {
                    setRoles(rolesRes.value);
                }
                if (aptosRes.status === "fulfilled") {
                    setApartamentos(aptosRes.value);
                }
                if (condosRes.status === "fulfilled") {
                    setCondominios(condosRes.value);
                }
                if (entradasRes.status === "fulfilled") {
                    setEntradas(entradasRes.value);
                }
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar configuración"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filteredItems = useMemo(() => {
        // Solo personal/staff: sin residentes ni roles no-staff.
        let list = items.filter((u) => STAFF_ROLES.has((u.rolNombre || "").toUpperCase()));
        if (filtroRolId) {
            list = list.filter((u) => String(u.rolId) === String(filtroRolId));
        }
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((u) => {
            const nombre = `${u.nombres} ${u.apellidos}`.toLowerCase();
            const email = (u.email || "").toLowerCase();
            const rol = (u.rolNombre || "").toLowerCase();
            const tipo = (u.tipoOcupante || "").toLowerCase();
            const estado = (u.estado || "").toLowerCase();
            return (
                nombre.includes(q) ||
                email.includes(q) ||
                rol.includes(q) ||
                tipo.includes(q) ||
                estado.includes(q)
            );
        });
    }, [items, search, filtroRolId]);

    const pagination = usePagination(filteredItems);

    const openCreate = () => {
        setEditMode(false);
        setSelected(null);
        setForm(EMPTY_FORM);
        setCreateFormKey((k) => k + 1);
        setModalError("");
        setShowPassword(false);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setShowPassword(false);
        setEditMode(true);
        setSelected(item);
        setForm({
            nombres: item.nombres || "",
            apellidos: item.apellidos || "",
            email: item.email || "",
            telefono: limitTelefono(item.telefono || ""),
            password: "",
            tipoOcupante: item.tipoOcupante || "PROPIETARIO",
            estado: item.estado || "ACTIVO",
            rolId: item.rolId || "",
            apartamentoId: item.apartamentoId || "",
            condominioId: item.condominioId || "",
            entradaId: item.entradaId || "",
            turno: item.turno || "",
        });
        setModalError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (busy) return;
        setShowModal(false);
        setModalError("");
    };

    const validate = () => {
        if (!form.nombres?.trim() || !form.apellidos?.trim() || !form.email?.trim()) {
            return "Completa nombres, apellidos y email.";
        }
        if (!form.rolId) {
            return "Seleccione un rol.";
        }
        if (esPortero && (!form.condominioId || !form.entradaId || !form.turno)) {
            return "Un portero necesita condominio, entrada (puerta) y turno.";
        }
        if (!form.password?.trim()) {
            return editMode
                ? "Ingresa la contraseña para guardar los cambios."
                : "La contraseña es obligatoria.";
        }
        if (form.telefono && form.telefono.length > MAX_TELEFONO) {
            return "El teléfono debe tener máximo 9 dígitos.";
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            return "El email no es válido.";
        }
        return "";
    };

    const save = async () => {
        const validation = validate();
        if (validation) {
            setModalError(validation);
            return;
        }
        setSaving(true);
        setModalError("");
        const payload = {
            ...form,
            telefono: form.telefono || null,
            apartamentoId: form.apartamentoId || null,
            entradaId: form.entradaId || null,
            turno: form.turno || null,
            password: form.password.trim(),
        };
        try {
            if (editMode) {
                const updated = await usuarioService.update(selected.id, payload);
                setItems((prev) =>
                    prev.map((item) => (item.id === selected.id ? updated : item)),
                );
                await showSuccess("Usuario actualizado correctamente.");
            } else {
                const created = await usuarioService.create(payload);
                setItems((prev) => [...prev, created]);
                await showSuccess("Usuario creado correctamente.");
            }
            setShowModal(false);
        } catch (err) {
            const msg = getApiErrorMessage(err, "Error al guardar el usuario");
            setModalError(msg);
            await showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (item) => {
        const ok = await confirmDelete(`el usuario ${item.nombres} ${item.apellidos}`);
        if (!ok) return;
        setDeletingId(item.id);
        try {
            await usuarioService.delete(item.id);
            setItems((prev) => prev.filter((u) => u.id !== item.id));
            await showSuccess("Usuario eliminado correctamente.");
        } catch (err) {
            await showError(getApiErrorMessage(err, "Error al eliminar el usuario"));
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
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />
            <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }}>
                <SearchableSelect
                    options={rolOptions}
                    value={filtroRolId}
                    onChange={setFiltroRolId}
                    disabled={loading}
                    placeholder="Filtrar por rol..."
                    allowEmpty
                    emptyLabel="Todos los roles"
                    inputClassName="form-control form-control-sm w-100"
                />
            </div>
        </div>
    );

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">
                {item.nombres} {item.apellidos}
            </td>
            <td className="px-4 py-3">{item.email}</td>
            <td className="px-4 py-3">{item.rolNombre || "—"}</td>
            <td className="px-4 py-3">
                <span className={`badge ${ESTADO_STYLE[item.estado] || "bg-secondary"}`}>
                    {item.estado}
                </span>
            </td>
            <RowActions
                onEdit={() => openEdit(item)}
                onDelete={() => remove(item)}
                saving={busy || deletingId === item.id}
                canEdit={canEdit}
                canDelete={canDelete}
            />
        </tr>
    ));

    return (
        <CrudPageLayout
            loading={loading}
            title="Configuración del Sistema"
            subtitle="Administración de usuarios del condominio"
            pageError={pageError}
            onDismissError={() => setPageError("")}
        >
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${activeTab === "usuarios" ? "active" : ""}`}
                        onClick={() => setActiveTab("usuarios")}
                    >
                        Usuarios
                    </button>
                </li>
                {canManagePermisos && (
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link ${activeTab === "permisos" ? "active" : ""}`}
                            onClick={() => setActiveTab("permisos")}
                        >
                            Permisos por rol
                        </button>
                    </li>
                )}
            </ul>

            {activeTab === "usuarios" && (
                <CrudTableCard
                    title="Usuarios"
                    filter={tableFilter}
                    onAdd={openCreate}
                    canAdd={canCreate}
                    addLabel="Nuevo Usuario"
                    saving={busy}
                    columns={COLUMNS}
                    colSpan={COLUMNS.length}
                    emptyMessage={
                        search.trim() || filtroRolId
                            ? "No hay resultados para la búsqueda"
                            : "No hay usuarios registrados"
                    }
                    rows={rows}
                    pagination={pagination}
                />
            )}

            {activeTab === "permisos" && canManagePermisos && (
                <RolPermisosPanel roles={staffRoles} saving={saving} setSaving={setSaving} />
            )}

            <CrudModal
                show={showModal}
                title={editMode ? "Editar Usuario" : "Nuevo Usuario"}
                error={modalError}
                saving={saving}
                onClose={closeModal}
                onSave={save}
                editMode={editMode}
            >
                <div className="row g-0">
                    <div className="col-md-6 pe-md-2">
                        <FormField label="Nombres" required>
                            <input
                                type="text"
                                className="form-control"
                                value={form.nombres}
                                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                                disabled={saving}
                            />
                        </FormField>
                    </div>
                    <div className="col-md-6 ps-md-2">
                        <FormField label="Apellidos" required>
                            <input
                                type="text"
                                className="form-control"
                                value={form.apellidos}
                                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                                disabled={saving}
                            />
                        </FormField>
                    </div>
                </div>
                <FormField label="Email" required>
                    <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Teléfono">
                    <input
                        type="tel"
                        className="form-control"
                        value={form.telefono}
                        onChange={(e) =>
                            setForm({ ...form, telefono: limitTelefono(e.target.value) })
                        }
                        maxLength={MAX_TELEFONO}
                        inputMode="numeric"
                        disabled={saving}
                        placeholder="Máx. 9 dígitos"
                    />
                </FormField>
                <FormField label="Contraseña" required>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            disabled={saving}
                            placeholder={editMode ? "Requerida al actualizar" : ""}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="input-group-text"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            disabled={saving}
                            aria-label={
                                showPassword
                                    ? "Ocultar contraseña"
                                    : "Mostrar contraseña"
                            }
                        >
                            <i
                                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                            />
                        </button>
                    </div>
                </FormField>
                <FormField label="Rol" required>
                    <SearchableSelect
                        key={editMode ? `rol-edit-${selected?.id}` : `rol-create-${createFormKey}`}
                        options={rolOptions}
                        value={form.rolId}
                        onChange={(id) => setForm({ ...form, rolId: id })}
                        disabled={saving}
                        placeholder="Seleccione un rol"
                        inputClassName="form-control"
                    />
                </FormField>
                <FormField label="Tipo de ocupante" required>
                    <select
                        className="form-select"
                        value={form.tipoOcupante}
                        onChange={(e) => setForm({ ...form, tipoOcupante: e.target.value })}
                        disabled={saving}
                    >
                        <option value="PROPIETARIO">Propietario</option>
                        <option value="INQUILINO">Inquilino</option>
                        <option value="VISITANTE">Visitante</option>
                    </select>
                </FormField>
                <FormField label="Apartamento">
                    <SearchableSelect
                        key={
                            editMode
                                ? `apto-edit-${selected?.id}-${form.apartamentoId}`
                                : `apto-create-${createFormKey}`
                        }
                        options={apartamentoOptions}
                        value={form.apartamentoId}
                        onChange={(id) => setForm({ ...form, apartamentoId: id })}
                        disabled={saving}
                        placeholder="Buscar apartamento..."
                        allowEmpty
                        emptyLabel="Sin apartamento"
                        inputClassName="form-control"
                    />
                </FormField>
                <FormField label="Condominio (para admin de condominio)">
                    <SearchableSelect
                        key={
                            editMode
                                ? `cond-edit-${selected?.id}-${form.condominioId}`
                                : `cond-create-${createFormKey}`
                        }
                        options={condominioOptions}
                        value={form.condominioId}
                        onChange={(id) => setForm({ ...form, condominioId: id })}
                        disabled={saving}
                        placeholder="Asignar a un condominio..."
                        allowEmpty
                        emptyLabel="Sin condominio (no es admin de condominio)"
                        inputClassName="form-control"
                    />
                </FormField>
                {esPortero && (
                    <>
                        <FormField label="Entrada (puerta que cubre)" required>
                            <SearchableSelect
                                key={`entrada-portero-${form.condominioId}`}
                                options={entradasDeCondominio}
                                value={form.entradaId}
                                onChange={(id) => setForm({ ...form, entradaId: id })}
                                disabled={saving || !form.condominioId}
                                placeholder={
                                    form.condominioId
                                        ? "Selecciona la entrada que cubre"
                                        : "Primero asigna el condominio (arriba)"
                                }
                                inputClassName="form-control"
                            />
                        </FormField>
                        <FormField label="Turno" required>
                            <select
                                className="form-select"
                                value={form.turno}
                                onChange={(e) => setForm({ ...form, turno: e.target.value })}
                                disabled={saving}
                            >
                                <option value="">Selecciona turno</option>
                                <option value="DIA">Día</option>
                                <option value="NOCHE">Noche</option>
                            </select>
                        </FormField>
                    </>
                )}
                <FormField label="Estado" required>
                    <select
                        className="form-select"
                        value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                        disabled={saving}
                    >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="BLOQUEADO">Bloqueado</option>
                    </select>
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default ConfiguracionPage;
