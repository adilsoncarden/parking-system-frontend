const CrudPageLayout = ({
    loading,
    title,
    subtitle,
    pageError,
    success,
    onDismissError,
    onDismissSuccess,
    children,
}) => {
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
            <div className="page-title mb-3">
                <h3 className="mb-1">{title}</h3>
                {subtitle && <p className="text-subtitle text-muted mb-0">{subtitle}</p>}
            </div>

            {pageError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {pageError}
                    <button type="button" className="btn-close" onClick={onDismissError} aria-label="Cerrar" />
                </div>
            )}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={onDismissSuccess} aria-label="Cerrar" />
                </div>
            )}

            <section className="section">{children}</section>
        </div>
    );
};

export default CrudPageLayout;
