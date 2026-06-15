import { ArrowRightToLine, ArrowLeftFromLine } from "lucide-react";

const AccessTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-slate-200 bg-white">
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider">
              FECHA
            </th>
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider">
              HORA ENTRADA
            </th>
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider">
              HORA SALIDA
            </th>
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider">
              PLACA
            </th>
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider">
              UNIDAD
            </th>
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider">
              TIPO DE OCUPANTE
            </th>
            <th className="px-6 py-4 font-semibold text-xs text-slate-500 tracking-wider text-right">
              DURACIÓN TOTAL
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? (
            data.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/50 transition-colors bg-white"
              >
                <td className="px-6 py-4 text-slate-700">{row.fecha}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <ArrowRightToLine size={14} className="opacity-80" />
                    {row.horaEntrada}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {row.horaSalida === "Aún dentro" ? (
                    <span className="text-slate-400 italic">Aún dentro</span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ArrowLeftFromLine size={14} className="opacity-70" />
                      {row.horaSalida}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {row.placa}
                </td>
                <td className="px-6 py-4 text-slate-600">{row.unidad}</td>
                <td className="px-6 py-4">
                  <Badge type={row.tipoOcupante} />
                </td>
                <td className="px-6 py-4 text-right text-slate-700">
                  {row.duracion}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                No se encontraron registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Badge = ({ type }) => {
  let styles = "";

  switch (type) {
    case "Residente":
      styles = "bg-green-100 text-green-700"; 
      break;
    case "Invitado":
      styles = "bg-slate-100 text-slate-600";
      break;
    default:
      styles = "bg-slate-100 text-slate-600";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${styles}`}>
      {type}
    </span>
  );
};

export default AccessTable;
