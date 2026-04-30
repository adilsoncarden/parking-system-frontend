import React, { useState } from "react";
import { authService } from "../../services/authService";

const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor complete todos los campos.');
            return;
        }

        setLoading(true);
        const result = await authService.login({ email, password });
        setLoading(false);

        if (!result.ok) {
            setError(result.error || 'Credenciales incorrectas. Verifique sus datos.');
            return;
        }

        // Avisa al App.jsx que el login fue exitoso
        onLogin(result.user);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Input de Correo */}
            <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                    </span>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Input de Contraseña */}
            <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="input-group-text bg-white"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="alert alert-danger py-2 small mb-3">
                    {error}
                </div>
            )}

            {/* Botón de Ingreso */}
            <div className="d-grid gap-2 mb-3">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Ingresando...
                        </>
                    ) : (
                        'Ingresar al Sistema'
                    )}
                </button>
            </div>

            {/* Links de ayuda */}
            <div className="text-center">
                <a href="#" className="d-block mb-1 small">
                    ¿Olvidaste tu contraseña?
                </a>
                <a href="#" className="small text-muted">
                    Solicitar acceso al administrador
                </a>
            </div>
        </form>
    );
};

export default LoginForm;