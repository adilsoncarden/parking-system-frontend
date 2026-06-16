import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import { getApiErrorMessage } from "../../services/api";
import { authService } from "../../services/authService";
import { parkingService } from "../../services/parkingService";
import { usePagination } from "../../hooks/usePagination";
import CrudPagination from "../infraestructura/crud/CrudPagination";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);
    const [parking, setParking] = useState(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setError("");
                // Stats principales y de parking en PARALELO para reducir el tiempo de
                // carga a la mitad (antes iban en secuencia y sumaban su latencia).
                // El parking va en su propia promesa tolerante: si el usuario no tiene
                // permiso (403), se omite la sección sin romper el dashboard.
                const [stats, pk] = await Promise.all([
                    dashboardService.getStats(),
                    parkingService.getParkingStats().catch(() => null),
                ]);
                if (!cancelled) {
                    setData(stats);
                    setParking(pk);
                }
            } catch (err) {
                if (!cancelled && err?.code !== "NO_TOKEN" && err?.response?.status !== 401) {
                    setError(getApiErrorMessage(err, "Error al cargar el dashboard"));
                }
                if (!cancelled && !err?.response) {
                    setData({
                        estadisticas: [],
                        carritosStats: null,
                        tasaOcupacion: 0,
                        estadosData: [],
                        reportePisos: [],
                        resumenTorres: [],
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Paginador del "Resumen por torres" (10 por página). Se llama antes de los
    // early-returns para respetar las reglas de hooks; con data null usa lista vacía.
    const torresPag = usePagination(data?.resumenTorres ?? []);

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

    if (!data || !Array.isArray(data.estadisticas)) {
        return (
            <div className="page-heading">
                <div className="alert alert-warning mb-0">
                    No se pudieron cargar las estadísticas del dashboard.
                </div>
            </div>
        );
    }

    const {
        estadisticas,
        carritosStats,
        tasaOcupacion = 0,
        estadosData = [],
        reportePisos = [],
        resumenTorres = [],
    } = data;

    const carritosCards = carritosStats
        ? [
              {
                  label: "Total carritos",
                  valor: carritosStats.totalCarritos,
                  icon: "bi-cart-fill",
                  color: "bg-primary",
              },
              {
                  label: "Disponibles",
                  valor: carritosStats.carritosDisponibles,
                  icon: "bi-check-circle-fill",
                  color: "bg-success",
              },
              {
                  label: "En uso",
                  valor: carritosStats.carritosEnUso,
                  icon: "bi-arrow-left-right",
                  color: "bg-warning text-dark",
              },
              {
                  label: "Préstamos activos",
                  valor: carritosStats.prestamosActivos,
                  icon: "bi-clock-fill",
                  color: "bg-info",
              },
              {
                  label: "Penalizaciones activas",
                  valor: carritosStats.penalizacionesActivas,
                  icon: "bi-exclamation-triangle-fill",
                  color: "bg-danger",
              },
              {
                  label: "Recaudado (penalizaciones)",
                  valor: new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                  }).format(carritosStats.totalRecaudadoPenalizaciones),
                  icon: "bi-cash-coin",
                  color: "bg-secondary",
                  isText: true,
              },
          ]
        : [];

    const parkingCards = parking
        ? [
              { label: "Plazas totales", valor: parking.totalPlazas, icon: "bi-p-square-fill", color: "bg-dark" },
              { label: "Libres", valor: parking.plazasLibres, icon: "bi-check-circle-fill", color: "bg-success" },
              { label: "Ocupadas", valor: parking.plazasOcupadas, icon: "bi-car-front-fill", color: "bg-danger" },
              { label: "Vehículos", valor: parking.totalVehiculos, icon: "bi-car-front", color: "bg-primary" },
              { label: "Estancias activas", valor: parking.permanenciasActivas, icon: "bi-clock-fill", color: "bg-info" },
              { label: "Accesos hoy", valor: parking.accesosHoy, icon: "bi-box-arrow-in-right", color: "bg-secondary" },
          ]
        : [];

    const parkingOcupacion =
        parking && parking.totalPlazas > 0
            ? Math.round((parking.plazasOcupadas / parking.totalPlazas) * 100)
            : 0;

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
                                        className={`${stat.color} text-white rounded-3 d-flex align-items-center justify-content-center shrink-0`}
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

                {carritosCards.length > 0 && (
                    <>
                        <h5 className="fw-semibold mb-3">
                            <i className="bi bi-cart me-2 text-primary" />
                            Métricas de carritos
                        </h5>
                        <div className="row g-3 mb-4">
                            {carritosCards.map((stat) => (
                                <div className="col-6 col-lg-4 col-xl-2" key={stat.label}>
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body d-flex align-items-center gap-3 py-3 px-3">
                                            <div
                                                className={`${stat.color} text-white rounded-3 d-flex align-items-center justify-content-center shrink-0`}
                                                style={{ width: "2.75rem", height: "2.75rem" }}
                                            >
                                                <i className={`bi ${stat.icon}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-muted small mb-1 fw-medium text-truncate">
                                                    {stat.label}
                                                </p>
                                                <h5 className="mb-0 fw-bold">
                                                    {stat.isText ? stat.valor : stat.valor}
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {parkingCards.length > 0 && (
                    <>
                        <h5 className="fw-semibold mb-3">
                            <i className="bi bi-p-circle me-2 text-primary" />
                            Métricas de estacionamiento
                        </h5>
                        <div className="row g-3 mb-3">
                            {parkingCards.map((stat) => (
                                <div className="col-6 col-lg-4 col-xl-2" key={stat.label}>
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body d-flex align-items-center gap-3 py-3 px-3">
                                            <div
                                                className={`${stat.color} text-white rounded-3 d-flex align-items-center justify-content-center shrink-0`}
                                                style={{ width: "2.75rem", height: "2.75rem" }}
                                            >
                                                <i className={`bi ${stat.icon}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-muted small mb-1 fw-medium text-truncate">
                                                    {stat.label}
                                                </p>
                                                <h5 className="mb-0 fw-bold">{stat.valor}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body py-4 px-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-semibold">Ocupación de estacionamiento</span>
                                    <span className="badge bg-dark fs-6">{parkingOcupacion}%</span>
                                </div>
                                <div className="progress rounded-pill" style={{ height: "12px" }}>
                                    <div
                                        className="progress-bar bg-dark rounded-pill"
                                        style={{ width: `${parkingOcupacion}%` }}
                                        role="progressbar"
                                        aria-valuenow={parkingOcupacion}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    />
                                </div>
                                <small className="text-muted">
                                    {parking.plazasOcupadas} de {parking.totalPlazas} plazas ocupadas
                                </small>
                            </div>
                        </div>
                    </>
                )}

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
                                    {torresPag.totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-5">
                                                No hay torres registradas
                                            </td>
                                        </tr>
                                    ) : (
                                        torresPag.paginatedItems.map((torre, index) => (
                                            <tr key={torre.id}>
                                                <td className="px-4 py-3">{torresPag.rowIndex(index)}</td>
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
                        <CrudPagination
                            currentPage={torresPag.currentPage}
                            totalPages={torresPag.totalPages}
                            onPageChange={torresPag.setCurrentPage}
                            totalItems={torresPag.totalItems}
                            pageSize={torresPag.pageSize}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
