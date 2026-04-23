import React from "react";

const LoginForm = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rol, setRol] = React.useState('');
    const [error, setError] = React.useState('');
    return (
        <form>
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
            <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                    </span>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
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
