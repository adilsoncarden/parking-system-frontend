import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ onLogout, sidebarOpen }) => {
    const location = useLocation();

    // Control del Modo Oscuro
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

    // Helper que devuelve la clase del item según si la ruta está activa
    const itemClass = (path) =>
        `sidebar-item ${location.pathname === path ? "active" : ""}`;

    const sidebarStyle = {
        transition: "transform 0.3s ease",
        zIndex: 1000,
    };

    return (
        <div
            id="sidebar"
            className={`active ${sidebarOpen ? "sidebar-open-mobile" : ""}`}
            style={sidebarStyle}
        >
            <div className="sidebar-wrapper active">
                {/* CABECERA */}
                <div className="sidebar-header position-relative">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="logo">
                            <NavLink to="/dashboard" className="fs-4 fw-bold">
                                <i className="bi bi-buildings-fill me-2"></i>
                                CondoSaaS
                            </NavLink>
                        </div>
                        <div className="theme-toggle d-flex gap-2 align-items-center mt-2">
                            <i className="bi bi-sun-fill fs-6"></i>
                            <div className="form-check form-switch fs-6">
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
                    </div>
                </div>

                {/* MENÚ */}
                <div className="sidebar-menu">
                    <ul className="menu">
                        <li className="sidebar-title">Principal</li>

                        <li className={itemClass("/dashboard")}>
                            <NavLink to="/dashboard" className="sidebar-link">
                                <i className="bi bi-grid-fill"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        <li className={itemClass("/condominios")}>
                            <NavLink to="/condominios" className="sidebar-link">
                                <i className="bi bi-building"></i>
                                <span>Condominios</span>
                            </NavLink>
                        </li>

                        <li className={itemClass("/torres")}>
                            <NavLink to="/torres" className="sidebar-link">
                                <i className="bi bi-building-fill"></i>
                                <span>Torres</span>
                            </NavLink>
                        </li>

                        <li className={itemClass("/pisos")}>
                            <NavLink to="/pisos" className="sidebar-link">
                                <i className="bi bi-layout-text-window-reverse"></i>
                                <span>Pisos</span>
                            </NavLink>
                        </li>

                        <li className={itemClass("/apartamentos")}>
                            <NavLink to="/apartamentos" className="sidebar-link">
                                <i className="bi bi-house-fill"></i>
                                <span>Apartamentos</span>
                            </NavLink>
                        </li>

                        <li className={itemClass("/carritos")}>
                            <NavLink to="/carritos" className="sidebar-link">
                                <i className="bi bi-cart-fill"></i>
                                <span>Carritos</span>
                            </NavLink>
                        </li>

                        <li className={itemClass("/config")}>
                            <NavLink to="/config" className="sidebar-link">
                                <i className="bi bi-gear-fill"></i>
                                <span>Configuración</span>
                            </NavLink>
                        </li>

                        <li className="sidebar-item">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onLogout(); }}
                                className="sidebar-link text-danger"
                            >
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