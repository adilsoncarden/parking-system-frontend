import LoginForm from "./components/LoginForm";

function App() {
    return (
        <div className="login-container">
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
        </div>
    );
}

export default App;
