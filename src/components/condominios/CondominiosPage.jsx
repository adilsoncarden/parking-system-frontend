import React, { useState, useEffect } from 'react';
import CondominioCard from './CondominioCard';
import CondominioAgregarCard from './CondominioAgregarCard';
import CondominioModal from './CondominioModal';
import { condominioService } from "../../services/condominioService";

const CondominiosPage = () => {
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [condominioEditar, setCondominioEditar] = useState(null);
    const [prestamosActivos, setPrestamosActivos] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            const data = await condominioService.getAll();
            setCondominios(data);
            setLoading(false);
        };
        cargar();
    }, []);

    // Sincroniza préstamos activos con localStorage
    useEffect(() => {
        const actualizarPrestamos = () => {
            const stored = JSON.parse(localStorage.getItem("prestamos") || "[]");
            const activos = stored.filter(p => p.estado === "activo");
            setPrestamosActivos(activos);
        };
        actualizarPrestamos();
        window.addEventListener("prestamos-updated", actualizarPrestamos);
        return () => window.removeEventListener("prestamos-updated", actualizarPrestamos);
    }, []);

    const handleAgregar = () => {
        setCondominioEditar(null);
        setShowModal(true);
    };

    const handleEditar = (condominio) => {
        setCondominioEditar(condominio);
        setShowModal(true);
    };

    const handleGuardar = async (datos) => {
        if (condominioEditar) {
            await condominioService.update(condominioEditar.id, datos);
        } else {
            await condominioService.create(datos);
        }
        const actualizado = await condominioService.getAll();
        setCondominios(actualizado);
        setShowModal(false);
    };

    if (loading) {
        return (
            <div className="page-heading">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Condominios</h3>
                        <p className="text-subtitle text-muted">
                            Administra tu portafolio de propiedades y monitorea la logística activa.
                        </p>
                    </div>
                </div>
            </div>

            <section className="section">
                <div className="row">
                    {condominios.map((condo) => (
                        <div className="col-12 col-md-6 col-lg-4 mb-4" key={condo.id}>
                            <CondominioCard
                                condominio={condo}
                                prestamosActivos={prestamosActivos}
                                onVerDetalles={() => handleEditar(condo)}
                            />
                        </div>
                    ))}

                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <CondominioAgregarCard onAgregar={handleAgregar} />
                    </div>
                </div>
            </section>

            <CondominioModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleGuardar}
                condominioEditar={condominioEditar}
            />
        </div>
    );
};

export default CondominiosPage;