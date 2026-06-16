import ParkingLayout from "../ParkingLayout";
import VehicleEntry from "../components/VehicleEntry";
import ActiveStays from "../components/ActiveStays";

export default function EntryExitPage() {
  return (
    <ParkingLayout>
      <div className="flex gap-6">
        <VehicleEntry />
        <ActiveStays />
      </div>
    </ParkingLayout>
  );
}
