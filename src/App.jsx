import LoginForm from "./components/LoginForm";

function App() {
    return (
        <div className="login-container">
            {/* Header */}
            <div className="text-center mb-4">
                <div
                    className="bg-white shadow-sm d-inline-block p-3 mb-3"
                    style={{ borderRadius: "15px" }}
                >
                    <i className="bi bi-buildings-fill text-primary fs-1"></i>
                </div>
                <h2 className="fw-bold text-white mb-0">CondoSaaS</h2>
                <p className="text-white-50 small">
                    Sistema de Gestión de Condominios
                </p>
            </div>

            {/* Card de Inicio de Sesión */}
            <div
                className="card shadow-lg p-4"
                style={{
                    borderRadius: "15px",
                    maxWidth: "400px",
                    width: "100%",
                    border: "none",
                }}
            >
                <div className="card-body">
                    <h3 className="text-center mb-4 fw-bold">Iniciar Sesión</h3>
                    <LoginForm />
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center mt-4 text-white-50 small">
                <p>© 2024 CondoSaaS - Multi-Tenant · v1.0</p>
            </footer>
        </div>
    );
}

export default App;
