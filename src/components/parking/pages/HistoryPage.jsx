import { useState, useMemo } from "react";
import ParkingLayout from "../ParkingLayout";
import Header from "../components/Header";
import AccessTable from "../components/AccessTable";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { useParking } from "../context/ParkingContext";
import { X } from "lucide-react";

export default function HistoryPage() {
  const { accessLog } = useParking();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState("Todas las Unidades");
  const [typeFilter, setTypeFilter] = useState("Todos");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // 🧹 Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchTerm("");
    setUnitFilter("Todas las Unidades");
    setTypeFilter("Todos");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const data = accessLog.map((log) => ({
    id: log.id,
    fecha: log.fecha,
    horaEntrada: log.horaEntrada,
    horaSalida: log.horaSalida || "Aún dentro",
    placa: log.placa,
    unidad: log.unidad || "--",
    tipoOcupante:
      log.tipoOcupante === "residente"
        ? "Residente"
        : log.tipoOcupante === "visitante"
        ? "Invitado"
        : "Desconocido",
    duracion: log.duracion || "--",
  }));

  const filteredData = useMemo(() => {
    const q = (searchQuery || searchTerm).toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        item.placa.toLowerCase().includes(q) ||
        item.unidad.toLowerCase().includes(q);

      const matchUnit =
        unitFilter === "Todas las Unidades" ||
        item.unidad === unitFilter;

      let matchType = true;
      if (typeFilter === "Entradas") {
        matchType = item.horaSalida === "Aún dentro";
      } else if (typeFilter === "Salidas") {
        matchType = item.horaSalida !== "Aún dentro";
      }

      let matchDate = true;

      if (startDate || endDate) {
        const itemDate = new Date(item.fecha);

        if (!isNaN(itemDate)) {
          if (startDate) {
            const sDate = new Date(startDate + "T00:00:00");
            if (itemDate < sDate) matchDate = false;
          }

          if (endDate) {
            const eDate = new Date(endDate + "T23:59:59");
            if (itemDate > eDate) matchDate = false;
          }
        }
      }

      return matchSearch && matchUnit && matchType && matchDate;
    });
  }, [data, searchQuery, searchTerm, unitFilter, typeFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ParkingLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="space-y-6">
        <Header dataToExport={filteredData} />

        <Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          unitFilter={unitFilter}
          setUnitFilter={setUnitFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onClearFilters={handleClearFilters}
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <AccessTable data={currentData} />

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Mostrando {currentData.length} de {filteredData.length} registros
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </ParkingLayout>
  );
}