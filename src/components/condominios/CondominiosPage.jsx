import React, { useState, useEffect, useMemo } from "react";
import { condominiosBase } from "../../data/condominiosData";
import CondominioCard from "./CondominioCard";
import CondominioAgregarCard from "./CondominioAgregarCard";

const carritosMock = [
    { id: 1, nombre: 'Carrito #1' },
    { id: 2, nombre: 'Carrito #2' },
    { id: 3, nombre: 'Carrito #3' },
    { id: 4, nombre: 'Carrito #4' },
];

const CondominiosPage = () => {
    const [prestamos, setPrestamos] = useState(() => {
        try {
            const saved = localStorage.getItem("prestamos");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const handleUpdate = () => {
            try {
                const saved = localStorage.getItem("prestamos");
                setPrestamos(saved ? JSON.parse(saved) : []);
            } catch {
                setPrestamos([]);
            }
        };
        window.addEventListener("prestamos-updated", handleUpdate);
        return () => window.removeEventListener("prestamos-updated", handleUpdate);
    }, []);

    const condominiosConStats = useMemo(() => {
        return condominiosBase.map(condo => {
            const carritosDelCondo = carritosMock.filter(c =>
                condo.carritoIds.includes(c.id)
            );
            const activos = carritosDelCondo.filter(c =>
                prestamos.some(p => p.id_carrito === c.id && p.estado === "activo")
            ).length;
            const enMantenimiento = carritosDelCondo.filter(c =>
                prestamos.some(p => p.id_carrito === c.id && p.estado === "mantenimiento")
            ).length;
            return {
                ...condo,
                carritosActivos: activos,
                carritosMantenimiento: enMantenimiento,
            };
        });
    }, [prestamos]);

    return (
        <div className="page-heading">
            {/* Header */}
            <div className="page-title">
                <div className="row align-items-center mb-3">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3 className="mb-1">Condominios</h3>
                        <p className="text-subtitle text-muted mb-0">
                            Administra tu portafolio de propiedades y monitorea la logística activa.
                        </p>
                    </div>
                    <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2 mt-2 mt-md-0 flex-wrap">
                        <button
                            className="btn btn-light d-flex align-items-center gap-2"
                            style={{ borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}
                        >
                            <i className="bi bi-funnel text-primary"></i>
                            <span className="text-uppercase" style={{ letterSpacing: "1px" }}>
                                Filtrar Estado
                            </span>
                        </button>
                        <button
                            className="btn btn-light d-flex align-items-center gap-2"
                            style={{ borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}
                        >
                            <i className="bi bi-calendar text-primary"></i>
                            <span className="text-uppercase" style={{ letterSpacing: "1px" }}>
                                Últimos 30 días
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid responsivo */}
            <section className="section">
                <div className="row g-3">
                    {condominiosConStats.map(condo => (
                        <div key={condo.id} className="col-12 col-md-6 col-xxl-4">
                            <CondominioCard
                                condominio={condo}
                                carritosActivos={condo.carritosActivos}
                                carritosMantenimiento={condo.carritosMantenimiento}
                            />
                        </div>
                    ))}
                    <div className="col-12 col-md-6 col-xxl-4">
                        <CondominioAgregarCard />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CondominiosPage;