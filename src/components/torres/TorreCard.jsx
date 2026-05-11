import React from 'react';

const TorreCard = ({ torre, onManage }) => (
    <div className="card h-100 torre-card border-0 shadow-sm transition-all">
        <div className="card-body p-4 d-flex flex-column">
            <div className="mb-4">
                <h5 className="fw-bold mb-1">{torre.nombre}</h5>
            </div>
            <div className="row g-2 mb-4 mt-auto">
                {[["Pisos", torre.pisos], ["Aptos", torre.apartamentos]].map(([l, v]) => (
                    <div className="col-6" key={l}><div className="info-box py-2"><small className="info-label">{l}</small><div className="info-value fs-5">{v}</div></div></div>
                ))}
            </div>
            <button className="btn btn-brand w-100 fw-bold py-2" onClick={() => onManage(torre)}>Gestionar</button>
        </div>
    </div>
);

export default TorreCard;
