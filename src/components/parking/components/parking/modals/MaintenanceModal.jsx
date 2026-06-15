export default function MaintenanceModal({ isEntering, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {isEntering
              ? "Marcar para Mantenimiento"
              : "Salir de Mantenimiento"}
          </h3>
          <button onClick={onCancel}>✕</button>
        </div>

        <p className="text-sm text-slate-500">
          {isEntering
            ? "¿Confirmas que este espacio entrará en mantenimiento?"
            : "¿Confirmas que el espacio está listo para uso?"}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-200 rounded-xl py-2"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(isEntering ? "maintenance" : "available")}
            className={`flex-1 text-white rounded-xl py-2 ${
              isEntering
                ? "bg-slate-900 hover:bg-slate-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
