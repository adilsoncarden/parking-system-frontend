import CarritosPage from './components/CarritosPage';
import CarritosPageWrapper from './components/CarritosPageWrapper';
import PisosPage from './components/PisosPage';
import ApartamentosPage from './components/ApartamentosPage';
import CondominiosPage from './components/condominios/CondominiosPage';
import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import Sidebar from "./components/Sidebar";
import ModalTorres from "./components/ModalTorres";

function App() {
    const [paginaActual, setPaginaActual] = useState(() => {
        return localStorage.getItem("paginaActual") ?? "login";
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("paginaActual", paginaActual);
    }, [paginaActual]);

    const handleLogout = () => {
        localStorage.removeItem("paginaActual");
        setPaginaActual("login");
    };

    const handleNavegar = (pagina) => {
        setPaginaActual(pagina);
        setSidebarOpen(false); // cierra en móvil al navegar
    };

    if (paginaActual !== "login") {
        return (
            <div id="app">
                <Sidebar
                    onLogout={handleLogout}
                    setPagina={handleNavegar}
                    paginaActual={paginaActual}
                    sidebarOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Overlay oscuro en móvil cuando sidebar está abierto */}
                {sidebarOpen && (
                    <div
                        className="sidebar-backdrop d-xl-none"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div id="main">
                    <header className="mb-3 d-xl-none px-3 pt-3">
                        <button
                            className="btn btn-light border"
                            onClick={() => setSidebarOpen(prev => !prev)}
                        >
                            <i className="bi bi-justify fs-5"></i>
                        </button>
                    </header>

                    <div className="page-content">
                        {paginaActual === "dashboard" && (
                            <div className="p-3"><h3>Módulo Dashboard (Próximamente)</h3></div>
                        )}
                        {paginaActual === "condominios" && <CondominiosPage />}
                        {paginaActual === "torres" && <ModalTorres />}
                        {paginaActual === "pisos" && <PisosPage />}
                        {paginaActual === "apartamentos" && <ApartamentosPage />}
                        {paginaActual === "carritos" && <CarritosPageWrapper />}
                        {paginaActual === "config" && (
                            <div className="p-3"><h3>Módulo Configuraciones (Próximamente)</h3></div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
            <div
                className="card shadow-lg p-4 w-100"
                style={{ borderRadius: "15px", maxWidth: "400px" }}
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