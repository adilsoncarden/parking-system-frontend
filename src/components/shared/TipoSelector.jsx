const TIPOS = [
    { value: "residencial", label: "Residencial", color: "primary",   icon: "bi-house-door" },
    { value: "premium",     label: "Premium",     color: "success",   icon: "bi-star" },
    { value: "platinium",   label: "Platinium",   color: "warning",   icon: "bi-gem" },
];

const TipoSelector = ({ tipoSeleccionado, onChange }) => {
    return (
        <div className="d-flex gap-2 flex-wrap">
            {TIPOS.map((tipo) => {
                const activo = tipoSeleccionado === tipo.value;
                return (
                    <button
                        key={tipo.value}
                        type="button"
                        className={`btn ${activo ? `btn-${tipo.color}` : `btn-outline-${tipo.color}`}`}
                        onClick={() => onChange(tipo.value)}
                        style={{ flex: "1 1 auto" }}
                    >
                        <i className={`bi ${tipo.icon} me-2`}></i>
                        {tipo.label}
                    </button>
                );
            })}
        </div>
    );
};

export default TipoSelector;