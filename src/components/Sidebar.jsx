import React from "react";

const Sidebar = ({ setPagina }) => {
        return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
            style={{ width: "280px", minHeight: "100vh" }}
        >
            <a
                href="/"
                className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            >
                <i className="bi bi-buildings-fill me-2 fs-4"></i>
                <span className="fs-4 fw-bold">CondoSaaS</span>
            </a>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
            <li>
                <a href="#" className="nav-link text-white" onClick={() => setPagina("condominios")}>
                    <i className="bi bi-house me-2"></i> Condominios
                </a>
            </li>
            <li>
                <a href="#" className="nav-link text-white" onClick={() => setPagina("carritos")}>
                    <i className="bi bi-cart me-2"></i> Carritos
                </a>
            </li>
        </ul>
            <hr />
            <div className="px-2">
                <span className="badge bg-primary w-100 py-2">
                    Modo Administrador
                </span>
            </div>
        </div>
    );
};

export default Sidebar;
