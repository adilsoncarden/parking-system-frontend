import { useState } from "react";
import { authService } from "../../services/authService";

const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email?.trim() || !password) {
            setError("Por favor complete todos los campos.");
            return;
        }

        setLoading(true);
        const result = await authService.login({ email: email.trim(), password });
        setLoading(false);

        if (!result.ok) {
            setError(result.error || "Credenciales incorrectas. Verifique sus datos.");
            return;
        }

        if (!authService.isAuthenticated()) {
            setError("No se pudo guardar la sesión. Intenta de nuevo.");
            return;
        }

        onLogin(result.user);
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-4">
                <label className="form-label fw-semibold" htmlFor="login-email">
                    Email
                </label>
                <div className="input-group input-group-lg login-input-group">
                    <span className="input-group-text">
                        <i className="bi bi-envelope" />
                    </span>
                    <input
                        id="login-email"
                        type="email"
                        className="form-control"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label fw-semibold" htmlFor="login-password">
                    Contraseña
                </label>
                <div className="input-group input-group-lg login-input-group">
                    <span className="input-group-text">
                        <i className="bi bi-lock" />
                    </span>
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="input-group-text login-toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4" role="alert">
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
                    <span className="small mb-0">{error}</span>
                </div>
            )}

            <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary btn-lg login-submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Ingresando...
                        </>
                    ) : (
                        "Ingresar al sistema"
                    )}
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
