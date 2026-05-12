import React from 'react';

const TorreModal = ({ drawer, form, setForm, setDrawer, save, condominios, onDelete }) => {
    return (
        <>
            <div className={`offcanvas offcanvas-end bg-theme-body border-start border-theme ${drawer.open ? 'show' : ''}`} style={{ width: '400px', visibility: drawer.open ? 'visible' : 'hidden' }}>
                <div className="offcanvas-header border-bottom border-theme">
                    <h5 className="fw-bold mb-0">{drawer.edit ? 'Gestionar' : 'Nueva'} Torre</h5>
                    <button className="btn-close" onClick={() => setDrawer({ ...drawer, open: false })}></button>
                </div>
                <div className="offcanvas-body p-4">
                    <form className="d-flex flex-column h-100" onSubmit={save}>
                        <div className="mb-3">
                            <label className="small fw-bold text-muted">NOMBRE</label>
                            <input className="form-control info-box bg-transparent" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                        </div>
                        <div className="mb-3">
                            <label className="small fw-bold text-muted">CONDOMINIO</label>
                            <select 
                                className="form-select info-box bg-transparent" 
                                value={form.id_condominio} 
                                onChange={e => setForm({ ...form, id_condominio: parseInt(e.target.value) })}
                                required
                            >
                                <option value="" disabled>Seleccione un condominio</option>
                                {condominios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        
                        <div className="mt-auto d-grid gap-2">
                            <button className="btn btn-brand py-3">{drawer.edit ? 'Actualizar' : 'Guardar'}</button>
                            {drawer.edit && (
                                <button type="button" className="btn btn-outline-danger py-2 fw-bold" onClick={() => onDelete(form.id)}>
                                    Eliminar
                                </button>
                            )}
                            <button className="btn btn-light py-2" type="button" onClick={() => setDrawer({ ...drawer, open: false })}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {drawer.open && <div className="offcanvas-backdrop fade show" onClick={() => setDrawer({ ...drawer, open: false })}></div>}
        </>
    );
};

export default TorreModal;
