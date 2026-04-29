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

    useEffect(() => {
        localStorage.setItem("paginaActual", paginaActual);
    }, [paginaActual]);

    const handleLogout = () => {
        localStorage.removeItem("paginaActual");
        setPaginaActual("login");
    };

    if (paginaActual !== "login") {
        return (
            <div id="app">
                <Sidebar
                    onLogout={handleLogout}
                    setPagina={setPaginaActual}
                    paginaActual={paginaActual}
                />
                <div id="main">
                    <header className="mb-3">
                        <a href="#" className="burger-btn d-block d-xl-none">
                            <i className="bi bi-justify fs-3"></i>
                        </a>
                    </header>
                    <div className="page-content">
                        {paginaActual === "dashboard" && (
                            <div><h3>Módulo Dashboard (Próximamente)</h3></div>
                        )}
                        {paginaActual === "condominios" && (
                            <CondominiosPage />
                        )}
                        {paginaActual === "torres" && <ModalTorres />}
                        {paginaActual === "pisos" && <PisosPage />}
                        {paginaActual === "apartamentos" && <ApartamentosPage />}
                        {paginaActual === "carritos" && <CarritosPageWrapper />}
                        {paginaActual === "config" && (
                            <div><h3>Módulo Configuraciones (Próximamente)</h3></div>
                        )}
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