import React from 'react';

const Dashboard = () => {
    // Estadísticas generales superiores
    const estadisticas = [
        { label: 'Total Condominios', valor: 1, icon: 'bi-buildings-fill', color: 'bg-primary' },
        { label: 'Total Torres', valor: 2, icon: 'bi-building', color: 'bg-info' },
        { label: 'Total Pisos', valor: 3, icon: 'bi-layers-fill', color: 'bg-warning' },
        { label: 'Total Apartamentos', valor: 4, icon: 'bi-door-open-fill', color: 'bg-success' },
    ];

    // Datos para el gráfico de estados
    const estadosData = [
        { label: 'Ocupado', cantidad: 2, porcentaje: 50, color: 'bg-success' },
        { label: 'Disponible', cantidad: 1, porcentaje: 25, color: 'bg-primary' },
        { label: 'Mantenimiento', cantidad: 1, porcentaje: 25, color: 'bg-warning' },
    ];

    // Datos para el reporte de apartamentos por piso
    const reportePisos = [
        { piso: 'Piso 1', cantidad: 2, max: 2 },
        { piso: 'Piso 2', cantidad: 1, max: 2 },
        { piso: 'Piso 3', cantidad: 1, max: 2 },
    ];

    // NUEVO: Datos para el Resumen por Torres (image_b5e1db.png)
    const resumenTorres = [
        { id: 1, nombre: 'Torre A', n_pisos: 3, n_apartamentos: 5, condominio: 'Condominio Los Álamos' },
        { id: 2, nombre: 'Torre B', n_pisos: 2, n_apartamentos: 2, condominio: 'Condominio Los Álamos' },
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
                    {/* Reporte de Apartamentos por Piso */}
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
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Estados de Apartamentos */}
                    <div className="col-12 col-xl-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Estados de Apartamentos</h5>
                            </div>
                            <div className="card-body">
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* NUEVO: Apartado de Resumen por Torres */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">
                                    <i className="bi bi-building-fill me-2 text-primary"></i>
                                    Resumen por Torres
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Torre</th>
                                                <th className="text-center">N° Pisos</th>
                                                <th className="text-center">N° Apartamentos</th>
                                                <th>Condominio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resumenTorres.map((torre, index) => (
                                                <tr key={torre.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{torre.nombre}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-warning text-dark">
                                                            {torre.n_pisos} Pisos
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-success">
                                                            {torre.n_apartamentos} Unidades
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <i className="bi bi-buildings me-2"></i>
                                                        {torre.condominio}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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