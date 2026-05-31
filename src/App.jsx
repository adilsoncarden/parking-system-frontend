import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ── services ─────────────────────────────────────────
import { authService } from "./services/authService";
import { AUTH_SESSION_EXPIRED_EVENT, resetSessionExpiredFlag } from "./services/api";
import { debugAuthToken, isLoggedIn } from "./utils/authGuard";

// ── shared ──────────────────────────────────────────
import LoginForm from "./components/shared/LoginForm";
import Sidebar   from "./components/shared/Sidebar";
import Dashboard from "./components/shared/Dashboard";

// ── infraestructura ───────────────────────────────────
import CondominiosPage  from "./components/infraestructura/CondominiosPage";
import TorresPage       from "./components/infraestructura/TorresPage";
import PisosPage        from "./components/infraestructura/PisosPage";
import ApartamentosPage from "./components/infraestructura/ApartamentosPage";

// ── carritos ──────────────────────────────────────────
import CarritosPage from "./components/carritos/CarritosPage";

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
// Ruta protegida — solo valida token en localStorage
// ═══════════════════════════════════════════════════════
function ProtectedRoute({ children }) {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

// ═══════════════════════════════════════════════════════
// Página de Login
// ═══════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
    return (
        <div className="login-page">
            <div className="card login-card p-4">
                <div className="card-body px-2 px-sm-3">
                    <div className="text-center mb-4">
                        <i className="bi bi-buildings-fill login-brand-icon" />
                        <h3 className="login-brand fw-bold mb-1">CondoSaaS</h3>
                        <p className="login-subtitle mb-0">Gestión de condominios</p>
                    </div>
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
    const [authVersion, setAuthVersion] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const syncAuth = () => setAuthVersion((v) => v + 1);
    const authenticated = useMemo(() => isLoggedIn(), [authVersion]);

    useEffect(() => {
        syncAuth();
    }, [location.pathname]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "token" || e.key === null) syncAuth();
        };
        const onSessionExpired = () => {
            authService.logout();
            syncAuth();
            navigate("/login", { replace: true });
        };
        window.addEventListener("storage", onStorage);
        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
        };
    }, [navigate]);

    const handleLogin = () => {
        debugAuthToken();
        if (!isLoggedIn()) {
            return;
        }
        resetSessionExpiredFlag();
        syncAuth();
        navigate("/dashboard", { replace: true });
    };

    const handleLogout = () => {
        authService.logout();
        syncAuth();
        navigate("/login", { replace: true });
    };

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    authenticated
                        ? <Navigate to="/dashboard" replace />
                        : <LoginPage onLogin={handleLogin} />
                }
            />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><Dashboard /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/condominios" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><CondominiosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/torres" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><TorresPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/pisos" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><PisosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/apartamentos" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><ApartamentosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/carritos" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><CarritosPage /></PrivateLayout>
                </ProtectedRoute>
            }/>
            <Route path="/config" element={
                <ProtectedRoute>
                    <PrivateLayout onLogout={handleLogout}><ConfiguracionPage /></PrivateLayout>
                </ProtectedRoute>
            }/>

            <Route path="/" element={<Navigate to={authenticated ? "/dashboard" : "/login"} replace />}/>
            <Route path="*" element={<Navigate to={authenticated ? "/dashboard" : "/login"} replace />}/>
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
