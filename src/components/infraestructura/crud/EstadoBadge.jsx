const STYLES = {
    ACTIVO: "bg-success",
    INACTIVO: "bg-secondary",
    DISPONIBLE: "bg-success",
    OCUPADO: "bg-primary",
    MANTENIMIENTO: "bg-warning text-dark",
};

const EstadoBadge = ({ estado }) => (
    <span className={`badge ${STYLES[estado] || "bg-secondary"}`}>{estado || "—"}</span>
);

export default EstadoBadge;
