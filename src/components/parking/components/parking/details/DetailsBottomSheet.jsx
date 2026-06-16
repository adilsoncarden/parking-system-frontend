import ParkingDetails from "./ParkingDetails";

export default function DetailsBottomSheet({
  spot,
  onClose,
  onReassign,
  onToggleMaintenance,
}) {
  if (!spot) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl p-5 pb-10 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-5" />
        <ParkingDetails
          spot={spot}
          onClose={onClose}
          onReassign={onReassign}
          onToggleMaintenance={onToggleMaintenance}
        />
      </div>
    </div>
  );
}
