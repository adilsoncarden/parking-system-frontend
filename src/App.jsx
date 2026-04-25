import { useState, useEffect } from "react";
import LoginForm       from "./components/LoginForm";
import AdminPage       from "./components/AdminPage";
import PorteriaPage    from "./components/PorteriaPage";
import CondominiosPage from "./components/CondominiosPage";
import CarritoPanel    from "./components/CarritoPanel";
import Sidebar         from "./components/Sidebar";
import Navbar          from "./components/Navbar";

function App() {
    const [paginaActual, setPaginaActual] = useState(() => {
        return localStorage.getItem("paginaActual") ?? "login";
    });

    useEffect(() => {
        localStorage.setItem("paginaActual", paginaActual);
    }, [paginaActual]);

    const handleLogout = () => {
        localStorage.removeItem("paginaActual");
        setPaginaActual("login");
    };

    // ── Dashboard ──────────────────────────────────────
    if (paginaActual !== "login") {
        return (
            <div className="d-flex">
                <Sidebar
                    onLogout={handleLogout}
                    setPagina={setPaginaActual}
                    paginaActual={paginaActual}   // ← para marcar activo
                />
                <div className="flex-grow-1 bg-light">
                    <Navbar onLogout={handleLogout} />
                    <main className="p-4">
                        {paginaActual === "admin"       && <AdminPage />}
                        {paginaActual === "porteria"    && <PorteriaPage />}
                        {paginaActual === "condominios" && <CondominiosPage />}
                        {paginaActual === "carritos"    && <CarritoPanel />}
                    </main>
                </div>
            </div>
        );
    }

    // ── Login ──────────────────────────────────────────
    return (
        <div className="login-container">
            <div className="text-center mb-4">
                <div
                    className="bg-white shadow-sm d-inline-block p-3 mb-3"
                    style={{ borderRadius: "15px" }}
                >
                    <i className="bi bi-buildings-fill text-primary fs-1"></i>
                </div>
                <h2 className="fw-bold text-white mb-0">CondoSaaS</h2>
                <p className="text-white-50 small">Sistema de Gestión de Condominios</p>
            </div>

            <div
                className="card shadow-lg p-4 mx-auto"
                style={{ borderRadius: "15px", maxWidth: "400px", border: "none" }}
            >
                <div className="card-body">
                    <h3 className="text-center mb-4 fw-bold">Iniciar Sesión</h3>
                    <LoginForm onLogin={setPaginaActual} />
                </div>
            </div>
        </div>
    );
}

export default App;