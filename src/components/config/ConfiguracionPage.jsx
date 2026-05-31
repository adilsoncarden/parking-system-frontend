import { useState, useEffect } from "react";
import { usuarioService } from "../../services/usuarioService";
import { rolService } from "../../services/rolService";
import { apartamentoService } from "../../services/apartamentoService";
import { getApiErrorMessage } from "../../services/api";
import { confirmDelete, showSuccess, showError } from "../../utils/swalHelpers";
import CrudPageLayout from "../infraestructura/crud/CrudPageLayout";
import CrudTableCard from "../infraestructura/crud/CrudTableCard";
import CrudModal from "../infraestructura/crud/CrudModal";
import FormField from "../infraestructura/crud/FormField";
import RowActions from "../infraestructura/crud/RowActions";
import { usePagination } from "../../hooks/usePagination";

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
};

const COLUMNS = [
    { key: "idx", label: "#" },
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "rol", label: "Rol" },
    { key: "tipo", label: "Tipo" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones", className: "text-end" },
];

const ESTADO_STYLE = {
    ACTIVO: "bg-success",
    INACTIVO: "bg-secondary",
    BLOQUEADO: "bg-danger",
};

const ConfiguracionPage = () => {
    const [items, setItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [apartamentos, setApartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [filtroRolId, setFiltroRolId] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");

    const load = async (rolId = filtroRolId) => {
        const [usuarios, rolesData, aptos] = await Promise.all([
            usuarioService.getAll(rolId || undefined),
            rolService.getAll(),
            apartamentoService.getAll(),
        ]);
        setItems(usuarios);
        setRoles(rolesData);
        setApartamentos(aptos);
    };

    useEffect(() => {
        (async () => {
            try {
                setPageError("");
                await load();
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al cargar usuarios"));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (loading) return;
        (async () => {
            try {
                await load(filtroRolId);
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al filtrar usuarios"));
            }
        })();
    }, [filtroRolId]);

    const filtered = items.filter((u) => {
        const q = search.toLowerCase();
        const nombre = `${u.nombres} ${u.apellidos}`.toLowerCase();
        return nombre.includes(q) || (u.email || "").toLowerCase().includes(q);
    });

    const pagination = usePagination(filtered);

    const openCreate = () => {
        setEditMode(false);
        setSelected(null);
        setForm({ ...EMPTY_FORM, rolId: roles[0]?.id || "" });
        setModalError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditMode(true);
        setSelected(item);
        setForm({
            nombres: item.nombres || "",
            apellidos: item.apellidos || "",
            email: item.email || "",
            telefono: item.telefono || "",
            password: "",
            tipoOcupante: item.tipoOcupante || "PROPIETARIO",
            estado: item.estado || "ACTIVO",
            rolId: item.rolId || "",
            apartamentoId: item.apartamentoId || "",
        });
        setModalError("");
        setShowModal(true);
    };

    const save = async () => {
        if (!form.nombres?.trim() || !form.apellidos?.trim() || !form.email?.trim() || !form.rolId) {
            setModalError("Completa los campos obligatorios.");
            return;
        }
        if (!form.password?.trim()) {
            setModalError(editMode ? "Ingresa la contraseña para guardar los cambios." : "La contraseña es obligatoria.");
            return;
        }
        setSaving(true);
        setModalError("");
        const payload = {
            ...form,
            apartamentoId: form.apartamentoId || null,
            password: form.password.trim(),
        };
        try {
            if (editMode) {
                await usuarioService.update(selected.id, payload);
                await showSuccess("Usuario actualizado correctamente.");
            } else {
                await usuarioService.create(payload);
                await showSuccess("Usuario creado correctamente.");
            }
            await load(filtroRolId);
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
        setSaving(true);
        try {
            await usuarioService.delete(item.id);
            await load(filtroRolId);
            await showSuccess("Usuario eliminado correctamente.");
        } catch (err) {
            await showError(getApiErrorMessage(err, "Error al eliminar el usuario"));
        } finally {
            setSaving(false);
        }
    };

    const filter = (
        <div className="d-flex gap-2 flex-wrap">
            <input
                type="search"
                className="form-control form-control-sm"
                style={{ width: "220px" }}
                placeholder="Buscar nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <select
                className="form-select form-select-sm"
                style={{ width: "180px" }}
                value={filtroRolId}
                onChange={(e) => setFiltroRolId(e.target.value)}
            >
                <option value="">Todos los roles</option>
                {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
            </select>
        </div>
    );

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.nombres} {item.apellidos}</td>
            <td className="px-4 py-3">{item.email}</td>
            <td className="px-4 py-3">{item.rolNombre || "—"}</td>
            <td className="px-4 py-3">{item.tipoOcupante}</td>
            <td className="px-4 py-3">
                <span className={`badge ${ESTADO_STYLE[item.estado] || "bg-secondary"}`}>{item.estado}</span>
            </td>
            <RowActions onEdit={() => openEdit(item)} onDelete={() => remove(item)} saving={saving} />
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
            <CrudTableCard
                title="Usuarios"
                filter={filter}
                onAdd={openCreate}
                addLabel="Nuevo Usuario"
                saving={saving}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage="No hay usuarios registrados"
                rows={rows}
                pagination={pagination}
            />

            <CrudModal
                show={showModal}
                title={editMode ? "Editar Usuario" : "Nuevo Usuario"}
                error={modalError}
                saving={saving}
                onClose={() => setShowModal(false)}
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
                        type="text"
                        className="form-control"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        disabled={saving}
                    />
                </FormField>
                <FormField label="Contraseña" required>
                    <input
                        type="password"
                        className="form-control"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        disabled={saving}
                        placeholder={editMode ? "Requerida al actualizar" : ""}
                    />
                </FormField>
                <FormField label="Rol" required>
                    <select
                        className="form-select"
                        value={form.rolId}
                        onChange={(e) => setForm({ ...form, rolId: e.target.value })}
                        disabled={saving}
                    >
                        <option value="">Selecciona un rol</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.nombre}</option>
                        ))}
                    </select>
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
                    <select
                        className="form-select"
                        value={form.apartamentoId}
                        onChange={(e) => setForm({ ...form, apartamentoId: e.target.value })}
                        disabled={saving}
                    >
                        <option value="">Sin apartamento</option>
                        {apartamentos.map((a) => (
                            <option key={a.id} value={a.id}>Apto {a.numero}</option>
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
                        <option value="BLOQUEADO">Bloqueado</option>
                    </select>
                </FormField>
            </CrudModal>
        </CrudPageLayout>
    );
};

export default ConfiguracionPage;
