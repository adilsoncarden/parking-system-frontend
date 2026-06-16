import ParkingSpot from "./ParkingSpot";

export default function ParkingGrid({ spots, selectedId, onSelect }) {
  if (!spots.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-2 block">local_parking</span>
        No hay espacios que coincidan con el filtro.
      </div>
    );
  }

  // Agrupar en dos niveles: condominio → zona (torre).
  const byCondo = {};
  for (const s of spots) {
    const c = s.condominio || "Sin condominio";
    const z = s.zona || "Sin zona";
    (byCondo[c] ||= {});
    (byCondo[c][z] ||= []).push(s);
  }
  const condos = Object.keys(byCondo).sort();

  return (
    <div className="space-y-5">
      {condos.map((condo) => {
        const zonas = byCondo[condo];
        const allSpots = Object.values(zonas).flat();
        const total = allSpots.length;
        const ocupados = allSpots.filter((s) => s.status === "occupied").length;
        const pct = total ? Math.round((ocupados / total) * 100) : 0;

        return (
          <div
            key={condo}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
          >
            {/* Cabecera del condominio */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 bg-linear-to-r from-slate-900 to-slate-700 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-2xl shrink-0">apartment</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate">{condo}</h3>
                  <p className="text-xs text-slate-300">
                    {total} espacios · {Object.keys(zonas).length} torres
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase tracking-wide text-slate-300">Ocupación</div>
                <div className="font-bold text-lg leading-none">{pct}%</div>
              </div>
            </div>

            {/* Torres (zonas) */}
            <div className="p-4 sm:p-5 space-y-6">
              {Object.keys(zonas)
                .sort()
                .map((zona) => {
                  const slots = zonas[zona];
                  const libres = slots.filter((s) => s.status === "available").length;
                  return (
                    <div key={zona}>
                      {/* Cabecera de torre, estilo plano */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          meeting_room
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                          {zona}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {libres} libres / {slots.length}
                        </span>
                        <div className="flex-1 border-t border-dashed border-slate-200 ml-1" />
                      </div>

                      {/* Carril de bahías */}
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                          {slots.map((spot) => (
                            <ParkingSpot
                              key={spot.id}
                              spot={spot}
                              isSelected={selectedId === spot.id}
                              onClick={() => onSelect(spot.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
