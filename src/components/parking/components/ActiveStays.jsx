import { useState } from "react";
import { useParking } from "../context/ParkingContext";
import { format } from "date-fns";

export default function ActiveStays() {
  const [filter, setFilter] = useState("");
  const { accessLog, registerExit } = useParking();

  const today = format(new Date(), "yyyy-MM-dd");

  const activeStays = accessLog.filter(
    (log) =>
      (log.estadoEntrada === "entrada_aprobada" ||
        log.estadoEntrada === "pendiente_manual") &&
      !log.horaSalida &&
      log.fecha === today,
  );

  const filteredStays = activeStays.filter((stay) =>
    stay.placa.toLowerCase().includes(filter.toLowerCase()),
  );

  const getDuration = (horaEntrada) => {
    if (!horaEntrada) return "--";
    const [h, m] = horaEntrada.split(":").map(Number);
    const now = new Date();
    const entrada = new Date();
    entrada.setHours(h, m, 0, 0);
    const diffMs = now - entrada;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 0) return "--";
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <section className="w-[400px] flex flex-col gap-6">
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[calc(100vh-128px)] shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-lg">
          <h3 className="font-semibold text-slate-800">Estancias Activas</h3>
          <span className="bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded text-xs">
            {filteredStays.length} Vehículos
          </span>
        </div>

        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
              placeholder="Filtrar placas..."
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredStays.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">
              No hay estancias activas
            </div>
          ) : (
            filteredStays.map((stay) => (
              <div
                key={stay.id}
                className="p-3 border border-slate-200 rounded bg-white hover:bg-slate-50 transition-colors group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center ${
                      stay.estadoEntrada === "pendiente_manual"
                        ? "bg-red-50 text-red-500"
                        : stay.tipoOcupante === "residente"
                          ? "bg-teal-50 text-teal-600"
                          : "bg-indigo-50 text-indigo-500"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      directions_car
                    </span>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-800 text-sm">
                      {stay.placa}
                    </div>
                    <div
                      className={`font-medium text-[10px] ${
                        stay.estadoEntrada === "pendiente_manual"
                          ? "text-red-500"
                          : stay.tipoOcupante === "residente"
                            ? "text-teal-600"
                            : "text-slate-500"
                      }`}
                    >
                      {stay.estadoEntrada === "pendiente_manual"
                        ? "Pendiente Manual"
                        : stay.tipoOcupante === "residente"
                          ? "Residente"
                          : "Visitante"}
                      {" • "}
                      {stay.unidad || getDuration(stay.horaEntrada)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => registerExit(stay.placa)}
                  className="text-slate-800 hover:bg-slate-800 hover:text-white border border-slate-800 px-3 py-1.5 rounded font-bold text-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  Registrar Salida
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
