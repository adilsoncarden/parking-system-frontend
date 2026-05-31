import React, { useState, useEffect } from 'react';
import CondominioCard from './CondominioCard';
import CondominioAgregarCard from './CondominioAgregarCard';
import CondominioModal from './CondominioModal';
import { condominioService } from "../../services/condominioService";

const CondominiosPage = () => {
    const [condominios, setCondominios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [condominioEditar, setCondominioEditar] = useState(null);
    const [prestamosActivos, setPrestamosActivos] = useState([]);

    const cargar = async () => {
        try {
            setError('');
            const data = await condominioService.getAll();
            setCondominios(data);
        } catch (err) {
            setError(err.forbidden ? err.message : 'Error al cargar condominios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

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
        setSaving(true);
        setError('');
        try {
            if (condominioEditar) {
                await condominioService.update(condominioEditar.id, datos);
            } else {
                await condominioService.create(datos);
            }
            await cargar();
            setShowModal(false);
        } catch (err) {
            setError(err.forbidden ? err.message : 'Error al guardar el condominio');
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async () => {
        if (!condominioEditar || !window.confirm('¿Eliminar este condominio?')) return;
        setSaving(true);
        setError('');
        try {
            await condominioService.delete(condominioEditar.id);
            await cargar();
            setShowModal(false);
        } catch (err) {
            setError(err.forbidden ? err.message : 'Error al eliminar el condominio');
        } finally {
            setSaving(false);
        }
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

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

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
                onDelete={handleEliminar}
                condominioEditar={condominioEditar}
                saving={saving}
            />
        </div>
    );
};

export default CondominiosPage;
