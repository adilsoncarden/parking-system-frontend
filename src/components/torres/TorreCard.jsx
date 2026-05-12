import React from 'react';

const TorreCard = ({ torre, onManage }) => (
    <div className="card h-100 torre-card border-0 shadow-sm transition-all">
        <div className="card-body p-4 d-flex flex-column">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-brand bg-opacity-10 text-brand rounded-3 p-2 me-3">
                    <i className="bi bi-buildings-fill fs-4"></i>
                </div>
                <div>
                    <h5 className="fw-bold mb-0">{torre.nombre}</h5>
                    <small className="text-muted">Torre Residencial</small>
                </div>
            </div>
            <button className="btn btn-outline-brand w-100 fw-bold py-2 rounded-pill mt-auto shadow-none" onClick={() => onManage(torre)}>
                Gestionar
            </button>
        </div>
    </div>
);

export default TorreCard;
