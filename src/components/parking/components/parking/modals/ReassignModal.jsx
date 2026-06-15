import { useState, useMemo } from "react";
import { useParking } from "../../../context/ParkingContext";

export default function ReassignModal({ onConfirm, onCancel }) {
  const { vehicles } = useParking();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [plate, setPlate] = useState("");

  const COLORS = [
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
  ];

  const residents = useMemo(
    () =>
      vehicles
        .filter((v) => v.tipoOcupante === "residente" && v.estado === "activo")
        .map((v, i) => ({
          id: v.id,
          code: v.unidad,
          resident: v.propietario,
          plate: v.placa,
          vehiculoDesc: v.vehiculoDesc,
          initials: v.propietario
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          color: COLORS[i % COLORS.length],
        })),
    [vehicles],
  );

  const filtered = useMemo(
    () =>
      residents.filter(
        (u) =>
          !query ||
          u.code.toLowerCase().includes(query.toLowerCase()) ||
          u.resident.toLowerCase().includes(query.toLowerCase()) ||
          u.plate.toLowerCase().includes(query.toLowerCase()),
      ),
    [residents, query],
  );

  const handleSelect = (u) => {
    setSelected(u);
    setPlate(u.plate);
  };

  const canConfirm = selected && plate.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Reasignar Espacio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona un residente activo
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              close
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* BÚSQUEDA */}
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 16 }}
            >
              search
            </span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
                setPlate("");
              }}
              placeholder="Buscar unidad, residente o placa..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
            />
          </div>

          {/* LISTA DE RESIDENTES */}
          <div className="max-h-44 overflow-y-auto flex flex-col gap-1.5 -mx-1 px-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No se encontraron residentes
              </p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full
                    ${
                      selected?.id === u.id
                        ? "border-slate-900 bg-slate-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${u.color}`}
                  >
                    {u.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      Unidad {u.code}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {u.resident}
                    </p>
                  </div>
                  {selected?.id === u.id && (
                    <span
                      className="material-symbols-outlined text-slate-900 shrink-0"
                      style={{ fontSize: 18 }}
                    >
                      check_circle
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* VEHÍCULO — aparece solo al seleccionar */}
          {selected && (
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vehículo
              </p>

              {/* Descripción del vehículo si existe */}
              {selected.vehiculoDesc && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-slate-500"
                    style={{ fontSize: 16 }}
                  >
                    directions_car
                  </span>
                  <span className="text-xs text-slate-600">
                    {selected.vehiculoDesc}
                  </span>
                </div>
              )}

              {/* Input de placa */}
              <div className="relative">
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Placa del vehículo"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-900/20 bg-white"
                />
                {selected.plate && plate !== selected.plate && (
                  <button
                    onClick={() => setPlate(selected.plate)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-indigo-600 font-semibold hover:underline"
                  >
                    Restaurar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm(selected, plate)}
            className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
