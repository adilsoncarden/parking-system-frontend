import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import { getApiErrorMessage } from "../../services/api";
import { authService } from "../../services/authService";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setError("");
                const stats = await dashboardService.getStats();
                if (!cancelled) setData(stats);
            } catch (err) {
                if (!cancelled && err?.code !== "NO_TOKEN") {
                    setError(getApiErrorMessage(err, "Error al cargar el dashboard"));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="page-heading">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-heading">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    const { estadisticas, tasaOcupacion, estadosData, reportePisos, resumenTorres } = data;

    return (
        <div className="page-heading">
            <div className="page-title mb-4">
                <h3 className="mb-1">Dashboard Informativo</h3>
                <p className="text-subtitle text-muted mb-0">
                    Resumen en tiempo real del sistema de gestión de condominios
                </p>
            </div>

            <section className="section">
                <div className="row g-3 mb-4">
                    {estadisticas.map((stat) => (
                        <div className="col-6 col-lg-3" key={stat.label}>
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body d-flex align-items-center gap-3 py-4 px-4">
                                    <div
                                        className={`${stat.color} text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`}
                                        style={{ width: "3.25rem", height: "3.25rem" }}
                                    >
                                        <i className={`bi ${stat.icon} fs-4`} />
                                    </div>
                                    <div>
                                        <p className="text-muted small mb-1 fw-medium">{stat.label}</p>
                                        <h4 className="mb-0 fw-bold">{stat.valor}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body py-4 px-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-semibold">Tasa de ocupación</span>
                            <span className="badge bg-success fs-6">{tasaOcupacion}%</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: "12px" }}>
                            <div
                                className="progress-bar bg-success rounded-pill"
                                style={{ width: `${tasaOcupacion}%` }}
                                role="progressbar"
                                aria-valuenow={tasaOcupacion}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            />
                        </div>
                        <small className="text-muted">Apartamentos en estado OCUPADO</small>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-12 col-xl-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-bottom py-3 px-4">
                                <h5 className="mb-0 fw-semibold">Apartamentos por piso</h5>
                            </div>
                            <div className="card-body px-4 py-4">
                                {reportePisos.length === 0 ? (
                                    <p className="text-muted mb-0">Sin datos de pisos registrados.</p>
                                ) : (
                                    reportePisos.map((item, index) => (
                                        <div className="mb-4" key={index}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-medium">{item.piso}</span>
                                                <span className="text-muted small">{item.cantidad} unidades</span>
                                            </div>
                                            <div className="progress rounded-pill" style={{ height: "10px" }}>
                                                <div
                                                    className="progress-bar bg-primary rounded-pill"
                                                    style={{ width: `${(item.cantidad / item.max) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-bottom py-3 px-4">
                                <h5 className="mb-0 fw-semibold">Estados de apartamentos</h5>
                            </div>
                            <div className="card-body px-4 py-4">
                                {estadosData.length === 0 ? (
                                    <p className="text-muted mb-0">Sin apartamentos registrados.</p>
                                ) : (
                                    estadosData.map((estado, index) => (
                                        <div className="mb-4" key={index}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span
                                                        className={`rounded-circle ${estado.color}`}
                                                        style={{ width: "10px", height: "10px" }}
                                                    />
                                                    <span>{estado.label}</span>
                                                    <span className="badge bg-light text-dark border">{estado.cantidad}</span>
                                                </div>
                                                <span className="fw-bold">{estado.porcentaje}%</span>
                                            </div>
                                            <div className="progress rounded-pill" style={{ height: "8px" }}>
                                                <div
                                                    className={`progress-bar ${estado.color} rounded-pill`}
                                                    style={{ width: `${estado.porcentaje}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm mt-4">
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <h5 className="mb-0 fw-semibold">
                            <i className="bi bi-building me-2 text-primary" />
                            Resumen por torres
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 crud-table">
                                <thead className="table-light">
                                    <tr>
                                        <th className="py-3 px-4">#</th>
                                        <th className="py-3 px-4">Torre</th>
                                        <th className="py-3 px-4 text-center">Pisos</th>
                                        <th className="py-3 px-4 text-center">Apartamentos</th>
                                        <th className="py-3 px-4">Condominio</th>
                                    </tr>
                                </thead>
                                <tbody className="crud-table-body">
                                    {resumenTorres.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-5">
                                                No hay torres registradas
                                            </td>
                                        </tr>
                                    ) : (
                                        resumenTorres.map((torre, index) => (
                                            <tr key={torre.id}>
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3 fw-semibold">{torre.nombre}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="badge bg-warning text-dark">{torre.n_pisos}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="badge bg-success">{torre.n_apartamentos}</span>
                                                </td>
                                                <td className="px-4 py-3">{torre.condominio}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
