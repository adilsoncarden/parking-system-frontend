export default function ParkingSpot({ spot, onClick, isSelected }) {
  const config = {
    available: {
      wrap: "border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-md",
      bay: "bg-emerald-50",
      icon: "local_parking",
      iconColor: "text-emerald-500",
      label: "Libre",
      labelClass: "text-emerald-700 bg-emerald-100",
    },
    occupied: {
      wrap: "border-slate-300 bg-white hover:shadow-md",
      bay: "bg-slate-900",
      icon: "directions_car",
      iconColor: "text-white",
      label: spot.plate || "Ocupado",
      labelClass: "text-red-700 bg-red-100",
    },
    maintenance: {
      wrap: "border-amber-200 bg-slate-50 opacity-80 cursor-not-allowed",
      bay: "bg-amber-50",
      icon: "build",
      iconColor: "text-amber-500",
      label: "Mantención",
      labelClass: "text-amber-700 bg-amber-100",
    },
    reserved: {
      wrap: "border-blue-200 bg-white hover:shadow-md",
      bay: "bg-blue-50",
      icon: "event_available",
      iconColor: "text-blue-500",
      label: "Reservado",
      labelClass: "text-blue-700 bg-blue-100",
    },
  };

  const c = config[spot.status] || config.available;
  const isDisabled = spot.status === "maintenance";

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={`${spot.code}${spot.plate ? ` · ${spot.plate}` : ""}`}
      className={`
        group relative border-2 rounded-xl overflow-hidden text-left transition-all w-full
        ${c.wrap}
        ${isSelected ? "ring-2 ring-slate-900 ring-offset-1" : ""}
        ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Código de la plaza */}
      <div className="flex items-center justify-between px-2 pt-1.5">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">
          {spot.code}
        </span>
        <span className="material-symbols-outlined text-slate-300 shrink-0" style={{ fontSize: 14 }}>
          local_parking
        </span>
      </div>

      {/* Bahía: auto / icono de estado */}
      <div className={`mx-2 mt-1 rounded-lg ${c.bay} flex items-center justify-center h-11 sm:h-14`}>
        <span className={`material-symbols-outlined ${c.iconColor}`} style={{ fontSize: 26 }}>
          {c.icon}
        </span>
      </div>

      {/* Etiqueta de estado / placa */}
      <div className="px-2 py-1.5">
        <div
          className={`text-[9px] sm:text-[10px] font-bold text-center py-0.5 rounded ${c.labelClass} truncate tracking-wide`}
        >
          {c.label}
        </div>
      </div>
    </button>
  );
}
