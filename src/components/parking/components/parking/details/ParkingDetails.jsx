import { useState } from "react";
import ReassignModal from "../modals/ReassignModal";
import MaintenanceModal from "../modals/MaintenanceModal";

export default function ParkingDetails({
  spot,
  onClose,
  onReassign,
  onToggleMaintenance,
}) {
  const [showReassign, setShowReassign] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);

  if (!spot) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 text-sm min-h-[200px]">
        <span
          className="material-symbols-outlined text-slate-300 mb-2"
          style={{ fontSize: 40 }}
        >
          local_parking
        </span>
        Selecciona un espacio para ver detalles
      </div>
    );
  }

  const statusLabel = {
    occupied: { label: "OCUPADO", classes: "bg-red-100 text-red-600" },
    available: { label: "DISPONIBLE", classes: "bg-green-100 text-green-600" },
    reserved: { label: "RESERVADO", classes: "bg-blue-100 text-blue-600" },
    maintenance: {
      label: "MANTENIMIENTO",
      classes: "bg-slate-100 text-slate-500",
    },
  };

  const { label, classes } = statusLabel[spot.status] || {};
  const isMaintenance = spot.status === "maintenance";
  const canToggleMaintenance = spot.status === "available" || isMaintenance;

  function handleReassign(unit, plate) {
    setShowReassign(false);
    onReassign?.(spot.id, unit, plate);
  }

  function handleMaintenance(newStatus) {
    setShowMaintenance(false);
    onToggleMaintenance?.(spot.id, newStatus);
  }

  return (
    <>
      {showReassign && (
        <ReassignModal
          onConfirm={handleReassign}
          onCancel={() => setShowReassign(false)}
        />
      )}

      {showMaintenance && (
        <MaintenanceModal
          isEntering={!isMaintenance}
          onConfirm={handleMaintenance}
          onCancel={() => setShowMaintenance(false)}
        />
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
        {/* ENCABEZADO */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Espacio {spot.code}
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider ${classes}`}
              >
                {label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 lg:hidden"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        {/* VEHÍCULO */}
        {spot.status === "occupied" && spot.plate && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Vehículo Actual
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-600">
                directions_car
              </span>
              <div>
                <p className="font-bold text-slate-900">{spot.plate}</p>
                <p className="text-xs text-slate-400">
                  {spot.desc || "Vehículo registrado"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RESIDENTE ASIGNADO */}
        {spot.status === "occupied" && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Residente Asignado
            </p>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {spot.initials || "JD"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {spot.owner || "Ocupación Actual"}
                </p>
                <p className="text-xs text-slate-500">
                  {spot.unit || "Unidad --"} • Inquilino Principal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AVISO: espacio no disponible para mantenimiento */}
        {!canToggleMaintenance && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span
              className="material-symbols-outlined text-amber-500"
              style={{ fontSize: 18 }}
            >
              info
            </span>
            <p className="text-xs text-amber-700">
              Solo se puede marcar para mantenimiento si el espacio está
              disponible.
            </p>
          </div>
        )}

        {/* BOTONES */}
        <div className="flex flex-col gap-3 mt-auto pt-1">
          {!isMaintenance && (
            <button
              onClick={() => setShowReassign(true)}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 17 }}
              >
                swap_horiz
              </span>
              Reasignar a Unidad
            </button>
          )}

          <button
            onClick={() => canToggleMaintenance && setShowMaintenance(true)}
            disabled={!canToggleMaintenance}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors
              ${
                isMaintenance
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : canToggleMaintenance
                    ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "border border-slate-100 text-slate-300 cursor-not-allowed"
              }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 17 }}
            >
              {isMaintenance ? "check_circle" : "build"}
            </span>
            {isMaintenance
              ? "Marcar como Disponible"
              : "Marcar para Mantenimiento"}
          </button>
        </div>
      </div>
    </>
  );
}
