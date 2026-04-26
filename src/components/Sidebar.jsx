import React from "react";

const navItems = [
    { key: "condominios", label: "Condominios", icon: "bi-house" },
    { key: "carritos",    label: "Carritos",    icon: "bi-cart"  },
];

const Sidebar = ({ onLogout, setPagina, paginaActual }) => {
    return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white sidebar-custom"
            style={{ width: "280px", minHeight: "100vh" }}
        >
            {/* Logo */}
            <a
                href="/"
                className="d-flex align-items-center mb-3 text-white text-decoration-none"
            >
                <i className="bi bi-buildings-fill me-2 fs-4"></i>
                <span className="fs-4 fw-bold">CondoSaaS</span>
            </a>

            <hr />

            {/* Navegación */}
            <ul className="nav flex-column mb-auto gap-1">
                {navItems.map((item) => (
                    <li key={item.key} className="nav-item">
                        <button
                            className={`shadow__btn ${paginaActual === item.key ? "active" : ""}`}
                            onClick={() => setPagina && setPagina(item.key)}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>

            <hr />

            {/* Footer del sidebar */}
            <div>
                <span className="badge bg-primary w-100 py-2 mb-3 d-block text-center">
                    Modo Administrador
                </span>
                <button
                    onClick={onLogout}
                    className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
