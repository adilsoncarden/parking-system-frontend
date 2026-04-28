import PisosPage from './components/PisosPage';
import ApartamentosPage from './components/ApartamentosPage';
import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import Sidebar from "./components/Sidebar";

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
                        {/* Solo mostramos texto por ahora para que no falle */}
                        {paginaActual === "dashboard" && (
                            <div>
                                <h3>Módulo Dashboard (Próximamente)</h3>
                            </div>
                        )}
                        {paginaActual === "condominios" && (
                            <div>
                                <h3>Módulo Condominios (Próximamente)</h3>
                            </div>
                        )}
                        {paginaActual === "torres" && (
                            <div>
                                <h3>Módulo Torres (Próximamente)</h3>
                            </div>
                        )}
                        
                        {paginaActual === "pisos" && <PisosPage />}

                        {paginaActual === "apartamentos" && <ApartamentosPage/>}
                        
                        {paginaActual === "carritos" && (
                            <div>
                                <h3>Módulo Carritos (Próximamente)</h3>
                            </div>
                        )}
                        {paginaActual === "config" && (
                            <div>
                                <h3>Módulo Configuraciones (Próximamente)</h3>
                            </div>
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
                style={{
                    borderRadius: "15px",
                    maxWidth: "400px",
                    marginTop: "100px",
                }}
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
