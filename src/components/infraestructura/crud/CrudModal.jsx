const CrudModal = ({
    show,
    title,
    error,
    saving,
    onClose,
    onSave,
    editMode,
    children,
}) => {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title fw-semibold">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose} disabled={saving} aria-label="Cerrar" />
                    </div>
                    <div className="modal-body pt-3">
                        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
                        {children}
                    </div>
                    <div className="modal-footer border-top-0 pt-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Guardando...
                                </>
                            ) : editMode ? (
                                "Guardar cambios"
                            ) : (
                                "Agregar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudModal;
