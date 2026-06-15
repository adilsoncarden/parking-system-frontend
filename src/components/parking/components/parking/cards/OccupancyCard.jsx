export default function OccupancyCard({ data }) {
  if (!data) return null;

  const { occupied, total, available } = data;

  const percent = total ? Math.round((occupied / total) * 100) : 0;

  const color =
    percent < 50
      ? "bg-green-500"
      : percent < 80
        ? "bg-yellow-500"
        : "bg-red-500";

  const textColor =
    percent < 50
      ? "text-green-600"
      : percent < 80
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 w-full sm:w-80 md:w-96 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          Ocupación
        </p>

        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${textColor} bg-slate-100`}
        >
          {percent}%
        </span>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* STATS */}
      <div className="flex justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-slate-600">{occupied} ocupados</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-slate-600">{available} libres</span>
        </div>
      </div>
    </div>
  );
}
