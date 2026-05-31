const RowActions = ({ onEdit, onDelete, saving }) => (
    <td className="text-nowrap px-4 py-3">
        <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={onEdit} disabled={saving} title="Editar">
            <i className="bi bi-pencil" />
        </button>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onDelete} disabled={saving} title="Eliminar">
            <i className="bi bi-trash" />
        </button>
    </td>
);

export default RowActions;
