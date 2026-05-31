import CrudPagination from "./CrudPagination";

const CrudTableCard = ({
    title,
    filter,
    onAdd,
    addLabel = "Agregar",
    filtering,
    saving,
    columns,
    colSpan,
    emptyMessage,
    rows,
    pagination,
}) => (
    <div className="card shadow-sm border-0">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 px-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
                <h5 className="mb-0 fw-semibold">{title}</h5>
                {filter}
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={onAdd} disabled={saving}>
                <i className="bi bi-plus-lg me-1" />
                {addLabel}
            </button>
        </div>
        <div className="card-body position-relative p-0">
            {filtering && (
                <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                    style={{ zIndex: 2 }}
                >
                    <div className="spinner-border text-primary" role="status" />
                </div>
            )}
            <div className="table-responsive">
                <table className="table table-hover table-striped align-middle mb-0 crud-table">
                    <thead className="table-light">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className={`py-3 px-4 ${col.className || ""}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="crud-table-body">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="text-center text-muted py-5 px-4">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            rows
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {pagination && (
            <CrudPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.setCurrentPage}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
            />
        )}
    </div>
);

export default CrudTableCard;
