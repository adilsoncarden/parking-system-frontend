import React from "react";

const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rol, setRol] = React.useState('');
    const [error, setError] = React.useState('');
    const usuarios = [
        { email: 'admin@condominio.com', password: 'admin123', rol: 'admin' },
        { email: 'portero@condominio.com', password: 'portero123', rol: 'porteria' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !rol) {
            setError('Por favor complete todos los campos.');
            return;
        }

        const usuario = usuarios.find(
            (u) => u.email === email && u.password === password && u.rol === rol
        );

        if (!usuario) {
            setError('Credenciales incorrectas. Verifique sus datos.');
            return;
        }

        onLogin(usuario.rol);
    };
    const [showPassword, setShowPassword] = React.useState(false);
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
                    />
                </div>
            </div>

            {/* Input de Contraseña */}
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
                />
                <button
                    type="button"
                    className="input-group-text bg-white"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
            </div>

            {/* Selector de Rol */}
            <div className="mb-3">
                <label className="form-label">Rol de Usuario</label>
                <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                >
                    <option value="">Seleccione un rol</option>
                    <option value="admin">Administrador</option>
                    <option value="porteria">Portería</option>
                </select>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="alert alert-danger py-2 small mb-3">
                    {error}
                </div>
            )}

            {/* Botón de Ingreso */}
            <div className="d-grid gap-2 mb-3">
                <button type="submit" className="btn btn-primary">
                    Ingresar al Sistema
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
