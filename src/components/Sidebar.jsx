import React, {  useEffect } from "react";

const Sidebar = ({ onLogout, setPagina, paginaActual, sidebarOpen, onClose }) => {

    useEffect(() => {
        const theme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-bs-theme", theme);
        const checkbox = document.getElementById("toggle-dark");
        if (checkbox) checkbox.checked = theme === "dark";
    }, []);

    const handleThemeChange = (e) => {
        const newTheme = e.target.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-bs-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <div
            id="sidebar"
            className={sidebarOpen ? "active" : ""}
        >
            <div
                className="sidebar-wrapper"
                style={{
                    left: sidebarOpen ? "0" : undefined,
                }}
            >
                <div className="sidebar-header position-relative">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="logo">
                           <a 
                                href="#"
                                onClick={() => setPagina("dashboard")}
                                className="fs-4 fw-bold"
                            >
                                <i className="bi bi-buildings-fill me-2"></i>
                                CondoSaaS
                            </a>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="theme-toggle d-flex gap-2 align-items-center mt-2">
                                <i className="bi bi-sun-fill fs-6"></i>
                                <div className="form-check form-switch fs-6 mb-0">
                                    <input
                                        className="form-check-input me-0"
                                        type="checkbox"
                                        id="toggle-dark"
                                        onChange={handleThemeChange}
                                        style={{ cursor: "pointer" }}
                                    />
                                </div>
                                <i className="bi bi-moon-fill fs-6"></i>
                            </div>
                            {/* Botón cerrar en móvil */}
                            <button
                                className="btn btn-sm btn-light d-xl-none ms-2"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <ul className="menu">
                        <li className="sidebar-title">Principal</li>

                        <li className={`sidebar-item ${paginaActual === "dashboard" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("dashboard")}>
                                <i className="bi bi-grid-fill"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>

                        <li className={`sidebar-item ${paginaActual === "condominios" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("condominios")}>
                                <i className="bi bi-building"></i>
                                <span>Condominios</span>
                            </a>
                        </li>

                        <li className={`sidebar-item ${paginaActual === "torres" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("torres")}>
                                <i className="bi bi-building-fill"></i>
                                <span>Torres</span>
                            </a>
                        </li>

                        <li className={`sidebar-item ${paginaActual === "pisos" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("pisos")}>
                                <i className="bi bi-layout-text-window-reverse"></i>
                                <span>Pisos</span>
                            </a>
                        </li>

                        <li className={`sidebar-item ${paginaActual === "apartamentos" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("apartamentos")}>
                                <i className="bi bi-house-fill"></i>
                                <span>Apartamentos</span>
                            </a>
                        </li>

                        <li className={`sidebar-item ${paginaActual === "carritos" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("carritos")}>
                                <i className="bi bi-cart-fill"></i>
                                <span>Carritos</span>
                            </a>
                        </li>

                        <li className={`sidebar-item ${paginaActual === "config" ? "active" : ""}`}>
                            <a href="#" className="sidebar-link" onClick={() => setPagina("config")}>
                                <i className="bi bi-gear-fill"></i>
                                <span>Configuración</span>
                            </a>
                        </li>

                        <li className="sidebar-item">
                            <a href="#" onClick={onLogout} className="sidebar-link text-danger">
                                <i className="bi bi-box-arrow-right text-danger"></i>
                                <span>Cerrar Sesión</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;