import React from "react";

const LoginForm = () => {
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
                    />
                </div>
            </div>
        </form>
    );
};

export default LoginForm;
