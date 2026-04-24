import React from "react";

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3">
            <div className="container-fluid">
                <div className="d-flex align-items-center">
                    <select
                        className="form-select form-select-sm border-0 bg-light fw-bold"
                        style={{ width: "230px" }}
                    >
                        <option>Residencial Las Palmeras</option>
                        <option>Residencial Los Pinos</option>
                        <option>Residencial Las Lomas</option>
                    </select>
                </div>

                <div className="ms-auto d-flex align-items-center">
                    <button className="btn btn-light position-relative me-3">
                        <i className="bi bi-bell"></i>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"></span>
                    </button>
                    <div className="d-flex align-items-center">
                        <div className="text-end me-2 d-none d-sm-block">
                            <p className="mb-0 small fw-bold">
                                Administrador General
                            </p>
                            <p
                                className="mb-0 text-muted"
                                style={{ fontSize: "10px" }}
                            >
                                Admin_Condominio
                            </p>
                        </div>
                        <i className="bi bi-person-circle fs-3 text-secondary"></i>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
