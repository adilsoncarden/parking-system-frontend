import { useState, useMemo } from "react";
import ParkingLayout from "../ParkingLayout";
import StatsCards from "../components/StatsCards";
import VehicleTable from "../components/VehicleTable";
import VehicleModal from "../components/VehicleModal";
import { useParking } from "../context/ParkingContext";

export default function Residents() {
  const { vehicles, addVehicle } = useParking();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos los Estados");
  const [typeFilter, setTypeFilter] = useState("Todos los Tipos");
  const [condoFilter, setCondoFilter] = useState("Todos los Condominios");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const adaptedVehicles = vehicles.map((v) => ({
    id: v.id,
    plate: v.placa,
    unit: v.unidad,
    owner: v.propietario,
    condominio: v.condominioNombre || "—",
    type: v.tipoOcupante === "residente" ? "Residente" : "Temporal",
    status: v.estado === "activo" ? "Activo" : "Expirado",
    expiration: v.fechaExpiracion,
  }));

  const condominios = useMemo(
    () => [...new Set(vehicles.map((v) => v.condominioNombre).filter(Boolean))].sort(),
    [vehicles],
  );

  const handleAddVehicle = (nv) => {
    addVehicle({
      placa: nv.placa,
      usuarioId: nv.usuarioId,
      marca: nv.marca,
      modelo: nv.modelo,
      color: nv.color,
      estado: "activo",
    });
  };

  const filteredVehicles = useMemo(() => {
    let filtered = adaptedVehicles;

    if (statusFilter !== "Todos los Estados") {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    if (typeFilter !== "Todos los Tipos") {
      filtered = filtered.filter((v) => v.type === typeFilter);
    }

    if (condoFilter !== "Todos los Condominios") {
      filtered = filtered.filter((v) => v.condominio === condoFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.plate.toLowerCase().includes(q) ||
          v.owner.toLowerCase().includes(q) ||
          v.unit.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [adaptedVehicles, searchQuery, statusFilter, typeFilter, condoFilter]);

  const stats = useMemo(
    () => ({
      total: adaptedVehicles.length,
      activeResidents: adaptedVehicles.filter(
        (v) => v.type === "Residente" && v.status === "Activo"
      ).length,
      temporalPasses: adaptedVehicles.filter(
        (v) => v.type === "Temporal"
      ).length,
      alerts: adaptedVehicles.filter(
        (v) => v.status === "Expirado"
      ).length,
    }),
    [adaptedVehicles]
  );

  return (
    <ParkingLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="max-w-7xl mx-auto space-y-6 p-8">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Directorio de Vehículos y Residentes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestión centralizada de residentes, unidades y vehículos autorizados
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 md:gap-4 w-full xl:w-auto">

            {/* CONDOMINIO */}
            <select
              value={condoFilter}
              onChange={(e) => setCondoFilter(e.target.value)}
              className="w-full lg:w-auto bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="Todos los Condominios">Todos los Condominios</option>
              {condominios.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-auto bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="Todos los Estados">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Expirado">Expirado</option>
            </select>

            {/* TYPE */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full lg:w-auto bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="Todos los Tipos">Todos los Tipos</option>
              <option value="Residente">Residente</option>
              <option value="Temporal">Temporal</option>
            </select>

            {/* BUSCADOR */}
            <input
              type="text"
              placeholder="Buscar placa, propietario o unidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-auto bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
            />

            {/* BOTÓN */}
            <button
  onClick={() => setIsModalOpen(true)}
  className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 text-sm rounded-md hover:bg-gray-800 whitespace-nowrap"
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4v16m8-8H4"
    />
  </svg>
  Añadir Vehículo
</button>

          </div>
        </div>

        <StatsCards stats={stats} />

        <VehicleTable
          vehicles={filteredVehicles}
          totalCount={adaptedVehicles.length}
        />
      </div>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddVehicle}
      />
    </ParkingLayout>
  );
}