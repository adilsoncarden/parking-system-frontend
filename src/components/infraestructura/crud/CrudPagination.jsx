const CrudPagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
    if (totalItems <= pageSize) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 px-4">
            <small className="text-muted">
                Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} de {totalItems}
            </small>
            <nav aria-label="Paginación">
                <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            type="button"
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                    </li>
                    {pages.map((page) => (
                        <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                            <button
                                type="button"
                                className="page-link"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                            type="button"
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default CrudPagination;
