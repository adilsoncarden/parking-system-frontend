import { useState, useMemo } from "react";
import { useParking } from "../context/ParkingContext";

export function useParkingSelection() {
  const {
    parkingSpaces,
    vehicles,
    accessLog,
    reassignSpace,
    toggleSpaceMaintenance,
  } = useParking();
  const [selectedId, setSelectedId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const spots = useMemo(() => {
    return parkingSpaces.map((space) => {
      const vehicle = space.vehiculoId
        ? vehicles.find((v) => v.id === space.vehiculoId)
        : null;

      // Si no hay vehículo registrado pero el espacio está ocupado,
      // buscar la placa en el accessLog
      const logEntry =
        !vehicle && space.ocupado
          ? accessLog.find((l) => l.espacioId === space.id && !l.horaSalida)
          : null;

      return {
        id: space.id,
        code: space.code || String(space.id),
        nivel: space.nivel,
        zona: space.zona,
        condominio: space.condominio,
        condominioId: space.condominioId,
        status: space.enMantenimiento
          ? "maintenance"
          : space.ocupado
            ? "occupied"
            : "available",
        plate: vehicle?.placa || logEntry?.placa || null,
        owner: vehicle?.propietario || logEntry?.propietario || null,
        desc: vehicle?.vehiculoDesc || logEntry?.vehiculoDesc || null,
        unit: vehicle?.unidad || logEntry?.unidad || null,
        initials: vehicle?.propietario
          ? vehicle.propietario
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : logEntry?.propietario
            ? logEntry.propietario
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "??",
        icon: space.ocupado
          ? "directions_car"
          : space.enMantenimiento
            ? "build"
            : null,
        tipo: space.tipo,
      };
    });
  }, [parkingSpaces, vehicles, accessLog]);

  const occupancy = useMemo(() => {
    const occupied = spots.filter((s) => s.status === "occupied").length;
    const available = spots.filter((s) => s.status === "available").length;
    return { occupied, available, total: spots.length };
  }, [spots]);

  const selectedSpot = spots.find((s) => s.id === selectedId) || null;

  const handleSelect = (id) => {
    setSelectedId(id);
    setShowDetailsModal(true);
  };

  const closeModal = () => setShowDetailsModal(false);

  const reassignSpot = (spaceId, unit, plate) => {
    reassignSpace(spaceId, plate, unit.resident, unit.code);
  };

  const toggleMaintenance = (spaceId, newStatus) => {
    toggleSpaceMaintenance(spaceId, newStatus);
  };

  return {
    spots,
    occupancy,
    selectedId,
    selectedSpot,
    showDetailsModal,
    handleSelect,
    closeModal,
    reassignSpot,
    toggleMaintenance,
  };
}
