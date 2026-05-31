import { useState, useEffect, useMemo } from "react";
import { apartamentoService } from "../../services/apartamentoService";
import { pisoService } from "../../services/pisoService";
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

const EMPTY_FORM = {
    numero: "",
    area: "",
    condominioId: "",
    torreId: "",
    pisoId: "",
    estado: "DISPONIBLE",
};

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

const ApartamentosPage = () => {
    const [items, setItems] = useState([]);
    const [pisos, setPisos] = useState([]);
    const [torres, setTorres] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");
    const [success, setSuccess] = useState("");
    const [filtroPisoId, setFiltroPisoId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [modalError, setModalError] = useState("");

    const loadCatalogos = async () => {
        const [pisosData, torresData, condosData] = await Promise.all([
            pisoService.getAll(),
            torreService.getAll(),
            condominioService.getAll(),
        ]);
        setPisos(pisosData);
        setTorres(torresData);
        setCondominios(condosData);
    };

    const loadItems = async (pisoId = filtroPisoId) => {
        const data = await apartamentoService.getAll(pisoId || undefined);
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

    useEffect(() => {
        if (loading) return;
        (async () => {
            setFiltering(true);
            try {
                await loadItems(filtroPisoId);
            } catch (err) {
                setPageError(getApiErrorMessage(err, "Error al filtrar apartamentos"));
            } finally {
                setFiltering(false);
            }
        })();
    }, [filtroPisoId]);

    const torresForm = useMemo(() => {
        if (!form.condominioId) return torres;
        return torres.filter((t) => t.condominioId === Number(form.condominioId));
    }, [torres, form.condominioId]);

    const pisosForm = useMemo(() => {
        if (!form.torreId) return [];
        return pisos.filter((p) => p.torreId === Number(form.torreId));
    }, [pisos, form.torreId]);

    const openCreate = () => {
        setEditMode(false);
        setSelected(null);
        setForm(EMPTY_FORM);
        setModalError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        const piso = pisos.find((p) => p.id === item.pisoId);
        const torre = piso ? torres.find((t) => t.id === piso.torreId) : null;
        setEditMode(true);
        setSelected(item);
        setForm({
            numero: item.numero || "",
            area: item.area ?? "",
            condominioId: torre?.condominioId || item.condominioId || "",
            torreId: piso?.torreId || item.torreId || "",
            pisoId: item.pisoId || "",
            estado: item.estado || "DISPONIBLE",
        });
        setModalError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalError("");
    };

    const handleCondominioChange = (condominioId) => {
        setForm((prev) => ({ ...prev, condominioId, torreId: "", pisoId: "" }));
    };

    const handleTorreChange = (torreId) => {
        setForm((prev) => ({ ...prev, torreId, pisoId: "" }));
    };

    const handleSave = async () => {
        if (!form.condominioId || !form.torreId || !form.pisoId || !form.numero.trim()) {
            setModalError("Completa condominio, torre, piso y número.");
            return;
        }
        if (form.area !== "" && (Number.isNaN(Number(form.area)) || Number(form.area) <= 0)) {
            setModalError("El área debe ser un número positivo.");
            return;
        }
        setSaving(true);
        setModalError("");
        setSuccess("");
        const payload = {
            numero: form.numero.trim(),
            pisoId: form.pisoId,
            area: form.area,
            estado: form.estado,
        };
        try {
            if (editMode) {
                await apartamentoService.update(selected.id, payload);
                setSuccess("Apartamento actualizado correctamente.");
            } else {
                await apartamentoService.create(payload);
                setSuccess("Apartamento creado correctamente.");
            }
            await Promise.all([loadCatalogos(), loadItems(filtroPisoId)]);
            closeModal();
        } catch (err) {
            setModalError(getApiErrorMessage(err, "Error al guardar"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Eliminar el apartamento ${item.numero}?`)) return;
        setSaving(true);
        setSuccess("");
        try {
            await apartamentoService.delete(item.id);
            await loadItems(filtroPisoId);
            setSuccess("Apartamento eliminado correctamente.");
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
            style={{ width: "220px" }}
            value={filtroPisoId}
            onChange={(e) => setFiltroPisoId(e.target.value)}
        >
            <option value="">Todos los pisos</option>
            {pisos.map((p) => (
                <option key={p.id} value={p.id}>
                    Piso {p.numero} — {p.torreNombre || torres.find((t) => t.id === p.torreId)?.nombre}
                </option>
            ))}
        </select>
    );

    const pagination = usePagination(items);

    const rows = pagination.paginatedItems.map((item, index) => (
        <tr key={item.id}>
            <td className="px-4 py-3">{pagination.rowIndex(index)}</td>
            <td className="fw-semibold px-4 py-3">{item.numero}</td>
            <td className="px-4 py-3">{item.area != null ? item.area : "—"}</td>
            <td className="px-4 py-3">Piso {item.pisoNumero ?? pisos.find((p) => p.id === item.pisoId)?.numero ?? "—"}</td>
            <td className="px-4 py-3">{item.torreNombre || "—"}</td>
            <td className="px-4 py-3">{getCondominioNombre(item.condominioId)}</td>
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
            title="Gestión de Apartamentos"
            subtitle="Administra las unidades residenciales de cada piso"
            pageError={pageError}
            success={success}
            onDismissError={() => setPageError("")}
            onDismissSuccess={() => setSuccess("")}
        >
            <CrudTableCard
                title="Listado de Apartamentos"
                filter={filter}
                onAdd={openCreate}
                addLabel="Agregar Apartamento"
                filtering={filtering}
                saving={saving}
                columns={COLUMNS}
                colSpan={COLUMNS.length}
                emptyMessage="No hay apartamentos registrados"
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
                <FormField label="Condominio" required>
                    <select
                        className="form-select"
                        value={form.condominioId}
                        onChange={(e) => handleCondominioChange(e.target.value)}
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
                <FormField label="Torre" required>
                    <select
                        className="form-select"
                        value={form.torreId}
                        onChange={(e) => handleTorreChange(e.target.value)}
                        disabled={saving || !form.condominioId}
                    >
                        <option value="">Selecciona una torre</option>
                        {torresForm.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nombre}
                            </option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Piso" required>
                    <select
                        className="form-select"
                        value={form.pisoId}
                        onChange={(e) => setForm({ ...form, pisoId: e.target.value })}
                        disabled={saving || !form.torreId}
                    >
                        <option value="">Selecciona un piso</option>
                        {pisosForm.map((p) => (
                            <option key={p.id} value={p.id}>
                                Piso {p.numero}
                            </option>
                        ))}
                    </select>
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
