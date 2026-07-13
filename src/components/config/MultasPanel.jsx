import { useEffect, useMemo, useState } from "react";
import { configuracionMultaService } from "../../services/configuracionMultaService";
import { getApiErrorMessage } from "../../services/api";
import { showSuccess } from "../../utils/swalHelpers";

/**
 * Panel de configuración de multas por condominio (spec V6).
 * El Admin_Condominio define el tiempo límite (min) y la tarifa por minuto que se
 * aplican a las penalizaciones de préstamos de carritos. Si no hay config guardada,
 * el backend responde los valores por defecto del sistema (marcados como "por defecto").
 */
export default function MultasPanel({ condominios = [] }) {
    const opciones = useMemo(
        () => condominios.map((c) => ({ id: c.id, nombre: c.nombre })),
        [condominios],
    );

    const [condominioId, setCondominioId] = useState("");
    const [form, setForm] = useState({ tiempoLimiteMinutos: "", tarifaPorMinuto: "" });
    const [porDefecto, setPorDefecto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Autoselecciona el primer (o único) condominio disponible.
    useEffect(() => {
        if (!condominioId && opciones.length > 0) {
            setCondominioId(String(opciones[0].id));
        }
    }, [opciones, condominioId]);

    // Carga la config efectiva del condominio elegido.
    useEffect(() => {
        if (!condominioId) return;
        let cancel = false;
        setLoading(true);
        setError("");
        configuracionMultaService
            .getByCondominio(condominioId)
            .then((cfg) => {
                if (cancel) return;
                setForm({
                    tiempoLimiteMinutos: cfg?.tiempoLimiteMinutos ?? "",
                    tarifaPorMinuto: cfg?.tarifaPorMinuto ?? "",
                });
                setPorDefecto(!!cfg?.porDefecto);
            })
            .catch((e) => !cancel && setError(getApiErrorMessage(e, "No se pudo cargar la configuración.")))
            .finally(() => !cancel && setLoading(false));
        return () => {
            cancel = true;
        };
    }, [condominioId]);

    const guardar = async () => {
        if (form.tiempoLimiteMinutos === "" || Number(form.tiempoLimiteMinutos) < 0) {
            setError("El tiempo límite debe ser 0 o mayor.");
            return;
        }
        if (form.tarifaPorMinuto === "" || Number(form.tarifaPorMinuto) < 0) {
            setError("La tarifa por minuto debe ser 0 o mayor.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const saved = await configuracionMultaService.upsert({
                condominioId,
                tiempoLimiteMinutos: form.tiempoLimiteMinutos,
                tarifaPorMinuto: form.tarifaPorMinuto,
            });
            setPorDefecto(!!saved?.porDefecto);
            await showSuccess("Configuración de multas guardada.");
        } catch (e) {
            setError(getApiErrorMessage(e, "No se pudo guardar la configuración."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
                <i className="bi bi-cash-coin text-primary" />
                <div>
                    <h5 className="mb-0 fw-semibold">Configuración de multas</h5>
                    <small className="text-muted">
                        Tiempo límite y tarifa por minuto para las penalizaciones de carritos.
                    </small>
                </div>
            </div>
            <div className="card-body px-4 pb-4" style={{ maxWidth: "560px" }}>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <div className="mb-3">
                    <label className="form-label fw-semibold">Condominio</label>
                    <select
                        className="form-select"
                        value={condominioId}
                        onChange={(e) => setCondominioId(e.target.value)}
                        disabled={saving || opciones.length <= 1}
                    >
                        {opciones.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {porDefecto && (
                    <div className="alert alert-info d-flex align-items-center gap-2 py-2 small">
                        <i className="bi bi-info-circle" />
                        Este condominio usa los valores por defecto del sistema. Guarda para
                        personalizarlos.
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label fw-semibold">Tiempo límite (minutos)</label>
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={form.tiempoLimiteMinutos}
                        onChange={(e) => setForm({ ...form, tiempoLimiteMinutos: e.target.value })}
                        disabled={loading || saving}
                    />
                    <small className="text-muted">
                        Pasado este tiempo, el préstamo genera penalización.
                    </small>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Tarifa por minuto</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={form.tarifaPorMinuto}
                        onChange={(e) => setForm({ ...form, tarifaPorMinuto: e.target.value })}
                        disabled={loading || saving}
                    />
                    <small className="text-muted">Monto por cada minuto excedido.</small>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={guardar}
                    disabled={loading || saving || !condominioId}
                >
                    {saving ? "Guardando…" : "Guardar configuración"}
                </button>
            </div>
        </div>
    );
}
