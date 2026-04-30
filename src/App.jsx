import { useState, useEffect } from "react";

// ── shared ──────────────────────────────────────────
import LoginForm from "./components/shared/LoginForm";
import Sidebar   from "./components/shared/Sidebar";
import Dashboard from "./components/shared/Dashboard";

// ── condominios ──────────────────────────────────────
import CondominiosPage from "./components/condominios/CondominiosPage";

// ── torres ───────────────────────────────────────────
import ModalTorres from "./components/torres/ModalTorres";

// ── infraestructura ───────────────────────────────────
import PisosPage        from "./components/infraestructura/PisosPage";
import ApartamentosPage from "./components/infraestructura/ApartamentosPage";

// ── carritos ──────────────────────────────────────────
import CarritosPageWrapper from "./components/carritos/CarritosPageWrapper";

// ── config ────────────────────────────────────────────
import ConfiguracionPage from "./components/config/ConfiguracionPage";

function App() {
    const [paginaActual, setPaginaActual] = useState(() => {
        return localStorage.getItem("paginaActual") ?? "login";
    });

    // Estado del sidebar móvil (abierto/cerrado)
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("paginaActual", paginaActual);
    }, [paginaActual]);

    // Cambiar de página cierra el sidebar en móvil
    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("paginaActual");
        setPaginaActual("login");
        setSidebarOpen(false);
    };

    const toggleSidebar = (e) => {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
    };

    if (paginaActual !== "login") {
        return (
            <div id="app">
                <Sidebar
                    onLogout={handleLogout}
                    setPagina={cambiarPagina}
                    paginaActual={paginaActual}
                    sidebarOpen={sidebarOpen}
                />

                {/* Overlay oscuro en móvil cuando el sidebar está abierto */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            zIndex: 900,
                        }}
                        className="d-xl-none"
                    />
                )}

                <div id="main">
                    <header className="mb-3">
                        <a
                            href="#"
                            className="burger-btn d-block d-xl-none"
                            onClick={toggleSidebar}
                        >
                            <i className="bi bi-justify fs-3"></i>
                        </a>
                    </header>
                    <div className="page-content">
                        {paginaActual === "dashboard"    && <Dashboard />}
                        {paginaActual === "condominios"  && <CondominiosPage />}
                        {paginaActual === "torres"       && <ModalTorres />}
                        {paginaActual === "pisos"        && <PisosPage />}
                        {paginaActual === "apartamentos" && <ApartamentosPage />}
                        {paginaActual === "carritos"     && <CarritosPageWrapper />}
                        {paginaActual === "config"       && <ConfiguracionPage />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div
                className="card shadow-lg p-4 mx-auto"
                style={{ borderRadius: "15px", maxWidth: "400px", marginTop: "100px" }}
            >
                <div className="card-body">
                    <h3 className="text-center mb-4 fw-bold">CondoSaaS</h3>
                    <LoginForm onLogin={() => setPaginaActual("dashboard")} />
                </div>
            </div>
        </div>
    );
}

export default App;