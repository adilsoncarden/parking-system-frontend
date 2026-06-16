import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { parkingService } from "../../../services/parkingService";

/*
 * Registro de vehículo: en vez de escribir el propietario a mano, se elige
 * Condominio → Inquilino (usuario real con su unidad). Así el vehículo queda
 * asociado a un usuarioId real, que es lo que la API necesita.
 */
const VehicleModal = ({ isOpen, onClose, onSave }) => {
    const [condominios, setCondominios] = useState([]);
    const [inquilinos, setInquilinos] = useState([]);
    const [loadingInq, setLoadingInq] = useState(false);

    const [condominioId, setCondominioId] = useState("");
    const [usuarioId, setUsuarioId] = useState("");
    const [plate, setPlate] = useState("");
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [color, setColor] = useState("");

    // Cargar condominios al abrir
    useEffect(() => {
        if (!isOpen) return;
        setCondominioId("");
        setUsuarioId("");
        setPlate("");
        setMarca("");
        setModelo("");
        setColor("");
        setInquilinos([]);
        parkingService.getCondominios().then(setCondominios).catch(() => setCondominios([]));
    }, [isOpen]);

    // Cargar inquilinos del condominio elegido (solo los que tienen apartamento)
    useEffect(() => {
        if (!condominioId) {
            setInquilinos([]);
            return;
        }
        setLoadingInq(true);
        parkingService
            .getInquilinos(condominioId)
            .then((us) => setInquilinos(us.filter((u) => u.apartamentoId)))
            .catch(() => setInquilinos([]))
            .finally(() => setLoadingInq(false));
        setUsuarioId("");
    }, [condominioId]);

    const inquilinoSel = inquilinos.find((u) => String(u.id) === String(usuarioId));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!condominioId || !usuarioId || !plate.trim()) {
            alert("Selecciona condominio, inquilino y escribe la placa.");
            return;
        }
        onSave({
            placa: plate.trim().toUpperCase(),
            usuarioId: Number(usuarioId),
            marca,
            modelo,
            color,
            ownerName: inquilinoSel
                ? `${inquilinoSel.nombres} ${inquilinoSel.apellidos}`
                : "",
            unit: inquilinoSel?.unidad || "",
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="parking-module fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Registrar Nuevo Vehículo</h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

                        {/* CONDOMINIO */}
                        <div>
                            <label className="text-sm font-medium">Condominio</label>
                            <select
                                value={condominioId}
                                onChange={(e) => setCondominioId(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="">— Selecciona condominio —</option>
                                {condominios.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* INQUILINO */}
                        <div>
                            <label className="text-sm font-medium">Inquilino / Residente</label>
                            <select
                                value={usuarioId}
                                onChange={(e) => setUsuarioId(e.target.value)}
                                disabled={!condominioId || loadingInq}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white disabled:bg-gray-100"
                            >
                                <option value="">
                                    {loadingInq ? "Cargando…" : "— Selecciona inquilino —"}
                                </option>
                                {inquilinos.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nombres} {u.apellidos}{u.unidad ? ` — Unidad ${u.unidad}` : ""}
                                    </option>
                                ))}
                            </select>
                            {inquilinoSel && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {inquilinoSel.tipoOcupante} · Unidad {inquilinoSel.unidad || "—"}
                                </p>
                            )}
                        </div>

                        {/* PLACA */}
                        <div>
                            <label className="text-sm font-medium">Placa</label>
                            <input
                                type="text"
                                value={plate}
                                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md uppercase"
                                placeholder="ABC-123"
                            />
                        </div>

                        {/* DESCRIPCIÓN (opcional) */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-sm font-medium">Marca</label>
                                <input type="text" value={marca} onChange={(e) => setMarca(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Toyota" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Modelo</label>
                                <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Corolla" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Color</label>
                                <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Blanco" />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-black text-white rounded-md">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleModal;
