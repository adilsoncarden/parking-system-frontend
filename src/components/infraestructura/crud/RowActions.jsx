const RowActions = ({ onEdit, onDelete, saving, canEdit = true, canDelete = true }) => (
    <td className="text-nowrap px-4 py-3">
        {canEdit && (
            <button
                type="button"
                className="btn btn-sm btn-outline-primary me-1"
                onClick={onEdit}
                disabled={saving}
                title="Editar"
            >
                <i className="bi bi-pencil" />
            </button>
        )}
        {canDelete && (
            <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={onDelete}
                disabled={saving}
                title="Eliminar"
            >
                <i className="bi bi-trash" />
            </button>
        )}
        {!canEdit && !canDelete && <span className="text-muted">—</span>}
    </td>
);

export default RowActions;
