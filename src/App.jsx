import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ── services ─────────────────────────────────────────
import { authService } from "./services/authService";

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

// ═══════════════════════════════════════════════════════
// Layout principal — envuelve todas las páginas privadas
// ═══════════════════════════════════════════════════════
function PrivateLayout({ onLogout, children }) {
    const location = useLocation();
    return (
        <PrivateLayoutInner
            key={location.pathname}
            onLogout={onLogout}
        >
            {children}
        </PrivateLayoutInner>
    );
}

function PrivateLayoutInner({ onLogout, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = (e) => {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
    };

    return (
        <div id="app">
            <Sidebar
                onLogout={onLogout}
                sidebarOpen={sidebarOpen}
            />

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
                    {children}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// Ruta protegida — bloquea acceso si no hay sesión
// ═══════════════════════════════════════════════════════
function ProtectedRoute({ isAuthenticated, children }) {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

// ═══════════════════════════════════════════════════════
// Página de Login
// ═══════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
    return (
        <div className="login-container">
            <div
                className="card shadow-lg p-4 mx-auto"
                style={{ borderRadius: "15px", maxWidth: "400px", marginTop: "100px" }}
            >
                <div className="card-body">
                    <h3 className="text-center mb-4 fw-bold">CondoSaaS</h3>
                    <LoginForm onLogin={onLogin} />
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// Componente raíz que vive dentro del Router
// ═══════════════════════════════════════════════════════
function AppContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

    const navigate = useNavigate();

    // Sincroniza si el localStorage cambia desde otra pestaña
    useEffect(() => {
        const handler = () => setIsAuthenticated(authService.isAuthenticated());
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const handleLogin = () => {
        // El authService ya guardó token y user en localStorage
        setIsAuthenticated(true);
        navigate("/dashboard");
    };

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <Routes>
            {/* Ruta pública */}
            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate to="/dashboard" replace />
                        : <LoginPage onLogin={handleLogin} />
                }
            />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><Dashboard /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/condominios" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><CondominiosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/torres" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><ModalTorres /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/pisos" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><PisosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/apartamentos" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><ApartamentosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/carritos" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><CarritosPageWrapper /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/config" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PrivateLayout onLogout={handleLogout}><ConfiguracionPage /></PrivateLayout>
                </ProtectedRoute>
            }/>

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}/>
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}/>
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;