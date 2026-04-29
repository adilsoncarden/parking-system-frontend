import React from 'react';

const Dashboard = () => {
    // Datos basados en la imagen de detalle (image_b6465d.png)
    const estadisticas = [
        { label: 'Total Condominios', valor: 1, icon: 'bi-buildings-fill', color: 'bg-primary' },
        { label: 'Total Torres', valor: 2, icon: 'bi-building', color: 'bg-info' },
        { label: 'Total Pisos', valor: 3, icon: 'bi-layers-fill', color: 'bg-warning' },
        { label: 'Total Apartamentos', valor: 4, icon: 'bi-door-open-fill', color: 'bg-success' },
    ];

    const estadosData = [
        { label: 'Ocupado', cantidad: 2, porcentaje: 50, color: 'bg-success' },
        { label: 'Disponible', cantidad: 1, porcentaje: 25, color: 'bg-primary' },
        { label: 'Mantenimiento', cantidad: 1, porcentaje: 25, color: 'bg-warning' },
    ];

    const reportePisos = [
        { piso: 'Piso 1', cantidad: 2, max: 2 },
        { piso: 'Piso 2', cantidad: 1, max: 2 },
        { piso: 'Piso 3', cantidad: 1, max: 2 },
    ];

    return (
        <div className="page-heading">
            <div className="page-title mb-4">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Dashboard Informativo</h3>
                        <p className="text-subtitle text-muted">
                            Resumen general del sistema de gestión de condominios.
                        </p>
                    </div>
                </div>
            </div>

            <section className="section">
                {/* Cartas de Estadísticas Superiores */}
                <div className="row">
                    {estadisticas.map((stat, index) => (
                        <div className="col-6 col-lg-3 col-md-6" key={index}>
                            <div className="card shadow-sm">
                                <div className="card-body px-4 py-4-5">
                                    <div className="row">
                                        <div className="col-md-4 col-lg-12 col-xl-12 col-xxl-5 d-flex justify-content-start">
                                            <div className={`stats-icon ${stat.color} mb-2 d-flex align-items-center justify-content-center`} 
                                                 style={{ width: '3rem', height: '3rem', borderRadius: '0.5rem' }}>
                                                <i className={`bi ${stat.icon} text-white fs-4`}></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">{stat.label}</h6>
                                            <h6 className="font-extrabold mb-0 fs-4">{stat.valor}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row mt-2">
                    {/* Gráfico de Barras: Apartamentos por Piso */}
                    <div className="col-12 col-xl-8">
                        <div className="card shadow-sm h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Reporte de Apartamentos por Piso</h5>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-4">Distribución de unidades residenciales en la edificación.</p>
                                {reportePisos.map((item, index) => (
                                    <div className="mb-4" key={index}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="fw-bold">{item.piso}</span>
                                            <span className="text-muted">{item.cantidad} Unidades</span>
                                        </div>
                                        <div className="progress" style={{ height: '20px' }}>
                                            <div 
                                                className="progress-bar bg-primary" 
                                                role="progressbar" 
                                                style={{ width: `${(item.cantidad / item.max) * 100}%` }}
                                                aria-valuenow={item.cantidad} 
                                                aria-valuemin="0" 
                                                aria-valuemax={item.max}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Pastel / Estados: Estados de Apartamentos */}
                    <div className="col-12 col-xl-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Estados de Apartamentos</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex flex-column justify-content-center h-100">
                                    {estadosData.map((estado, index) => (
                                        <div className="mb-4" key={index}>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center">
                                                    <div className={`rounded-circle ${estado.color} me-2`} 
                                                         style={{ width: '12px', height: '12px' }}></div>
                                                    <span>{estado.label}</span>
                                                </div>
                                                <span className="fw-bold">{estado.porcentaje}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div 
                                                    className={`progress-bar ${estado.color}`} 
                                                    role="progressbar" 
                                                    style={{ width: `${estado.porcentaje}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-end mt-1">
                                                <small className="text-muted">{estado.cantidad} de 4 unidades</small>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="alert alert-info py-2 small mt-2">
                                        <i className="bi bi-info-circle me-2"></i>
                                        El 50% de las unidades están actualmente ocupadas.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;