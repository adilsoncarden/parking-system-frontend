import { useEffect, Fragment } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MENU_ITEMS, PERM } from "../../constants/permissions";
import { hasPermission, isCondominioAdmin, getScopedCondominioId } from "../../utils/permissions";

const Sidebar = ({ onLogout, sidebarOpen }) => {
    const location = useLocation();

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

    const itemClass = (path) =>
        `sidebar-item ${location.pathname === path ? "active" : ""}`;

    // Menú reducido para quien está ligado a UN condominio (admin/subadmin/portero).
    // Cada ítem se gatea por permiso, así el portero solo ve Parking y el
    // admin/subadmin ven además Mi Condominio + Carritos. Todo queda acotado a
    // su condominio por el scoping del backend (currentUser.condominioId).
    const scopedId = getScopedCondominioId();
    const parkingItems = MENU_ITEMS.filter(
        (item) => item.path.startsWith("/parking/") && hasPermission(item.permission),
    );
    const visibleMenu = isCondominioAdmin()
        ? [
              // "Mi Condominio" se gatea por VER_TORRES (no por VER_CONDOMINIOS): el portero
              // puede tener VER_CONDOMINIOS solo para los datos de carritos, pero NO debe ver
              // ni entrar al detalle del condominio (no tiene VER_TORRES/PISOS).
              ...(hasPermission(PERM.VER_TORRES)
                  ? [{ path: `/condominios/${scopedId}`, label: "Mi Condominio", icon: "bi-building" }]
                  : []),
              ...(hasPermission(PERM.VER_CARRITOS)
                  ? [{ path: "/carritos", label: "Carritos", icon: "bi-cart-fill" }]
                  : []),
              ...parkingItems,
          ]
        : MENU_ITEMS.filter((item) => hasPermission(item.permission));

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
                <div className="sidebar-header position-relative">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="logo">
                            <NavLink to="/dashboard" className="fs-4 fw-bold">
                                <i className="bi bi-buildings-fill me-2" />
                                CondoSaaS
                            </NavLink>
                        </div>
                        <div className="theme-toggle d-flex gap-2 align-items-center mt-2">
                            <i className="bi bi-sun-fill fs-6" />
                            <div className="form-check form-switch fs-6">
                                <input
                                    className="form-check-input me-0"
                                    type="checkbox"
                                    id="toggle-dark"
                                    onChange={handleThemeChange}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                            <i className="bi bi-moon-fill fs-6" />
                        </div>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <ul className="menu">
                        <li className="sidebar-title">Principal</li>

                        {visibleMenu.map((item) => (
                            <Fragment key={item.path}>
                                {item.section && (
                                    <li className="sidebar-title">{item.section}</li>
                                )}
                                <li className={itemClass(item.path)}>
                                    <NavLink to={item.path} className="sidebar-link">
                                        <i className={`bi ${item.icon}`} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            </Fragment>
                        ))}

                        <li className="sidebar-item">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onLogout();
                                }}
                                className="sidebar-link text-danger"
                            >
                                <i className="bi bi-box-arrow-right text-danger" />
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
