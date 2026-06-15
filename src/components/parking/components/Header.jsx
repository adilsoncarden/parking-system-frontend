import { FileText, Sheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Header = ({ dataToExport }) => {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Historial de Accesos", 14, 15);

    const tableColumn = [
      "FECHA",
      "ENTRADA",
      "SALIDA",
      "PLACA",
      "UNIDAD",
      "TIPO",
      "DURACION",
    ];
    const tableRows = [];

    dataToExport.forEach((item) => {
      const rowData = [
        item.fecha,
        item.horaEntrada,
        item.horaSalida,
        item.placa,
        item.unidad,
        item.tipo,
        item.duracion,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("historial_accesos.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, "historial_accesos.xlsx");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Historial de Accesos
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Registro detallado de todos los movimientos vehiculares históricos.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
        >
          <FileText size={16} className="text-slate-500" />
          Exportar PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
        >
          <Sheet size={16} className="text-slate-500" />
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

export default Header;
