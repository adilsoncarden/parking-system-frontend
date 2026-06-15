/*
 * Layout ligero del módulo Parking (ParkControl).
 * Reemplaza al MainLayout original de ParkControl: NO trae su sidebar/topbar
 * porque el módulo vive dentro del PrivateLayout de CondoSaaS (sidebar único).
 * Solo aplica el scope `.parking-module` (fuente DM Sans + utilidades Tailwind).
 * Acepta y descarta props sueltas (searchQuery, setSearchQuery) de las páginas.
 */
export default function ParkingLayout({ children }) {
    return <div className="parking-module">{children}</div>;
}
