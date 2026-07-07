import { useState, useEffect, useRef } from "react";

const SearchableSelect = ({
    options,
    value,
    onChange,
    disabled,
    placeholder = "Buscar...",
    allowEmpty = false,
    emptyLabel = "—",
    inputClassName = "form-control",
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);

    const selected = options.find((o) => String(o.id) === String(value));

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = options.filter((o) => {
        const q = query.toLowerCase();
        const lbl = o.label || o.nombre || o.codigo || "";
        return lbl.toLowerCase().includes(q);
    });

    const getLabel = (o) => {
        if (!o) return placeholder;
        if (o.label) return o.label;
        if (o.codigo && o.descripcion)
            return `${o.codigo} — ${o.descripcion}`;
        return o.nombre || o.codigo || o.id;
    };

    return (
        <div className="position-relative" ref={containerRef}>
            <div
                className={`${inputClassName} d-flex align-items-center justify-content-between`}
                style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
                onClick={() => !disabled && setOpen(!open)}
            >
                <span
                    className={
                        !selected && !value ? "text-muted text-truncate" : "text-truncate"
                    }
                >
                    {selected ? getLabel(selected) : placeholder}
                </span>
                <i className="bi bi-chevron-down text-muted ms-2" />
            </div>
            {open && !disabled && (
                <div
                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 z-3"
                    style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                    <div className="p-2 sticky-top bg-white border-bottom">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Buscar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <ul className="list-group list-group-flush mb-0">
                        {allowEmpty && (
                            <li
                                className="list-group-item list-group-item-action px-3 py-2 text-muted"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    onChange("");
                                    setOpen(false);
                                    setQuery("");
                                }}
                            >
                                {emptyLabel}
                            </li>
                        )}
                        {filtered.length === 0 ? (
                            <li className="list-group-item px-3 py-2 text-muted small text-center">
                                Sin resultados
                            </li>
                        ) : (
                            filtered.map((o) => (
                                <li
                                    key={o.id}
                                    className={`list-group-item list-group-item-action px-3 py-2 text-truncate ${String(o.id) === String(value) ? "active" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        onChange(o.id);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                >
                                    {getLabel(o)}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
